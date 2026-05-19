import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const clientId = searchParams.get('client_id')

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: rawAgency } = await supabase
    .from('agencies')
    .select('id')
    .eq('owner_id', user?.id ?? '')
    .single()
  const agency = rawAgency as { id: string } | null

  if (!agency) return NextResponse.json([])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  let query = db
    .from('calendar_items')
    .select('*, clients(name)')
    .eq('agency_id', agency.id)
    .order('due_date', { ascending: true })

  if (clientId) query = query.eq('client_id', clientId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()
  const {
    client_id, title, description, item_type,
    due_date, is_recurring, recurrence_pattern,
  } = body

  if (!title || !due_date) {
    return NextResponse.json({ error: 'title and due_date required' }, { status: 400 })
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: rawAgency } = await supabase
    .from('agencies')
    .select('id')
    .eq('owner_id', user?.id ?? '')
    .single()
  const agency = rawAgency as { id: string } | null

  if (!agency) return NextResponse.json({ error: 'Agency not found' }, { status: 404 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { data, error } = await db
    .from('calendar_items')
    .insert({
      agency_id: agency.id,
      client_id: client_id ?? null,
      title,
      description: description ?? null,
      item_type: item_type ?? null,
      due_date,
      is_recurring: is_recurring ?? false,
      recurrence_pattern: recurrence_pattern ?? null,
      status: 'pending',
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { data, error } = await db
    .from('calendar_items')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
