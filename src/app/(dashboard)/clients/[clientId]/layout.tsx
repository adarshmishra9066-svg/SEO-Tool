import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ClientSidebar } from '@/components/layout/client-sidebar'
import type { Client } from '@/lib/database.types'

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

  const { data: agency } = await supabase
    .from('agencies')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!agency) redirect('/dashboard')

  const { data: rawClient } = await supabase
    .from('clients')
    .select('id, name, agency_id')
    .eq('id', clientId)
    .eq('agency_id', agency.id)
    .single()

  if (!rawClient) notFound()

  const client = rawClient as Pick<Client, 'id' | 'name' | 'agency_id'>

  return (
    <div className="flex h-full overflow-hidden">
      <ClientSidebar clientId={client.id} clientName={client.name} />
      <div className="flex-1 overflow-hidden flex flex-col">{children}</div>
    </div>
  )
}
