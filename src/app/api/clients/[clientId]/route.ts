import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface Params {
  params: Promise<{ clientId: string }>
}

async function getAuthorisedClient(clientId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorised', status: 401, supabase, user: null, agency: null }

  const { data: agency } = await supabase
    .from('agencies')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!agency) return { error: 'Agency not found', status: 404, supabase, user, agency: null }

  // Verify client belongs to agency
  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('id', clientId)
    .eq('agency_id', agency.id)
    .single()

  if (!client) return { error: 'Client not found', status: 404, supabase, user, agency }

  return { error: null, status: 200, supabase, user, agency }
}

export async function GET(_req: Request, { params }: Params) {
  const { clientId } = await params
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

  const { data: client, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .eq('agency_id', agency.id)
    .single()

  if (error || !client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  return NextResponse.json(client)
}

export async function PUT(request: Request, { params }: Params) {
  const { clientId } = await params
  const auth = await getAuthorisedClient(clientId)

  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  // Remove immutable fields
  const { id: _id, agency_id: _agency_id, created_at: _ca, ...updateData } = body as Record<string, unknown>

  const { data: updated, error } = await auth.supabase
    .from('clients')
    .update({ ...updateData, updated_at: new Date().toISOString() })
    .eq('id', clientId)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: Params) {
  const { clientId } = await params
  const auth = await getAuthorisedClient(clientId)

  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { error } = await auth.supabase.from('clients').delete().eq('id', clientId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return new NextResponse(null, { status: 204 })
}
