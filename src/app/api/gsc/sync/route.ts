import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { AgencyRow } from '@/lib/database.types'

// Industry-average CTR lookup
function getRealisticCtr(position: number): number {
  const ctrs = [0.32, 0.17, 0.11, 0.08, 0.06, 0.05, 0.04, 0.04, 0.03, 0.03]
  const idx = Math.max(0, Math.min(9, Math.floor(position) - 1))
  const base = ctrs[idx]
  // Add ±30% variance
  const variance = base * (0.7 + Math.random() * 0.6)
  return Math.round(variance * 1000) / 1000
}

function r(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateMockGscData(websiteUrl: string, industry: string | null) {
  const domain = (() => {
    try { return new URL(websiteUrl).hostname.replace('www.', '') } catch { return 'example.com' }
  })()

  const ind = (industry ?? 'business').toLowerCase()

  // Build realistic keyword sets per industry
  const keywordSets: Record<string, string[]> = {
    accounting: [
      `accountant ${domain.split('.')[0]}`, 'accounting services', 'tax accountant near me',
      'small business accountant', 'bookkeeping services', 'payroll services',
      'vat returns accountant', 'corporation tax advice', 'self assessment tax return',
      'management accounts', 'xero accountant', 'quickbooks accounting',
    ],
    law: [
      'solicitor near me', 'personal injury solicitor', 'family law solicitor',
      'employment lawyer', 'conveyancing solicitor', 'immigration lawyer',
      'no win no fee solicitor', 'litigation lawyer', 'contract lawyer',
      'commercial solicitor',
    ],
    marketing: [
      'digital marketing agency', 'seo agency', 'ppc management',
      'social media marketing', 'content marketing services', 'email marketing',
      'google ads management', 'facebook ads agency', 'web design company',
      'brand strategy agency',
    ],
    default: [
      `${ind} services`, `best ${ind} company`, `${ind} near me`,
      `affordable ${ind}`, `${ind} experts`, `professional ${ind}`,
      `top ${ind} provider`, `${ind} solutions`, `${ind} consultancy`,
      `local ${ind} services`,
    ],
  }

  const serviceKeywords = keywordSets[ind] ?? keywordSets.default
  const brandedKeywords = [domain, `${domain.split('.')[0]} services`, `${domain.split('.')[0]} reviews`]

  // Pages on the site
  const pages = [
    `https://${domain}/`,
    `https://${domain}/services`,
    `https://${domain}/about`,
    `https://${domain}/contact`,
    `https://${domain}/services/accounting`,
    `https://${domain}/services/tax`,
    `https://${domain}/blog/beginners-guide`,
    `https://${domain}/blog/top-tips`,
    `https://${domain}/pricing`,
    `https://${domain}/case-studies`,
  ]

  const rows: Array<{
    query: string
    page: string
    clicks: number
    impressions: number
    ctr: number
    position: number
    device: string
    country: string
    date: string
  }> = []

  const today = new Date()
  const dateStr = today.toISOString().split('T')[0]

  // Branded queries — typically high CTR, good position
  brandedKeywords.forEach((kw, i) => {
    const pos = r(1, 3)
    const impressions = r(200, 1500)
    const ctr = getRealisticCtr(pos) * (1 + Math.random() * 0.5)
    const clicks = Math.round(impressions * Math.min(ctr, 0.9))
    rows.push({
      query: kw,
      page: pages[0],
      clicks,
      impressions,
      ctr: Math.round(ctr * 1000) / 1000,
      position: pos + Math.random() * 0.5,
      device: ['DESKTOP', 'MOBILE'][i % 2],
      country: 'GBR',
      date: dateStr,
    })
  })

  // Service/non-branded queries — various positions, mix of quick wins and hard battles
  const quickWinPositions = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
  const longShotPositions = [22, 28, 33, 40, 45]

  serviceKeywords.forEach((kw, i) => {
    const isQuickWin = i < 6
    const positions = isQuickWin ? quickWinPositions : longShotPositions
    const pos = positions[r(0, positions.length - 1)] + Math.random() * 0.9
    const impressions = isQuickWin ? r(300, 8000) : r(50, 500)
    const ctr = getRealisticCtr(pos)
    const clicks = Math.max(0, Math.round(impressions * ctr))
    const pageIdx = r(0, pages.length - 1)

    rows.push({
      query: kw,
      page: pages[pageIdx],
      clicks,
      impressions,
      ctr: Math.round(ctr * 1000) / 1000,
      position: Math.round(pos * 10) / 10,
      device: ['DESKTOP', 'MOBILE', 'TABLET'][r(0, 2)],
      country: 'GBR',
      date: dateStr,
    })
  })

  // High impression / low CTR outliers (good CTR gap opportunities)
  const ctrGapKeywords = [
    `${ind} services london`, `${ind} company uk`, `best ${ind} services`,
    `${ind} pricing`, `how to choose a ${ind}`,
  ]
  ctrGapKeywords.forEach((kw) => {
    const pos = r(5, 12) + Math.random()
    const impressions = r(1000, 5000)
    // Deliberately very low CTR
    const ctr = getRealisticCtr(pos) * 0.25
    const clicks = Math.round(impressions * ctr)
    rows.push({
      query: kw,
      page: pages[r(0, 4)],
      clicks,
      impressions,
      ctr: Math.round(ctr * 1000) / 1000,
      position: Math.round(pos * 10) / 10,
      device: 'DESKTOP',
      country: 'GBR',
      date: dateStr,
    })
  })

  // Some long-tail blog queries
  const blogKeywords = [
    `how to ${ind}`, `${ind} tips for small businesses`, `what is ${ind}`,
    `${ind} checklist`, `${ind} guide 2025`, `common ${ind} mistakes`,
  ]
  blogKeywords.forEach((kw) => {
    const pos = r(8, 35) + Math.random()
    const impressions = r(100, 2000)
    const ctr = getRealisticCtr(pos)
    const clicks = Math.round(impressions * ctr)
    rows.push({
      query: kw,
      page: pages[r(6, 9)],
      clicks,
      impressions,
      ctr: Math.round(ctr * 1000) / 1000,
      position: Math.round(pos * 10) / 10,
      device: ['DESKTOP', 'MOBILE'][r(0, 1)],
      country: 'GBR',
      date: dateStr,
    })
  })

  return rows.slice(0, 50)
}

// POST /api/gsc/sync
// Body: { client_id }
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

  let body: { client_id?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!body.client_id) {
    return NextResponse.json({ error: 'client_id is required' }, { status: 400 })
  }

  // Verify client + fetch details
  const { data: clientData } = await supabase
    .from('clients')
    .select('id, name, website_url, industry')
    .eq('id', body.client_id)
    .eq('agency_id', agency.id)
    .single()

  if (!clientData) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  const client = clientData as { id: string; name: string; website_url: string; industry: string | null }

  // Get or create GSC property
  let { data: propData } = await supabase
    .from('gsc_properties')
    .select('id')
    .eq('client_id', client.id)
    .single()

  if (!propData) {
    const { data: newProp } = await supabase
      .from('gsc_properties')
      .insert({
        client_id: client.id,
        property_url: client.website_url,
        is_connected: false,
        last_synced: null,
      })
      .select()
      .single()
    propData = newProp
  }

  if (!propData) {
    return NextResponse.json({ error: 'Failed to create GSC property' }, { status: 500 })
  }

  const propertyId = (propData as Record<string, unknown>).id as string

  // Generate mock data
  const mockRows = generateMockGscData(client.website_url, client.industry)

  // Delete old data for this client
  await supabase.from('gsc_query_data').delete().eq('client_id', client.id)

  // Insert new mock data
  const insertRows = mockRows.map((row) => ({
    client_id: client.id,
    property_id: propertyId,
    query: row.query,
    page: row.page,
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: row.ctr,
    position: row.position,
    device: row.device,
    country: row.country,
    date: row.date,
  }))

  const { error: insertError } = await supabase.from('gsc_query_data').insert(insertRows)

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  // Mark property as synced
  await supabase
    .from('gsc_properties')
    .update({ last_synced: new Date().toISOString() })
    .eq('id', propertyId)

  return NextResponse.json({
    success: true,
    rows_synced: insertRows.length,
    note: 'Using mock GSC data for demo purposes. Connect real Google OAuth to sync live data.',
  })
}
