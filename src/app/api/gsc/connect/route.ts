import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { AgencyRow } from '@/lib/database.types'

// POST /api/gsc/connect
// Body: { client_id, property_url }
// Saves GSC property record.
// Real OAuth to Google would require GOOGLE_CLIENT_ID/SECRET (not set in dev).
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

  let body: { client_id?: string; property_url?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!body.client_id || !body.property_url) {
    return NextResponse.json(
      { error: 'client_id and property_url are required' },
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

  if (!clientData) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  // Normalise property URL
  let propertyUrl = body.property_url.trim()
  if (!propertyUrl.startsWith('sc-domain:') && !propertyUrl.startsWith('http')) {
    propertyUrl = `https://${propertyUrl}`
  }

  // Upsert — one property per client for now
  const { data: property, error } = await supabase
    .from('gsc_properties')
    .upsert(
      {
        client_id: body.client_id,
        property_url: propertyUrl,
        is_connected: false, // requires real OAuth to become true
        access_token: null,
        refresh_token: null,
        token_expiry: null,
        last_synced: null,
      },
      { onConflict: 'client_id' }
    )
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    property_id: (property as Record<string, unknown>).id,
    message:
      'GSC property saved. Connect via Google OAuth to sync real data, or use mock sync for demo purposes.',
  })
}
