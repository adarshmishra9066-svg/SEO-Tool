import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculatePriorityScore, detectPageType } from '@/lib/scoring/priority-engine'
import { generateSeoOpportunities } from '@/lib/ai/functions'
import type { AgencyRow, GscQueryData } from '@/lib/database.types'

// ─── Expected CTR by position (for gap detection) ─────────────────────────────

function getExpectedCtr(position: number): number {
  const ctrs = [0.32, 0.17, 0.11, 0.08, 0.06, 0.05, 0.04, 0.04, 0.03, 0.03]
  const idx = Math.max(0, Math.min(9, Math.floor(position) - 1))
  return ctrs[idx]
}

// ─── Rule-based opportunity detection ────────────────────────────────────────

function detectOpportunities(
  gscData: GscQueryData[],
  ga4Map: Map<string, { sessions: number; conversions: number; engagement_rate: number }>,
  clientId: string
) {
  const opportunities: Array<{
    client_id: string
    type: string
    title: string
    description: string
    priority_score: number
    impact: 'low' | 'medium' | 'high' | 'very_high'
    effort: 'low' | 'medium' | 'high'
    urgency: 'low' | 'medium' | 'high' | 'critical'
    related_page_url: string | null
    related_keyword: string | null
    data: Record<string, unknown>
    status: 'new'
  }> = []

  // ── Quick wins: position 4-15, impressions > 200 ──────────────────────────
  const quickWins = gscData
    .filter((d) => d.position >= 4 && d.position <= 15 && d.impressions > 200)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 5)

  for (const qw of quickWins) {
    const ga4 = qw.page ? ga4Map.get(qw.page) : null
    const pageType = qw.page ? detectPageType(qw.page) : null

    const scoring = calculatePriorityScore({
      position: qw.position,
      impressions: qw.impressions,
      clicks: qw.clicks,
      ctr: qw.ctr,
      conversions: ga4?.conversions ?? null,
      engagementRate: ga4?.engagement_rate ?? null,
      pageType,
      effort: 'low',
      contentAge: null,
      hasBacklinks: false,
      competitorCount: 0,
    })

    const pos = Math.round(qw.position * 10) / 10
    const expectedCtr = getExpectedCtr(qw.position)
    const ctrGap = expectedCtr - qw.ctr

    opportunities.push({
      client_id: clientId,
      type: 'quick_win',
      title: `Quick win: "${qw.query}" ranks position ${pos}`,
      description: `The query "${qw.query}" has ${qw.impressions.toLocaleString()} monthly impressions at position ${pos} with only ${(qw.ctr * 100).toFixed(1)}% CTR. ${ctrGap > 0.03 ? `Expected CTR at this position is ~${(expectedCtr * 100).toFixed(0)}% — a title tag and meta description rewrite could significantly lift clicks.` : 'Optimising on-page signals could push this into the top 3.'}`,
      priority_score: scoring.priorityScore,
      impact: scoring.impact,
      effort: 'low',
      urgency: scoring.urgency,
      related_page_url: qw.page,
      related_keyword: qw.query,
      data: { position: qw.position, impressions: qw.impressions, clicks: qw.clicks, ctr: qw.ctr },
      status: 'new' as const,
    })
  }

  // ── CTR gaps: impressions > 500, CTR well below benchmark ─────────────────
  const ctrGaps = gscData
    .filter((d) => {
      if (d.impressions < 500) return false
      const expected = getExpectedCtr(d.position)
      return expected - d.ctr > 0.05
    })
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 4)

  for (const cg of ctrGaps) {
    // Avoid duplicating quick wins
    const alreadyAdded = opportunities.some(
      (o) => o.related_keyword === cg.query && o.type === 'quick_win'
    )
    if (alreadyAdded) continue

    const expectedCtr = getExpectedCtr(cg.position)
    const ga4 = cg.page ? ga4Map.get(cg.page) : null
    const pageType = cg.page ? detectPageType(cg.page) : null
    const expectedClicks = Math.round(cg.impressions * expectedCtr)
    const currentClicks = cg.clicks
    const uplift = expectedClicks - currentClicks

    const scoring = calculatePriorityScore({
      position: cg.position,
      impressions: cg.impressions,
      clicks: cg.clicks,
      ctr: cg.ctr,
      conversions: ga4?.conversions ?? null,
      engagementRate: ga4?.engagement_rate ?? null,
      pageType,
      effort: 'low',
      contentAge: null,
      hasBacklinks: false,
      competitorCount: 0,
    })

    opportunities.push({
      client_id: clientId,
      type: 'ctr_gap',
      title: `CTR gap: "${cg.query}" — ${(cg.ctr * 100).toFixed(1)}% vs ${(expectedCtr * 100).toFixed(0)}% expected`,
      description: `"${cg.query}" appears ${cg.impressions.toLocaleString()} times in search results at position ${Math.round(cg.position)} but only gets ${(cg.ctr * 100).toFixed(1)}% CTR against a benchmark of ${(expectedCtr * 100).toFixed(0)}%. Fixing the title tag and meta description could add ~${uplift.toLocaleString()} clicks per month.`,
      priority_score: scoring.priorityScore,
      impact: scoring.impact,
      effort: 'low',
      urgency: scoring.urgency,
      related_page_url: cg.page,
      related_keyword: cg.query,
      data: {
        position: cg.position,
        impressions: cg.impressions,
        ctr: cg.ctr,
        expected_ctr: expectedCtr,
        estimated_click_uplift: uplift,
      },
      status: 'new' as const,
    })
  }

  // ── High impression, low clicks ───────────────────────────────────────────
  const highImpLowClick = gscData
    .filter((d) => d.impressions > 1000 && d.clicks < 50 && d.position < 20)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 3)

  for (const hi of highImpLowClick) {
    const alreadyAdded = opportunities.some((o) => o.related_keyword === hi.query)
    if (alreadyAdded) continue

    const scoring = calculatePriorityScore({
      position: hi.position,
      impressions: hi.impressions,
      clicks: hi.clicks,
      ctr: hi.ctr,
      conversions: null,
      engagementRate: null,
      pageType: hi.page ? detectPageType(hi.page) : null,
      effort: 'medium',
      contentAge: null,
      hasBacklinks: false,
      competitorCount: 2,
    })

    opportunities.push({
      client_id: clientId,
      type: 'ctr_gap',
      title: `High visibility, low traffic: "${hi.query}"`,
      description: `"${hi.query}" gets ${hi.impressions.toLocaleString()} impressions per month but only ${hi.clicks} clicks (${(hi.ctr * 100).toFixed(1)}% CTR). At position ${Math.round(hi.position)}, this represents a significant missed traffic opportunity.`,
      priority_score: scoring.priorityScore,
      impact: scoring.impact,
      effort: 'medium',
      urgency: scoring.urgency,
      related_page_url: hi.page,
      related_keyword: hi.query,
      data: { impressions: hi.impressions, clicks: hi.clicks, position: hi.position },
      status: 'new' as const,
    })
  }

  // ── Deduplicate by keyword ─────────────────────────────────────────────────
  const seen = new Set<string>()
  return opportunities.filter((o) => {
    const key = `${o.type}:${o.related_keyword ?? o.title}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

// ─── GET /api/opportunities?client_id=xxx ─────────────────────────────────────

export async function GET(request: Request) {
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

  const { searchParams } = new URL(request.url)
  const clientId = searchParams.get('client_id')

  let query = supabase
    .from('opportunities')
    .select('*')
    .order('priority_score', { ascending: false })

  if (clientId) {
    // Verify client belongs to agency
    const { data: clientCheck } = await supabase
      .from('clients')
      .select('id')
      .eq('id', clientId)
      .eq('agency_id', agency.id)
      .single()

    if (!clientCheck) return NextResponse.json({ error: 'Client not found' }, { status: 404 })

    query = query.eq('client_id', clientId)
  } else {
    // Filter to this agency's clients
    const { data: clientsData } = await supabase
      .from('clients')
      .select('id')
      .eq('agency_id', agency.id)

    const clientIds = (clientsData ?? []).map((c: Record<string, unknown>) => c.id as string)
    if (clientIds.length === 0) return NextResponse.json([])
    query = query.in('client_id', clientIds)
  }

  const { data: opportunities, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(opportunities ?? [])
}

// ─── POST /api/opportunities — generate opportunities for a client ────────────

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

  let body: { client_id?: string; use_ai?: boolean }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!body.client_id) {
    return NextResponse.json({ error: 'client_id is required' }, { status: 400 })
  }

  // Verify + fetch client
  const { data: clientData } = await supabase
    .from('clients')
    .select('*')
    .eq('id', body.client_id)
    .eq('agency_id', agency.id)
    .single()

  if (!clientData) return NextResponse.json({ error: 'Client not found' }, { status: 404 })

  const client = clientData as {
    id: string
    name: string
    website_url: string
    industry: string | null
  }

  // Fetch GSC data
  const { data: gscRaw } = await supabase
    .from('gsc_query_data')
    .select('*')
    .eq('client_id', client.id)
    .order('impressions', { ascending: false })
    .limit(100)

  const gscData = (gscRaw ?? []) as GscQueryData[]

  // Fetch GA4 data
  const { data: ga4Raw } = await supabase
    .from('ga4_landing_page_data')
    .select('*')
    .eq('client_id', client.id)

  const ga4Data = (ga4Raw ?? []) as Array<{
    page_path: string
    sessions: number
    conversions: number
    engagement_rate: number
  }>

  // Build GA4 lookup map
  const ga4Map = new Map(
    ga4Data.map((d) => [d.page_path, { sessions: d.sessions, conversions: d.conversions, engagement_rate: d.engagement_rate }])
  )

  // Fetch competitors
  const { data: competitorsRaw } = await supabase
    .from('competitors')
    .select('url')
    .eq('client_id', client.id)

  const competitors = (competitorsRaw ?? []).map((c: Record<string, unknown>) => c.url as string)

  // ── Rule-based detection ─────────────────────────────────────────────────
  const ruleBasedOpportunities = detectOpportunities(gscData, ga4Map, client.id)

  // ── Save rule-based opportunities ────────────────────────────────────────
  let savedCount = 0
  if (ruleBasedOpportunities.length > 0) {
    // Clear existing 'new' opportunities to avoid duplication
    await supabase
      .from('opportunities')
      .delete()
      .eq('client_id', client.id)
      .eq('status', 'new')

    const { data: saved, error: saveError } = await supabase
      .from('opportunities')
      .insert(ruleBasedOpportunities as any)
      .select()

    if (saveError) {
      console.error('[opportunities] Save error:', saveError)
    } else {
      savedCount = (saved ?? []).length
    }
  }

  // ── Optional AI-enhanced opportunities ──────────────────────────────────
  let aiOpportunities: typeof ruleBasedOpportunities = []

  if (body.use_ai && process.env.ANTHROPIC_API_KEY && gscData.length > 0) {
    try {
      const aiResults = await generateSeoOpportunities({
        clientName: client.name,
        websiteUrl: client.website_url,
        industry: client.industry,
        gscData: gscData.slice(0, 30).map((d) => ({
          query: d.query,
          page: d.page,
          clicks: d.clicks,
          impressions: d.impressions,
          ctr: d.ctr,
          position: d.position,
        })),
        ga4Data: ga4Data.slice(0, 20).map((d) => ({
          page_path: d.page_path,
          sessions: d.sessions,
          conversions: d.conversions,
          engagement_rate: d.engagement_rate,
        })),
        topPages: [...new Set(gscData.slice(0, 10).map((d) => d.page).filter(Boolean) as string[])],
        competitors,
      })

      const aiInserts = aiResults.map((ai) => ({
        client_id: client.id,
        type: ai.type,
        title: ai.title,
        description: ai.description,
        priority_score: ai.priority_score,
        impact: ai.impact,
        effort: ai.effort,
        urgency: ai.urgency,
        related_page_url: ai.related_page_url,
        related_keyword: ai.related_keyword,
        data: { source: 'ai', recommended_action: ai.recommended_action },
        status: 'new' as const,
      }))

      if (aiInserts.length > 0) {
        const { data: aiSaved } = await supabase
          .from('opportunities')
          .insert(aiInserts as any)
          .select()
        aiOpportunities = aiSaved ?? []
        savedCount += (aiSaved ?? []).length
      }
    } catch (err) {
      console.error('[opportunities] AI generation error:', err)
    }
  }

  return NextResponse.json({
    success: true,
    generated_count: savedCount,
    rule_based_count: ruleBasedOpportunities.length,
    ai_count: aiOpportunities.length,
    has_gsc_data: gscData.length > 0,
    message:
      gscData.length === 0
        ? 'No GSC data found. Sync GSC first to generate opportunities.'
        : `Generated ${savedCount} opportunities.`,
  })
}
