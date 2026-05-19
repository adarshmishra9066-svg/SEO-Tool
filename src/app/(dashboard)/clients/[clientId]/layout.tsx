import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ClientSidebar } from '@/components/layout/client-sidebar'
import type { Client, AgencyRow, ClientRow } from '@/lib/database.types'

interface ClientLayoutProps {
  children: React.ReactNode
  params: Promise<{ clientId: string }>
}

export default async function ClientLayout({ children, params }: ClientLayoutProps) {
  const { clientId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: agencyData } = await supabase
    .from('agencies')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  const agency = agencyData as Pick<AgencyRow, 'id'> | null
  if (!agency) redirect('/dashboard')

  const { data: rawClientData } = await supabase
    .from('clients')
    .select('id, name, agency_id')
    .eq('id', clientId)
    .eq('agency_id', agency.id)
    .single()

  if (!rawClientData) notFound()

  const client = rawClientData as Pick<ClientRow, 'id' | 'name' | 'agency_id'>

  return (
    <div className="flex h-full overflow-hidden">
      <ClientSidebar clientId={client.id} clientName={client.name} />
      <div className="flex-1 overflow-hidden flex flex-col">{children}</div>
    </div>
  )
}
