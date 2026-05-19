import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  startSiteAudit,
  getSiteAuditStatus,
  getSiteAuditResults,
} from '@/lib/ubersuggest/client'

function getDomain(url: string): string {
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`)
    return u.hostname.replace(/^www\./, '')
  } catch {
    return url.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0]
  }
}

// Severity mapping from Ubersuggest issue categories
function getSeverity(category: 'errors' | 'warnings' | 'recommendations') {
  if (category === 'errors') return 'critical'
  if (category === 'warnings') return 'high'
  return 'medium'
}

// POST — start (or re-run) a site audit
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { client_id, recrawl = false } = body

    if (!client_id) return NextResponse.json({ error: 'client_id required' }, { status: 400 })

    const supabase = await createClient()
    const { data: rawClient } = await supabase
      .from('clients')
      .select('id, website_url')
      .eq('id', client_id)
      .single()

    const client = rawClient as { id: string; website_url: string } | null
    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 })

    const domain = getDomain(client.website_url)

    const status = await startSiteAudit(domain, recrawl)

    return NextResponse.json({
      success: true,
      domain,
      done: status.done,
      crawl_count: status.crawl_count ?? 0,
      crawl_max_pages: status.crawl_max_pages ?? 150,
      report: status.report ?? null,
    })
  } catch (err) {
    console.error('[ubersuggest/audit POST]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Audit failed' },
      { status: 500 }
    )
  }
}

// GET — poll audit status; if done, save issues to DB
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('client_id')
    const domain = searchParams.get('domain')
    const save = searchParams.get('save') === 'true'

    if (!clientId || !domain) {
      return NextResponse.json({ error: 'client_id and domain required' }, { status: 400 })
    }

    const status = await getSiteAuditStatus(domain)

    if (!status.done || !save) {
      return NextResponse.json({
        done: status.done,
        domain,
        crawl_count: status.crawl_count ?? 0,
        crawl_max_pages: status.crawl_max_pages ?? 150,
        report: status.report ?? null,
      })
    }

    // Audit complete — save issues to technical_issues table
    const supabase = await createClient()
    const issues = status.report?.issues_per_category ?? {}
    const categories = ['errors', 'warnings', 'recommendations'] as const

    // Delete old Ubersuggest-sourced issues for this client
    await (supabase as any)
      .from('technical_issues')
      .delete()
      .eq('client_id', clientId)
      .eq('source', 'ubersuggest')

    const toInsert: Record<string, unknown>[] = []

    for (const category of categories) {
      const items = issues[category] ?? []
      for (const issue of items.slice(0, 20)) {
        // Fetch affected pages for the first 5 errors (to keep API calls manageable)
        let pageUrl: string | null = null
        if (category === 'errors' && toInsert.length < 5) {
          try {
            const result = await getSiteAuditResults(domain, issue.id)
            pageUrl = result.breakdown?.[0]?.url ?? null
          } catch { /* skip */ }
        }

        toInsert.push({
          client_id: clientId,
          issue_type: issue.id,
          title: (issue.title ?? issue.id).replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
          description: `${issue.count} page${issue.count !== 1 ? 's' : ''} affected`,
          severity: getSeverity(category),
          status: 'open',
          page_url: pageUrl,
          fix_recommendation: null,
          source: 'ubersuggest',
        })
      }
    }

    if (toInsert.length > 0) {
      await (supabase as any).from('technical_issues').insert(toInsert)
    }

    // Update client health score from audit
    const healthScore = status.report?.overview?.health_score
    if (healthScore !== undefined) {
      await (supabase as any)
        .from('clients')
        .update({ seo_health_score: Math.round(healthScore) })
        .eq('id', clientId)
    }

    return NextResponse.json({
      done: true,
      domain,
      issues_saved: toInsert.length,
      health_score: healthScore ?? null,
      report: status.report ?? null,
    })
  } catch (err) {
    console.error('[ubersuggest/audit GET]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Status check failed' },
      { status: 500 }
    )
  }
}
