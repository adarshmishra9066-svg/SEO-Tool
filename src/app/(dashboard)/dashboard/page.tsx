import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { StatsOverview } from '@/components/dashboard/stats-overview'
import { DoThisFirst } from '@/components/dashboard/do-this-first'
import { ClientCard } from '@/components/dashboard/client-card'
import { isOverdue } from '@/lib/utils'
import type { Client, Task } from '@/lib/database.types'

export const dynamic = 'force-dynamic'

interface TaskWithClient extends Task {
  client: Pick<Client, 'id' | 'name'>
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Get agency
  const { data: agency } = await supabase
    .from('agencies')
    .select('id, name')
    .eq('owner_id', user.id)
    .single()

  if (!agency) {
    return (
      <div className="flex flex-col h-full">
        <Header title="Dashboard" />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-indigo-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Welcome to SEO Command Centre
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Your agency account isn&apos;t set up yet. Please contact support to get started.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Fetch clients with task counts
  const { data: rawClients } = await supabase
    .from('clients')
    .select('*')
    .eq('agency_id', agency.id)
    .order('created_at', { ascending: false })

  const clients = (rawClients ?? []) as Client[]

  // Fetch high priority open tasks for "Do This First"
  const { data: rawTopTasks } = await supabase
    .from('tasks')
    .select('*, client:clients(id, name)')
    .eq('agency_id', agency.id)
    .in('status', ['new', 'planned', 'in_progress'])
    .in('impact', ['high', 'very_high'])
    .order('priority_score', { ascending: false })
    .limit(5)

  const topTasks = (rawTopTasks ?? []) as unknown as TaskWithClient[]

  // Fetch all open tasks for stats
  const { data: allOpenTasks } = await supabase
    .from('tasks')
    .select('id, priority_score, impact, due_date, status, client_id')
    .eq('agency_id', agency.id)
    .in('status', ['new', 'planned', 'in_progress', 'waiting'])

  const openTasks = allOpenTasks ?? []

  const highPriorityTasks = openTasks.filter(
    (t) => t.impact === 'high' || t.impact === 'very_high'
  ).length

  const overdueTasks = openTasks.filter((t) => isOverdue(t.due_date)).length

  const clientsAtRisk = clients.filter(
    (c) => c.risk_level === 'high' || c.risk_level === 'critical'
  ).length

  // Compute per-client task counts
  const tasksByClient: Record<string, { high: number; overdue: number }> = {}
  for (const task of openTasks) {
    if (!tasksByClient[task.client_id]) {
      tasksByClient[task.client_id] = { high: 0, overdue: 0 }
    }
    if (task.impact === 'high' || task.impact === 'very_high') {
      tasksByClient[task.client_id].high++
    }
    if (isOverdue(task.due_date)) {
      tasksByClient[task.client_id].overdue++
    }
  }

  const clientsWithCounts: Client[] = clients.map((c) => ({
    ...c,
    high_priority_tasks_count: tasksByClient[c.id]?.high ?? 0,
    overdue_tasks_count: tasksByClient[c.id]?.overdue ?? 0,
  }))

  const today = new Date()
  const greeting =
    today.getHours() < 12
      ? 'Good morning'
      : today.getHours() < 17
      ? 'Good afternoon'
      : 'Good evening'

  return (
    <div className="flex flex-col h-full">
      <Header
        title={`${greeting} — ${agency.name}`}
        description={`${new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`}
        actions={
          <Link href="/clients/new">
            <Button size="sm">
              <Plus className="w-4 h-4" />
              Add Client
            </Button>
          </Link>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
        {/* Stats */}
        <StatsOverview
          totalClients={clients.length}
          highPriorityTasks={highPriorityTasks}
          overdueTasks={overdueTasks}
          clientsAtRisk={clientsAtRisk}
        />

        {/* Do This First */}
        <DoThisFirst tasks={topTasks} />

        {/* Client Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900">All Clients</h2>
              <p className="text-sm text-gray-500">
                {clients.length} client{clients.length !== 1 ? 's' : ''} in your agency
              </p>
            </div>
            <Link href="/clients">
              <Button variant="outline" size="sm">
                <Users className="w-4 h-4" />
                Manage Clients
              </Button>
            </Link>
          </div>

          {clients.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200 border-dashed">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">No clients yet</h3>
              <p className="text-sm text-gray-500 mb-5">
                Add your first client to start tracking SEO performance.
              </p>
              <Link href="/clients/new">
                <Button size="sm">
                  <Plus className="w-4 h-4" />
                  Add your first client
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {clientsWithCounts.map((client) => (
                <ClientCard key={client.id} client={client} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
