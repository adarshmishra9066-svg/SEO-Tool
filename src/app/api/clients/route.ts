import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { CreateClientInput } from '@/lib/database.types'

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { data: agency } = await supabase
    .from('agencies')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!agency) {
    return NextResponse.json({ error: 'Agency not found' }, { status: 404 })
  }

  const { data: clients, error } = await supabase
    .from('clients')
    .select('*')
    .eq('agency_id', agency.id)
    .order('name', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(clients)
}

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { data: agency } = await supabase
    .from('agencies')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!agency) {
    return NextResponse.json({ error: 'Agency not found' }, { status: 404 })
  }

  let body: CreateClientInput & { agency_id?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!body.name || !body.website_url) {
    return NextResponse.json(
      { error: 'name and website_url are required' },
      { status: 400 }
    )
  }

  const { data: client, error } = await supabase
    .from('clients')
    .insert({
      agency_id: agency.id,
      name: body.name,
      website_url: body.website_url,
      industry: body.industry ?? null,
      target_location: body.target_location ?? null,
      services_products: body.services_products ?? null,
      main_goals: body.main_goals ?? null,
      primary_conversion_goal: body.primary_conversion_goal ?? null,
      secondary_conversion_goals: body.secondary_conversion_goals ?? null,
      target_audience: body.target_audience ?? null,
      brand_tone: body.brand_tone ?? null,
      content_style_notes: body.content_style_notes ?? null,
      client_expectations_notes: body.client_expectations_notes ?? null,
      retainer_value: body.retainer_value ?? null,
      priority_level: body.priority_level ?? 'medium',
      client_status: body.client_status ?? 'active',
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(client, { status: 201 })
}
