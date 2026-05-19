'use client'

import * as React from 'react'
import {
  FileText,
  Link,
  Wrench,
  PenTool,
  BarChart2,
  Globe,
  CheckCircle2,
  History,
  ChevronDown,
} from 'lucide-react'
import { formatDate, formatRelativeDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { ClientHistory } from '@/lib/database.types'

// ─── Action type configuration ────────────────────────────────────────────────

const ACTION_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  title_tag_updated: { label: 'Title tag updated', color: 'text-blue-600', bg: 'bg-blue-100', Icon: FileText },
  meta_description_updated: { label: 'Meta description updated', color: 'text-blue-600', bg: 'bg-blue-100', Icon: FileText },
  content_published: { label: 'Content published', color: 'text-green-600', bg: 'bg-green-100', Icon: PenTool },
  content_updated: { label: 'Content updated', color: 'text-green-600', bg: 'bg-green-100', Icon: PenTool },
  internal_link_added: { label: 'Internal link added', color: 'text-purple-600', bg: 'bg-purple-100', Icon: Link },
  backlink_acquired: { label: 'Backlink acquired', color: 'text-indigo-600', bg: 'bg-indigo-100', Icon: Globe },
  technical_fix: { label: 'Technical fix', color: 'text-orange-600', bg: 'bg-orange-100', Icon: Wrench },
  schema_added: { label: 'Schema added', color: 'text-pink-600', bg: 'bg-pink-100', Icon: FileText },
  ranking_improved: { label: 'Ranking improved', color: 'text-emerald-600', bg: 'bg-emerald-100', Icon: BarChart2 },
  ranking_declined: { label: 'Ranking declined', color: 'text-red-600', bg: 'bg-red-100', Icon: BarChart2 },
  task_completed: { label: 'Task completed', color: 'text-green-600', bg: 'bg-green-100', Icon: CheckCircle2 },
  competitor_added: { label: 'Competitor added', color: 'text-gray-600', bg: 'bg-gray-100', Icon: BarChart2 },
  keyword_added: { label: 'Keyword tracked', color: 'text-indigo-600', bg: 'bg-indigo-100', Icon: BarChart2 },
  other: { label: 'Update', color: 'text-gray-600', bg: 'bg-gray-100', Icon: History },
}

function getActionConfig(actionType: string) {
  return ACTION_CONFIG[actionType] ?? ACTION_CONFIG.other
}

// ─── Single entry ─────────────────────────────────────────────────────────────

interface HistoryEntryProps {
  entry: ClientHistory
  isLast: boolean
}

function HistoryEntry({ entry, isLast }: HistoryEntryProps) {
  const [expanded, setExpanded] = React.useState(false)
  const config = getActionConfig(entry.action_type)
  const { Icon } = config
  const hasDetails = entry.before_value || entry.after_value || entry.notes || entry.expected_impact

  return (
    <div className="relative flex gap-3">
      {/* Vertical line */}
      {!isLast && (
        <div className="absolute left-4 top-8 bottom-0 w-px bg-gray-200" />
      )}

      {/* Icon */}
      <div
        className={cn(
          'relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0',
          config.bg
        )}
      >
        <Icon className={cn('w-3.5 h-3.5', config.color)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pb-6">
        <div className="flex items-start gap-2 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={cn('text-xs font-semibold px-1.5 py-0.5 rounded', config.bg, config.color)}>
                {config.label}
              </span>
              {entry.related_task_id && (
                <span className="text-xs text-gray-400">via task</span>
              )}
            </div>
            <p className="text-sm text-gray-900 mt-0.5 leading-snug">{entry.description}</p>

            {/* Page / keyword chips */}
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {entry.page_url && (
                <a
                  href={entry.page_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-500 hover:text-indigo-600 truncate max-w-[200px]"
                >
                  {entry.page_url.replace(/^https?:\/\//, '')}
                </a>
              )}
              {entry.keyword && (
                <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {entry.keyword}
                </span>
              )}
            </div>
          </div>

          <div className="shrink-0 text-right">
            <p className="text-xs text-gray-400">{formatDate(entry.created_at)}</p>
            <p className="text-xs text-gray-300">{formatRelativeDate(entry.created_at)}</p>
          </div>
        </div>

        {/* Before/after or details */}
        {hasDetails && (
          <>
            <button
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 mt-1"
              onClick={() => setExpanded((v) => !v)}
            >
              <ChevronDown className={cn('w-3 h-3 transition-transform', expanded && 'rotate-180')} />
              {expanded ? 'Hide details' : 'Show details'}
            </button>

            {expanded && (
              <div className="mt-2 space-y-1.5 text-xs">
                {entry.before_value && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 w-12 shrink-0">Before:</span>
                    <span className="line-through text-gray-400 truncate">{entry.before_value}</span>
                  </div>
                )}
                {entry.after_value && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 w-12 shrink-0">After:</span>
                    <span className="text-gray-700 truncate">{entry.after_value}</span>
                  </div>
                )}
                {entry.expected_impact && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 w-12 shrink-0">Impact:</span>
                    <span className="text-indigo-600">{entry.expected_impact}</span>
                  </div>
                )}
                {entry.notes && (
                  <div className="flex items-start gap-2">
                    <span className="text-gray-500 w-12 shrink-0">Notes:</span>
                    <span className="text-gray-600">{entry.notes}</span>
                  </div>
                )}
                {entry.changed_by && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 w-12 shrink-0">By:</span>
                    <span className="text-gray-500">{entry.changed_by}</span>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ─── Group entries by date ────────────────────────────────────────────────────

function groupByDate(entries: ClientHistory[]): Map<string, ClientHistory[]> {
  const map = new Map<string, ClientHistory[]>()
  entries.forEach((entry) => {
    const date = entry.created_at.split('T')[0]
    if (!map.has(date)) map.set(date, [])
    map.get(date)!.push(entry)
  })
  return map
}

// ─── Main component ───────────────────────────────────────────────────────────

interface HistoryTimelineProps {
  history: ClientHistory[]
}

export function HistoryTimeline({ history }: HistoryTimelineProps) {
  const [filterType, setFilterType] = React.useState('all')

  const actionTypes = React.useMemo(() => {
    const types = new Set(history.map((h) => h.action_type))
    return ['all', ...Array.from(types)]
  }, [history])

  const filtered = React.useMemo(() => {
    if (filterType === 'all') return history
    return history.filter((h) => h.action_type === filterType)
  }, [history, filterType])

  const grouped = React.useMemo(() => groupByDate(filtered), [filtered])

  if (history.length === 0) {
    return (
      <div className="text-center py-16">
        <History className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-sm font-medium text-gray-500">No history yet</p>
        <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
          History entries are automatically created when you complete tasks, update content,
          or log changes for this client.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        {actionTypes.slice(0, 8).map((type) => {
          const config = getActionConfig(type)
          return (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={cn(
                'text-xs px-2.5 py-1 rounded-full border transition-colors',
                filterType === type
                  ? 'border-indigo-400 bg-indigo-50 text-indigo-700 font-medium'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              )}
            >
              {type === 'all' ? 'All' : config.label}
            </button>
          )
        })}
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {[...grouped.entries()].map(([date, entries]) => (
          <div key={date}>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-xs font-medium text-gray-500 px-2 py-0.5 bg-gray-100 rounded-full whitespace-nowrap">
                {formatDate(date)}
              </span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>
            <div>
              {entries.map((entry, idx) => (
                <HistoryEntry
                  key={entry.id}
                  entry={entry}
                  isLast={idx === entries.length - 1 && [...grouped.keys()].at(-1) === date}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default HistoryTimeline
