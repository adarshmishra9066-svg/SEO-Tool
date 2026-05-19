import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { ClientForm } from '@/components/clients/client-form'

export default async function NewClientPage() {
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

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Add New Client"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Clients', href: '/clients' },
          { label: 'New Client' },
        ]}
      />
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        <ClientForm agencyId={agency.id} />
      </div>
    </div>
  )
}
