import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { ClientOverview } from '@/components/clients/client-overview'
import type { Client, Task, Opportunity } from '@/lib/database.types'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ clientId: string }>
}

export default async function ClientOverviewPage({ params }: PageProps) {
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
    .select('*')
    .eq('id', clientId)
    .eq('agency_id', agency.id)
    .single()

  if (!rawClient) notFound()

  const client = rawClient as Client

  const { data: rawTasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })

  const { data: rawOpportunities } = await supabase
    .from('opportunities')
    .select('*')
    .eq('client_id', clientId)
    .order('priority_score', { ascending: false })

  const tasks = (rawTasks ?? []) as Task[]
  const opportunities = (rawOpportunities ?? []) as Opportunity[]

  return (
    <div className="flex flex-col h-full">
      <Header
        title={client.name}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Clients', href: '/clients' },
          { label: client.name },
        ]}
        description={`Overview — ${client.website_url}`}
      />
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        <ClientOverview client={client} tasks={tasks} opportunities={opportunities} />
      </div>
    </div>
  )
}
