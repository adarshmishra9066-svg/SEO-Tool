import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Users, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn, getDomain, getHealthScoreBarColor, getHealthScoreColor } from '@/lib/utils'
import type { Client } from '@/lib/database.types'

export const dynamic = 'force-dynamic'

const riskVariant: Record<string, 'success' | 'warning' | 'danger' | 'critical'> = {
  low: 'success',
  medium: 'warning',
  high: 'danger',
  critical: 'critical',
}

const statusVariant: Record<string, 'success' | 'warning' | 'blue' | 'secondary'> = {
  active: 'success',
  paused: 'warning',
  onboarding: 'blue',
  churned: 'secondary',
}

export default async function ClientsPage() {
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

  const { data: rawClients } = await supabase
    .from('clients')
    .select('*')
    .eq('agency_id', agency.id)
    .order('name', { ascending: true })

  const clients = (rawClients ?? []) as Client[]

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Clients"
        description={`${clients.length} client${clients.length !== 1 ? 's' : ''} in your agency`}
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Clients' }]}
        actions={
          <Link href="/clients/new">
            <Button size="sm">
              <Plus className="w-4 h-4" />
              Add Client
            </Button>
          </Link>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        {clients.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-20">
            <div className="text-center max-w-sm">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
                <Users className="w-7 h-7 text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No clients yet</h3>
              <p className="text-sm text-gray-500 mb-6">
                Add your first client to start managing their SEO operations from one place.
              </p>
              <Link href="/clients/new">
                <Button>
                  <Plus className="w-4 h-4" />
                  Add your first client
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Industry
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Risk
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    SEO Health
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {clients.map((client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-gray-50/80 transition-colors group"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">
                          {client.name}
                        </p>
                        <a
                          href={client.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-gray-400 hover:text-indigo-500 transition-colors w-fit"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="w-2.5 h-2.5" />
                          {getDomain(client.website_url)}
                        </a>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-gray-600 text-xs">{client.industry ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant[client.client_status] ?? 'secondary'}>
                        {client.client_status.charAt(0).toUpperCase() + client.client_status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={riskVariant[client.risk_level] ?? 'secondary'}>
                        {client.risk_level.charAt(0).toUpperCase() + client.risk_level.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <Progress
                          value={client.seo_health_score}
                          className="h-1.5 w-20"
                          indicatorClassName={getHealthScoreBarColor(client.seo_health_score)}
                        />
                        <span
                          className={cn(
                            'text-xs font-semibold tabular-nums',
                            getHealthScoreColor(client.seo_health_score)
                          )}
                        >
                          {client.seo_health_score}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/clients/${client.id}`}>
                        <Button variant="ghost" size="sm" className="text-xs">
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
