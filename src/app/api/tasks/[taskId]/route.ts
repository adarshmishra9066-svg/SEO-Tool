import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface Params {
  params: Promise<{ taskId: string }>
}

async function getAuthorisedTask(taskId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorised', status: 401, supabase }

  const { data: agency } = await supabase
    .from('agencies')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!agency) return { error: 'Agency not found', status: 404, supabase }

  const { data: task } = await supabase
    .from('tasks')
    .select('id')
    .eq('id', taskId)
    .eq('agency_id', agency.id)
    .single()

  if (!task) return { error: 'Task not found', status: 404, supabase }

  return { error: null, status: 200, supabase }
}

export async function GET(_req: Request, { params }: Params) {
  const { taskId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: agency } = await supabase
    .from('agencies')
    .select('id')
    .eq('owner_id', user.id)
    .single()

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
  const auth = await getAuthorisedTask(taskId)

  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

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

  const { data: updated, error } = await auth.supabase
    .from('tasks')
    .update({ ...updateData, updated_at: new Date().toISOString() })
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
  const auth = await getAuthorisedTask(taskId)

  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { error } = await auth.supabase.from('tasks').delete().eq('id', taskId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return new NextResponse(null, { status: 204 })
}
