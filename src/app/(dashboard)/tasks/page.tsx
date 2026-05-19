import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { TaskBoard } from '@/components/tasks/task-board'
import type { Task, Client } from '@/lib/database.types'

export const dynamic = 'force-dynamic'

interface TaskWithClient extends Task {
  client?: Pick<Client, 'id' | 'name'>
}

export default async function TasksPage() {
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

  const [{ data: rawTasks }, { data: rawClients }] = await Promise.all([
    supabase
      .from('tasks')
      .select('*, client:clients(id, name)')
      .eq('agency_id', agency.id)
      .order('priority_score', { ascending: false }),
    supabase
      .from('clients')
      .select('id, name')
      .eq('agency_id', agency.id)
      .order('name', { ascending: true }),
  ])

  const tasks = (rawTasks ?? []) as unknown as TaskWithClient[]
  const clients = (rawClients ?? []) as Pick<Client, 'id' | 'name'>[]

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Tasks"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Tasks' },
        ]}
        description={`${tasks.length} task${tasks.length !== 1 ? 's' : ''} across all clients`}
      />
      <div className="flex-1 overflow-hidden bg-gray-50">
        <TaskBoard
          initialTasks={tasks}
          clients={clients}
          showClientFilter
        />
      </div>
    </div>
  )
}
