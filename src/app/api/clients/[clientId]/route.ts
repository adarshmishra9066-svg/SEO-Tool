import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { AgencyRow, ClientRow } from '@/lib/database.types'

interface Params {
  params: Promise<{ clientId: string }>
}

export async function GET(_req: Request, { params }: Params) {
  const { clientId } = await params
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

  const { data: clientData, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .eq('agency_id', agency.id)
    .single()

  if (error || !clientData) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  return NextResponse.json(clientData)
}

export async function PUT(request: Request, { params }: Params) {
  const { clientId } = await params
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

  // Verify ownership
  const { data: existingClient } = await supabase
    .from('clients')
    .select('id')
    .eq('id', clientId)
    .eq('agency_id', agency.id)
    .single()

  const existing = existingClient as Pick<ClientRow, 'id'> | null
  if (!existing) return NextResponse.json({ error: 'Client not found' }, { status: 404 })

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { id: _id, agency_id: _aid, created_at: _ca, ...updateData } = body

  const payload = { ...updateData, updated_at: new Date().toISOString() }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clientsTable = supabase.from('clients') as any
  const { data: updated, error } = await clientsTable
    .update(payload)
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

  const { data: existingClient } = await supabase
    .from('clients')
    .select('id')
    .eq('id', clientId)
    .eq('agency_id', agency.id)
    .single()

  const existing = existingClient as Pick<ClientRow, 'id'> | null
  if (!existing) return NextResponse.json({ error: 'Client not found' }, { status: 404 })

  const { error } = await supabase.from('clients').delete().eq('id', clientId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return new NextResponse(null, { status: 204 })
}
