import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { AgencyRow } from '@/lib/database.types'

function r(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateMockGa4Data(websiteUrl: string) {
  const domain = (() => {
    try { return new URL(websiteUrl).hostname.replace('www.', '') } catch { return 'example.com' }
  })()

  const pages = [
    { path: '/', label: 'Homepage' },
    { path: '/services', label: 'Services' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
    { path: '/services/accounting', label: 'Accounting Services' },
    { path: '/services/tax', label: 'Tax Services' },
    { path: '/blog/beginners-guide', label: 'Beginners Guide' },
    { path: '/blog/top-tips', label: 'Top Tips' },
    { path: '/pricing', label: 'Pricing' },
    { path: '/case-studies', label: 'Case Studies' },
    { path: '/services/payroll', label: 'Payroll' },
    { path: '/blog/how-to-guide', label: 'How-To Guide' },
    { path: '/faq', label: 'FAQ' },
    { path: '/resources', label: 'Resources' },
    { path: '/services/bookkeeping', label: 'Bookkeeping' },
    { path: '/testimonials', label: 'Testimonials' },
    { path: '/blog/industry-news', label: 'Industry News' },
    { path: '/services/vat', label: 'VAT Returns' },
    { path: '/blog/tax-tips', label: 'Tax Tips' },
    { path: '/get-a-quote', label: 'Get a Quote' },
  ]

  return pages.map((page, i) => {
    const sessions = i < 5 ? r(800, 5000) : r(100, 800)
    const users = Math.round(sessions * (0.7 + Math.random() * 0.2))
    const engagementRate = 0.4 + Math.random() * 0.45
    const avgSessionDuration = r(60, 300)
    const conversions = page.path.includes('contact') || page.path.includes('quote')
      ? r(5, 40)
      : page.path.includes('service')
      ? r(1, 15)
      : r(0, 5)
    const bounceRate = 1 - engagementRate + (Math.random() * 0.1 - 0.05)

    return {
      client_id: '', // filled in later
      property_id: '', // filled in later
      page_path: `https://${domain}${page.path}`,
      page_title: page.label,
      sessions,
      users,
      new_users: Math.round(users * (0.5 + Math.random() * 0.4)),
      conversions,
      engagement_rate: Math.round(engagementRate * 1000) / 1000,
      bounce_rate: Math.max(0, Math.min(1, Math.round(bounceRate * 1000) / 1000)),
      avg_session_duration: avgSessionDuration,
      date: new Date().toISOString().split('T')[0],
    }
  })
}

// POST /api/ga4/connect
// Body: { client_id, property_id, property_name }
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

  let body: { client_id?: string; property_id?: string; property_name?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!body.client_id) {
    return NextResponse.json({ error: 'client_id is required' }, { status: 400 })
  }

  // Verify client belongs to agency
  const { data: clientData } = await supabase
    .from('clients')
    .select('id, website_url')
    .eq('id', body.client_id)
    .eq('agency_id', agency.id)
    .single()

  if (!clientData) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  const client = clientData as { id: string; website_url: string }

  // Upsert GA4 property
  const { data: property, error: propError } = await supabase
    .from('ga4_properties')
    .upsert(
      {
        client_id: client.id,
        property_id: body.property_id ?? `mock-${client.id}`,
        property_name: body.property_name ?? 'GA4 Property (Mock)',
        is_connected: false,
        last_synced: null,
      },
      { onConflict: 'client_id' }
    )
    .select()
    .single()

  if (propError) {
    return NextResponse.json({ error: propError.message }, { status: 500 })
  }

  const propertyId = (property as Record<string, unknown>).id as string

  // Generate + save mock landing page data
  const mockRows = generateMockGa4Data(client.website_url)

  // Delete old data
  await supabase.from('ga4_landing_page_data').delete().eq('client_id', client.id)

  // Insert mock data
  const insertRows = mockRows.map((row) => ({
    ...row,
    client_id: client.id,
    property_id: propertyId,
  }))

  const { error: insertError } = await supabase.from('ga4_landing_page_data').insert(insertRows)

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  // Mark as synced
  await supabase
    .from('ga4_properties')
    .update({ last_synced: new Date().toISOString() })
    .eq('id', propertyId)

  return NextResponse.json({
    success: true,
    property_id: propertyId,
    rows_synced: insertRows.length,
    message:
      'GA4 property saved with mock data. Connect real Google OAuth to sync live analytics.',
  })
}
