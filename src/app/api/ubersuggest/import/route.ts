import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { AgencyRow } from '@/lib/database.types'

type ImportType = 'keyword_ideas' | 'competitor_keywords' | 'backlinks' | 'site_audit'

// ─── Simple CSV parser ────────────────────────────────────────────────────────

function parseCSV(content: string): Array<Record<string, string>> {
  const lines = content.split('\n').filter((l) => l.trim())
  if (lines.length < 2) return []

  // Handle quoted fields with commas inside
  function parseLine(line: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    result.push(current.trim())
    return result
  }

  const headers = parseLine(lines[0]).map((h) => h.replace(/"/g, '').trim())

  return lines.slice(1).map((line) => {
    const values = parseLine(line).map((v) => v.replace(/"/g, '').trim())
    return headers.reduce(
      (obj, h, i) => ({ ...obj, [h]: values[i] ?? '' }),
      {} as Record<string, string>
    )
  })
}

// ─── Mappers per import type ──────────────────────────────────────────────────

function mapKeywordIdeas(
  row: Record<string, string>,
  mapping: Record<string, string>,
  clientId: string
) {
  const keyword = row[mapping.keyword] ?? row['Keyword'] ?? row['keyword'] ?? ''
  if (!keyword) return null

  return {
    client_id: clientId,
    keyword: keyword.toLowerCase().trim(),
    search_volume: parseInt(row[mapping.search_volume] ?? row['Volume'] ?? row['Search Volume'] ?? '0') || null,
    keyword_difficulty: parseInt(row[mapping.difficulty] ?? row['KD'] ?? row['Keyword Difficulty'] ?? '0') || null,
    cpc: parseFloat(row[mapping.cpc] ?? row['CPC'] ?? row['Cost Per Click'] ?? '0') || null,
    position: parseInt(row[mapping.position] ?? row['Position'] ?? '0') || null,
    page_url: row[mapping.page_url] ?? row['URL'] ?? row['Page'] ?? null,
    intent: row[mapping.intent] ?? row['Intent'] ?? row['Search Intent'] ?? null,
    source: 'ubersuggest',
    data: {},
  }
}

function mapBacklink(
  row: Record<string, string>,
  mapping: Record<string, string>,
  clientId: string
) {
  const website = row[mapping.website] ?? row['Domain'] ?? row['Source URL'] ?? row['Referring Domain'] ?? ''
  if (!website) return null

  return {
    client_id: clientId,
    website: website.toLowerCase().trim(),
    niche: row[mapping.niche] ?? row['Niche'] ?? null,
    domain_authority: parseInt(row[mapping.domain_authority] ?? row['DA'] ?? row['Domain Authority'] ?? '0') || null,
    domain_rating: parseInt(row[mapping.domain_rating] ?? row['DR'] ?? row['Domain Rating'] ?? '0') || null,
    estimated_traffic: parseInt(row[mapping.traffic] ?? row['Traffic'] ?? row['Est. Traffic'] ?? '0') || null,
    spam_score: parseInt(row[mapping.spam_score] ?? row['Spam Score'] ?? '0') || null,
    contact_email: row[mapping.contact_email] ?? row['Email'] ?? null,
    status: 'prospect_found' as const,
    risk_level: 'low' as const,
    checklist: {},
    data: {},
  }
}

function mapSiteAuditIssue(
  row: Record<string, string>,
  mapping: Record<string, string>,
  clientId: string
) {
  const title = row[mapping.title] ?? row['Issue'] ?? row['Error'] ?? row['Warning'] ?? ''
  if (!title) return null

  const severityRaw = (row[mapping.severity] ?? row['Severity'] ?? row['Priority'] ?? 'medium').toLowerCase()
  const severityMap: Record<string, string> = {
    critical: 'critical',
    high: 'high',
    error: 'high',
    warning: 'medium',
    notice: 'low',
    info: 'info',
    low: 'low',
    medium: 'medium',
  }
  const severity = (severityMap[severityRaw] ?? 'medium') as 'info' | 'low' | 'medium' | 'high' | 'critical'

  return {
    client_id: clientId,
    issue_type: row[mapping.issue_type] ?? row['Type'] ?? row['Category'] ?? 'technical',
    page_url: row[mapping.page_url] ?? row['URL'] ?? row['Page'] ?? null,
    severity,
    title: title.trim(),
    description: row[mapping.description] ?? row['Description'] ?? row['Details'] ?? null,
    fix_recommendation: row[mapping.fix] ?? row['Recommendation'] ?? row['Fix'] ?? null,
    status: 'open' as const,
  }
}

// POST /api/ubersuggest/import
export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: agencyData } = await supabase
    .from('agencies')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  const agency = agencyData as Pick<AgencyRow, 'id'> | null
  if (!agency) return NextResponse.json({ error: 'Agency not found' }, { status: 404 })

  // Parse multipart form data
  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const clientId = formData.get('client_id') as string | null
  const importType = formData.get('import_type') as ImportType | null
  const file = formData.get('file') as File | null
  const columnMappingRaw = formData.get('column_mapping') as string | null

  if (!clientId || !importType || !file) {
    return NextResponse.json(
      { error: 'client_id, import_type, and file are required' },
      { status: 400 }
    )
  }

  const validTypes: ImportType[] = ['keyword_ideas', 'competitor_keywords', 'backlinks', 'site_audit']
  if (!validTypes.includes(importType)) {
    return NextResponse.json({ error: `import_type must be one of: ${validTypes.join(', ')}` }, { status: 400 })
  }

  // Verify client belongs to agency
  const { data: clientData } = await supabase
    .from('clients')
    .select('id')
    .eq('id', clientId)
    .eq('agency_id', agency.id)
    .single()

  if (!clientData) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  // Read CSV content
  let csvContent: string
  try {
    csvContent = await file.text()
  } catch {
    return NextResponse.json({ error: 'Failed to read file' }, { status: 400 })
  }

  // Parse column mapping
  let columnMapping: Record<string, string> = {}
  if (columnMappingRaw) {
    try {
      columnMapping = JSON.parse(columnMappingRaw) as Record<string, string>
    } catch {
      // Use empty mapping — rely on header detection
    }
  }

  // Parse CSV
  const rows = parseCSV(csvContent)
  if (rows.length === 0) {
    return NextResponse.json({ error: 'No valid rows found in CSV' }, { status: 400 })
  }

  let processedCount = 0

  // ── Handle by import type ─────────────────────────────────────────────────

  if (importType === 'keyword_ideas' || importType === 'competitor_keywords') {
    const mappedRows = rows
      .map((row) => mapKeywordIdeas(row, columnMapping, clientId))
      .filter((r) => r !== null)

    if (mappedRows.length > 0) {
      // Insert in batches of 50
      for (let i = 0; i < mappedRows.length; i += 50) {
        const batch = mappedRows.slice(i, i + 50)
        const { error } = await supabase.from('keywords').insert(batch as Record<string, unknown>[])
        if (!error) processedCount += batch.length
      }
    }
  } else if (importType === 'backlinks') {
    const mappedRows = rows
      .map((row) => mapBacklink(row, columnMapping, clientId))
      .filter((r) => r !== null)

    if (mappedRows.length > 0) {
      for (let i = 0; i < mappedRows.length; i += 50) {
        const batch = mappedRows.slice(i, i + 50)
        const { error } = await supabase.from('backlink_prospects').insert(batch as Record<string, unknown>[])
        if (!error) processedCount += batch.length
      }
    }
  } else if (importType === 'site_audit') {
    const mappedRows = rows
      .map((row) => mapSiteAuditIssue(row, columnMapping, clientId))
      .filter((r) => r !== null)

    if (mappedRows.length > 0) {
      for (let i = 0; i < mappedRows.length; i += 50) {
        const batch = mappedRows.slice(i, i + 50)
        const { error } = await supabase.from('technical_issues').insert(batch as Record<string, unknown>[])
        if (!error) processedCount += batch.length
      }
    }
  }

  // ── Save import record ────────────────────────────────────────────────────

  const { data: importRecord, error: importError } = await supabase
    .from('ubersuggest_imports')
    .insert({
      client_id: clientId,
      import_type: importType,
      filename: file.name,
      rows_total: rows.length,
      rows_processed: processedCount,
      column_mapping: columnMapping,
      status: processedCount > 0 ? 'completed' : 'failed',
    })
    .select()
    .single()

  if (importError) {
    console.error('[ubersuggest/import] Failed to save import record:', importError)
  }

  return NextResponse.json({
    success: processedCount > 0,
    processed_count: processedCount,
    total_rows: rows.length,
    import_id: importRecord ? (importRecord as Record<string, unknown>).id : null,
  })
}
