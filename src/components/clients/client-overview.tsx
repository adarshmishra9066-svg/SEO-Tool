'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  ExternalLink,
  Target,
  Users,
  Globe,
  DollarSign,
  Plus,
  ArrowRight,
  Activity,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  cn,
  formatDate,
  formatCurrency,
  getDomain,
  getHealthScoreColor,
  getHealthScoreBarColor,
} from '@/lib/utils'
import type { Client, Task, Opportunity } from '@/lib/database.types'

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

const impactVariant: Record<string, 'success' | 'warning' | 'danger' | 'purple'> = {
  low: 'success',
  medium: 'warning',
  high: 'danger',
  very_high: 'purple',
}

interface ClientOverviewProps {
  client: Client
  tasks: Task[]
  opportunities: Opportunity[]
}

export function ClientOverview({ client, tasks, opportunities }: ClientOverviewProps) {
  const activeTasks = tasks.filter((t) => !['completed', 'skipped'].includes(t.status))
  const completedTasks = tasks.filter((t) => t.status === 'completed')
  const topOpportunities = opportunities.filter((o) => o.status === 'new').slice(0, 3)

  const healthColor = getHealthScoreColor(client.seo_health_score)
  const healthBarColor = getHealthScoreBarColor(client.seo_health_score)

  return (
    <div className="space-y-5">
      {/* Profile + Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Profile Card */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl">{client.name}</CardTitle>
                <a
                  href={client.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition-colors mt-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  {getDomain(client.website_url)}
                </a>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge variant={statusVariant[client.client_status] ?? 'secondary'}>
                  {client.client_status}
                </Badge>
                <Badge variant={riskVariant[client.risk_level] ?? 'secondary'}>
                  {client.risk_level} risk
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {client.industry && (
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-indigo-50 shrink-0 mt-0.5">
                    <Globe className="w-3.5 h-3.5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Industry</p>
                    <p className="text-sm text-gray-800 font-medium">{client.industry}</p>
                  </div>
                </div>
              )}
              {client.target_location && (
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-green-50 shrink-0 mt-0.5">
                    <Target className="w-3.5 h-3.5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Target Location</p>
                    <p className="text-sm text-gray-800 font-medium">{client.target_location}</p>
                  </div>
                </div>
              )}
              {client.retainer_value && (
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-amber-50 shrink-0 mt-0.5">
                    <DollarSign className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Monthly Retainer</p>
                    <p className="text-sm text-gray-800 font-medium">
                      {formatCurrency(client.retainer_value)}
                    </p>
                  </div>
                </div>
              )}
              {client.target_audience && (
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-purple-50 shrink-0 mt-0.5">
                    <Users className="w-3.5 h-3.5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Target Audience</p>
                    <p className="text-sm text-gray-800 font-medium line-clamp-2">
                      {client.target_audience}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {client.main_goals && (
              <>
                <Separator />
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Main Goals
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">{client.main_goals}</p>
                </div>
              </>
            )}

            <div className="flex items-center gap-2 pt-1">
              <Link href={`/clients/${client.id}/tasks`}>
                <Button size="sm" variant="outline">
                  <Plus className="w-3.5 h-3.5" />
                  Add Task
                </Button>
              </Link>
              <Link href={`/clients/${client.id}/reports`}>
                <Button size="sm" variant="outline">
                  <Activity className="w-3.5 h-3.5" />
                  View Reports
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Health + Stats */}
        <div className="space-y-4">
          {/* SEO Health Score */}
          <Card>
            <CardContent className="pt-5 pb-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                SEO Health Score
              </p>
              <div className="flex items-center gap-3 mb-3">
                <span className={cn('text-4xl font-bold tabular-nums', healthColor)}>
                  {client.seo_health_score}
                </span>
                <span className="text-gray-300 text-2xl">/</span>
                <span className="text-xl text-gray-300 font-medium">100</span>
              </div>
              <Progress
                value={client.seo_health_score}
                className="h-2.5 mb-2"
                indicatorClassName={healthBarColor}
              />
              <p className="text-xs text-gray-400">
                {client.seo_health_score >= 80
                  ? 'Excellent — maintaining strong performance'
                  : client.seo_health_score >= 60
                  ? 'Good — some optimisation opportunities'
                  : client.seo_health_score >= 40
                  ? 'Fair — significant improvements needed'
                  : 'Poor — urgent attention required'}
              </p>
            </CardContent>
          </Card>

          {/* Quick stats */}
          <Card>
            <CardContent className="pt-5 pb-5 space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Quick Stats
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{activeTasks.length}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Active Tasks</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{completedTasks.length}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Completed</p>
                </div>
                <div className="text-center p-3 bg-indigo-50 rounded-lg">
                  <p className="text-2xl font-bold text-indigo-700">{opportunities.length}</p>
                  <p className="text-xs text-indigo-500 mt-0.5">Opportunities</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-0.5">Since</p>
                  <p className="text-xs font-semibold text-gray-700">
                    {formatDate(client.created_at, 'MMM yyyy')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Top Opportunities */}
      {topOpportunities.length > 0 && (
        <Card>
          <CardHeader className="pb-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Top Opportunities</CardTitle>
              <Link href={`/clients/${client.id}/opportunities`}>
                <Button variant="ghost" size="sm" className="text-xs text-indigo-600">
                  View all <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-0 divide-y divide-gray-50">
            {topOpportunities.map((opp) => (
              <div key={opp.id} className="py-3.5 flex items-start gap-3">
                <Badge
                  variant={impactVariant[opp.impact] ?? 'secondary'}
                  className="mt-0.5 text-xs shrink-0"
                >
                  {opp.impact === 'very_high' ? 'Very High' : opp.impact.charAt(0).toUpperCase() + opp.impact.slice(1)}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{opp.title}</p>
                  {opp.description && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{opp.description}</p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
