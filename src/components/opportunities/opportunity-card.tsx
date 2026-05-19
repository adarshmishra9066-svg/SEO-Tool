'use client'

import * as React from 'react'
import { ExternalLink, ChevronDown, Lightbulb, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/components/ui/use-toast'
import { cn, truncate, getImpactColor, getEffortColor } from '@/lib/utils'
import type { Opportunity } from '@/lib/database.types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreCircleClass(score: number): string {
  if (score >= 80) return 'bg-red-100 text-red-700 ring-red-200'
  if (score >= 60) return 'bg-orange-100 text-orange-700 ring-orange-200'
  if (score >= 40) return 'bg-blue-100 text-blue-700 ring-blue-200'
  return 'bg-gray-100 text-gray-600 ring-gray-200'
}

function getTypeLabel(type: string): string {
  const map: Record<string, string> = {
    quick_win: 'Quick Win',
    ctr_gap: 'CTR Gap',
    content_decay: 'Content Decay',
    new_content: 'New Content',
    technical: 'Technical',
    internal_linking: 'Internal Linking',
    conversion: 'Conversion',
  }
  return map[type] ?? type
}

function getTypeBadgeClass(type: string): string {
  const map: Record<string, string> = {
    quick_win: 'bg-green-100 text-green-700',
    ctr_gap: 'bg-amber-100 text-amber-700',
    content_decay: 'bg-orange-100 text-orange-700',
    new_content: 'bg-blue-100 text-blue-700',
    technical: 'bg-red-100 text-red-700',
    internal_linking: 'bg-purple-100 text-purple-700',
    conversion: 'bg-pink-100 text-pink-700',
  }
  return map[type] ?? 'bg-gray-100 text-gray-600'
}

// ─── Task type detection from opportunity type ────────────────────────────────

function opportunityToTaskType(type: string): string {
  const map: Record<string, string> = {
    quick_win: 'on_page_seo',
    ctr_gap: 'metadata_rewrite',
    content_decay: 'content_refresh',
    new_content: 'new_blog',
    technical: 'technical_seo',
    internal_linking: 'internal_linking',
    conversion: 'conversion_improvement',
  }
  return map[type] ?? 'on_page_seo'
}

// ─── Component ────────────────────────────────────────────────────────────────

interface OpportunityCardProps {
  opportunity: Opportunity
  onStatusChange?: (id: string, status: Opportunity['status']) => void
}

export function OpportunityCard({ opportunity: opp, onStatusChange }: OpportunityCardProps) {
  const [expanded, setExpanded] = React.useState(false)
  const [creatingTask, setCreatingTask] = React.useState(false)
  const [dismissing, setDismissing] = React.useState(false)
  const [status, setStatus] = React.useState(opp.status)

  const handleCreateTask = async () => {
    setCreatingTask(true)
    try {
      const data = opp.data as Record<string, unknown>
      const recommendedAction =
        typeof data.recommended_action === 'string'
          ? data.recommended_action
          : opp.description ?? ''

      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: opp.client_id,
          title: opp.title,
          description: opp.description,
          task_type: opportunityToTaskType(opp.type),
          priority_score: opp.priority_score,
          impact: opp.impact,
          effort: opp.effort,
          urgency: opp.urgency,
          related_page_url: opp.related_page_url,
          related_keyword: opp.related_keyword,
          recommended_action: recommendedAction,
          source: 'opportunity',
        }),
      })

      if (!res.ok) {
        const err = await res.json() as { error?: string }
        throw new Error(err.error ?? 'Failed to create task')
      }

      // Mark opportunity as task_created
      await fetch(`/api/opportunities/${opp.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'task_created' }),
      })

      setStatus('task_created')
      onStatusChange?.(opp.id, 'task_created')
      toast({ title: 'Task created', description: opp.title, variant: 'success' })
    } catch (err) {
      toast({ title: 'Failed to create task', description: (err as Error).message, variant: 'destructive' })
    } finally {
      setCreatingTask(false)
    }
  }

  const handleDismiss = async () => {
    setDismissing(true)
    try {
      await fetch(`/api/opportunities/${opp.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'dismissed' }),
      })
      setStatus('dismissed')
      onStatusChange?.(opp.id, 'dismissed')
    } catch {
      toast({ title: 'Failed to dismiss', variant: 'destructive' })
    } finally {
      setDismissing(false)
    }
  }

  if (status === 'dismissed') return null

  const data = opp.data as Record<string, unknown>
  const recommendedAction = typeof data.recommended_action === 'string' ? data.recommended_action : null

  return (
    <div
      className={cn(
        'bg-white rounded-xl border shadow-sm p-4 transition-all hover:shadow-md',
        status === 'task_created' ? 'border-green-200 opacity-75' : 'border-gray-200'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Score circle */}
        <div
          className={cn(
            'flex-shrink-0 w-11 h-11 rounded-full ring-2 flex items-center justify-center font-bold text-sm',
            scoreCircleClass(opp.priority_score)
          )}
        >
          {opp.priority_score}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Type chip + status */}
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', getTypeBadgeClass(opp.type))}>
              {getTypeLabel(opp.type)}
            </span>
            {status === 'task_created' && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                Task created
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-sm font-semibold text-gray-900 leading-snug">{opp.title}</h3>

          {/* Description */}
          {opp.description && (
            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed line-clamp-3">
              {opp.description}
            </p>
          )}

          {/* Meta chips */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge className={cn('text-xs px-1.5 py-0', getImpactColor(opp.impact))}>
              {opp.impact === 'very_high' ? 'Very High Impact' : `${opp.impact.charAt(0).toUpperCase() + opp.impact.slice(1)} Impact`}
            </Badge>
            <Badge className={cn('text-xs px-1.5 py-0', getEffortColor(opp.effort))}>
              {opp.effort.charAt(0).toUpperCase() + opp.effort.slice(1)} Effort
            </Badge>
            {opp.related_keyword && (
              <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-mono">
                {truncate(opp.related_keyword, 30)}
              </span>
            )}
            {opp.related_page_url && (
              <a
                href={opp.related_page_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5"
              >
                <ExternalLink className="w-2.5 h-2.5" />
                {truncate(opp.related_page_url.replace(/^https?:\/\//, ''), 35)}
              </a>
            )}
          </div>

          {/* Expandable recommended action */}
          {(recommendedAction || opp.description) && (
            <button
              className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 mt-2"
              onClick={() => setExpanded((v) => !v)}
            >
              <Lightbulb className="w-3 h-3" />
              {expanded ? 'Hide' : 'Show'} recommended action
              <ChevronDown className={cn('w-3 h-3 transition-transform', expanded && 'rotate-180')} />
            </button>
          )}

          {expanded && (
            <div className="mt-2 p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
              <p className="text-xs font-medium text-indigo-800 mb-1">Recommended action</p>
              <p className="text-xs text-indigo-700 leading-relaxed">
                {recommendedAction ?? opp.description}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        {status === 'new' && (
          <div className="shrink-0 flex flex-col gap-1.5">
            <Button
              size="sm"
              onClick={handleCreateTask}
              disabled={creatingTask || dismissing}
              className="h-7 text-xs px-2.5 gap-1"
            >
              <Plus className="w-3 h-3" />
              {creatingTask ? 'Creating…' : 'Task'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              disabled={dismissing || creatingTask}
              className="h-7 text-xs px-2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
