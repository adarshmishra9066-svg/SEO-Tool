import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const clientId = searchParams.get('client_id')
  if (!clientId) return NextResponse.json({ error: 'client_id required' }, { status: 400 })

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()
  const { client_id, title, period_start, period_end, report_type } = body

  if (!client_id || !title) {
    return NextResponse.json({ error: 'client_id and title required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('reports')
    .insert({
      client_id,
      title,
      period_start: period_start ?? null,
      period_end: period_end ?? null,
      report_type: report_type ?? 'monthly',
      status: 'draft',
    } as any)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
