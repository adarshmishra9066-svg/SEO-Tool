import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const clientId = searchParams.get('client_id')
  if (!clientId) return NextResponse.json({ error: 'client_id required' }, { status: 400 })

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('backlink_prospects')
    .select('*')
    .eq('client_id', clientId)
    .order('quality_score', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()

  const {
    client_id, website, niche, domain_authority, domain_rating,
    estimated_traffic, spam_score, contact_email, guest_post_page_url,
    target_page_url, anchor_text, notes, risk_level, price,
  } = body

  if (!client_id || !website) {
    return NextResponse.json({ error: 'client_id and website are required' }, { status: 400 })
  }

  // Simple quality score heuristic
  let quality = 50
  if (domain_authority && domain_authority >= 40) quality += 20
  if (estimated_traffic && estimated_traffic >= 1000) quality += 15
  if (spam_score !== undefined && spam_score <= 5) quality += 10
  if (niche) quality += 5
  quality = Math.min(100, quality)

  const { data, error } = await supabase
    .from('backlink_prospects')
    .insert({
      client_id,
      website,
      niche: niche ?? null,
      domain_authority: domain_authority ?? null,
      domain_rating: domain_rating ?? null,
      estimated_traffic: estimated_traffic ?? null,
      spam_score: spam_score ?? null,
      contact_email: contact_email ?? null,
      guest_post_page_url: guest_post_page_url ?? null,
      target_page_url: target_page_url ?? null,
      anchor_text: anchor_text ?? null,
      notes: notes ?? null,
      risk_level: risk_level ?? 'low',
      price: price ?? null,
      quality_score: quality,
      status: 'prospect_found',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PUT(request: Request) {
  const supabase = await createClient()
  const body = await request.json()
  const { id, ...updates } = body

  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const { data, error } = await supabase
    .from('backlink_prospects')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
