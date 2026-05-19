import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const clientId = searchParams.get('client_id')
  if (!clientId) return NextResponse.json({ error: 'client_id required' }, { status: 400 })

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('internal_link_suggestions')
    .select('*')
    .eq('client_id', clientId)
    .order('priority', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()
  const { client_id, source_page_url, target_page_url, suggested_anchor_text, reason, priority } = body

  if (!client_id || !source_page_url || !target_page_url) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('internal_link_suggestions')
    .insert({
      client_id,
      source_page_url,
      target_page_url,
      suggested_anchor_text: suggested_anchor_text ?? null,
      reason: reason ?? null,
      priority: priority ?? 'medium',
      status: 'suggested',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PUT(request: Request) {
  const supabase = await createClient()
  const body = await request.json()
  const { id, status } = body

  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const { data, error } = await supabase
    .from('internal_link_suggestions')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
