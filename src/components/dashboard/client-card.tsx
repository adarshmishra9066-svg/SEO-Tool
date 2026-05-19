'use client'

import * as React from 'react'
import Link from 'next/link'
import { ExternalLink, ArrowRight, AlertTriangle, CheckSquare } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  cn,
  getRiskColor,
  getStatusColor,
  getHealthScoreColor,
  getHealthScoreBarColor,
  getDomain,
} from '@/lib/utils'
import type { Client } from '@/lib/database.types'

interface ClientCardProps {
  client: Client
}

const riskBadgeVariant: Record<string, 'success' | 'warning' | 'danger' | 'critical'> = {
  low: 'success',
  medium: 'warning',
  high: 'danger',
  critical: 'critical',
}

const statusBadgeVariant: Record<string, 'success' | 'warning' | 'blue' | 'secondary'> = {
  active: 'success',
  paused: 'warning',
  onboarding: 'blue',
  churned: 'secondary',
}

export function ClientCard({ client }: ClientCardProps) {
  const healthColor = getHealthScoreColor(client.seo_health_score)
  const healthBarColor = getHealthScoreBarColor(client.seo_health_score)
  const overdue = client.overdue_tasks_count ?? 0
  const highPriority = client.high_priority_tasks_count ?? 0

  return (
    <Card className="group hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* Risk indicator strip at top */}
      <div
        className={cn(
          'h-1',
          client.risk_level === 'critical'
            ? 'bg-red-600'
            : client.risk_level === 'high'
            ? 'bg-orange-500'
            : client.risk_level === 'medium'
            ? 'bg-amber-400'
            : 'bg-green-400'
        )}
      />

      <CardContent className="pt-4 pb-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 text-sm truncate">{client.name}</h3>
            <a
              href={client.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-indigo-600 transition-colors mt-0.5 w-fit"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-2.5 h-2.5" />
              {getDomain(client.website_url)}
            </a>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <Badge
              variant={riskBadgeVariant[client.risk_level] ?? 'secondary'}
              className="text-xs"
            >
              {client.risk_level.charAt(0).toUpperCase() + client.risk_level.slice(1)} Risk
            </Badge>
            <Badge
              variant={statusBadgeVariant[client.client_status] ?? 'secondary'}
              className="text-xs"
            >
              {client.client_status.charAt(0).toUpperCase() + client.client_status.slice(1)}
            </Badge>
          </div>
        </div>

        {/* SEO Health Score */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">SEO Health</span>
            <span className={cn('text-sm font-bold tabular-nums', healthColor)}>
              {client.seo_health_score}/100
            </span>
          </div>
          <Progress
            value={client.seo_health_score}
            className="h-1.5"
            indicatorClassName={healthBarColor}
          />
        </div>

        {/* Task indicators */}
        <div className="flex items-center gap-3 mb-4">
          {highPriority > 0 && (
            <div className="flex items-center gap-1 text-xs text-amber-600">
              <AlertTriangle className="w-3 h-3" />
              <span>{highPriority} high priority</span>
            </div>
          )}
          {overdue > 0 && (
            <div className="flex items-center gap-1 text-xs text-red-600">
              <CheckSquare className="w-3 h-3" />
              <span>{overdue} overdue</span>
            </div>
          )}
          {highPriority === 0 && overdue === 0 && (
            <div className="flex items-center gap-1 text-xs text-green-600">
              <CheckSquare className="w-3 h-3" />
              <span>No urgent tasks</span>
            </div>
          )}
          {client.industry && (
            <span className="text-xs text-gray-400 ml-auto">{client.industry}</span>
          )}
        </div>

        {/* CTA */}
        <Link href={`/clients/${client.id}`}>
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs font-medium group-hover:bg-indigo-50 group-hover:border-indigo-300 group-hover:text-indigo-700 transition-colors"
          >
            View Workspace
            <ArrowRight className="w-3 h-3 ml-auto" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
