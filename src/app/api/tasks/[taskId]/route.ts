import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { AgencyRow } from '@/lib/database.types'

interface Params {
  params: Promise<{ taskId: string }>
}

export async function GET(_req: Request, { params }: Params) {
  const { taskId } = await params
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

  const { data: task, error } = await supabase
    .from('tasks')
    .select('*, client:clients(id, name)')
    .eq('id', taskId)
    .eq('agency_id', agency.id)
    .single()

  if (error || !task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  }

  return NextResponse.json(task)
}

export async function PUT(request: Request, { params }: Params) {
  const { taskId } = await params
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

  const { data: existingTask } = await supabase
    .from('tasks')
    .select('id')
    .eq('id', taskId)
    .eq('agency_id', agency.id)
    .single()

  if (!existingTask) return NextResponse.json({ error: 'Task not found' }, { status: 404 })

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { id: _id, agency_id: _aid, created_at: _ca, client: _cl, ...updateData } = body

  // If marking as completed, set completion date
  if (updateData.status === 'completed' && !updateData.completion_date) {
    updateData.completion_date = new Date().toISOString()
  }

  const payload = { ...updateData, updated_at: new Date().toISOString() }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tasksTable = supabase.from('tasks') as any
  const { data: updated, error } = await tasksTable
    .update(payload)
    .eq('id', taskId)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: Params) {
  const { taskId } = await params
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

  const { data: existingTask } = await supabase
    .from('tasks')
    .select('id')
    .eq('id', taskId)
    .eq('agency_id', agency.id)
    .single()

  if (!existingTask) return NextResponse.json({ error: 'Task not found' }, { status: 404 })

  const { error } = await supabase.from('tasks').delete().eq('id', taskId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return new NextResponse(null, { status: 204 })
}
