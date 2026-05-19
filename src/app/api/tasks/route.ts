import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { AgencyRow, TaskRow, CreateTaskInput } from '@/lib/database.types'

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
  const clientId = searchParams.get('clientId')
  const status = searchParams.get('status')

  let query = supabase
    .from('tasks')
    .select('*, client:clients(id, name)')
    .eq('agency_id', agency.id)
    .order('priority_score', { ascending: false })

  if (clientId) query = query.eq('client_id', clientId)
  if (status) query = query.eq('status', status)

  const { data: tasks, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(tasks)
}

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

  let body: CreateTaskInput & { priority_score?: number }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!body.title || !body.task_type || !body.client_id) {
    return NextResponse.json(
      { error: 'title, task_type, and client_id are required' },
      { status: 400 }
    )
  }

  // Verify client belongs to agency
  const { data: clientData } = await supabase
    .from('clients')
    .select('id')
    .eq('id', body.client_id)
    .eq('agency_id', agency.id)
    .single()

  const clientCheck = clientData as Pick<AgencyRow, 'id'> | null
  if (!clientCheck) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  const insertData: Partial<TaskRow> = {
    agency_id: agency.id,
    client_id: body.client_id,
    title: body.title,
    description: body.description ?? null,
    task_type: body.task_type,
    priority_score: body.priority_score ?? 50,
    impact: body.impact ?? 'medium',
    effort: body.effort ?? 'medium',
    urgency: body.urgency ?? 'medium',
    due_date: body.due_date ?? null,
    related_page_url: body.related_page_url ?? null,
    related_keyword: body.related_keyword ?? null,
    recommended_action: body.recommended_action ?? null,
    notes: body.notes ?? null,
    status: 'new',
    checklist: [],
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: task, error } = await supabase
    .from('tasks')
    .insert(insertData as any)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(task, { status: 201 })
}
