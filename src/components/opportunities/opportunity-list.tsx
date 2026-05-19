'use client'

import * as React from 'react'
import { Lightbulb, Zap } from 'lucide-react'
import { OpportunityCard } from './opportunity-card'
import { OpportunityFilters, type OpportunityFilterState } from './opportunity-filters'
import { cn } from '@/lib/utils'
import type { Opportunity } from '@/lib/database.types'

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function OpportunitySkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
      <div className="flex gap-3">
        <div className="w-11 h-11 rounded-full bg-gray-200 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-gray-200 rounded w-20" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-2/3" />
          <div className="flex gap-2">
            <div className="h-5 bg-gray-200 rounded-full w-16" />
            <div className="h-5 bg-gray-200 rounded-full w-16" />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Filtering logic ──────────────────────────────────────────────────────────

function filterOpportunities(
  opportunities: Opportunity[],
  filters: OpportunityFilterState
): Opportunity[] {
  return opportunities.filter((opp) => {
    if (filters.status !== 'all' && opp.status !== filters.status) return false
    if (filters.type !== 'all' && opp.type !== filters.type) return false
    if (filters.impact !== 'all' && opp.impact !== filters.impact) return false
    if (filters.effort !== 'all' && opp.effort !== filters.effort) return false
    if (filters.search) {
      const q = filters.search.toLowerCase()
      const matches =
        opp.title.toLowerCase().includes(q) ||
        (opp.description ?? '').toLowerCase().includes(q) ||
        (opp.related_keyword ?? '').toLowerCase().includes(q) ||
        (opp.related_page_url ?? '').toLowerCase().includes(q)
      if (!matches) return false
    }
    return true
  })
}

// ─── Component ────────────────────────────────────────────────────────────────

interface OpportunityListProps {
  opportunities: Opportunity[]
  loading?: boolean
  onStatusChange?: (id: string, status: Opportunity['status']) => void
}

export function OpportunityList({
  opportunities,
  loading = false,
  onStatusChange,
}: OpportunityListProps) {
  const [filters, setFilters] = React.useState<OpportunityFilterState>({
    search: '',
    type: 'all',
    impact: 'all',
    effort: 'all',
    status: 'new',
  })

  const filtered = React.useMemo(
    () => filterOpportunities(opportunities, filters),
    [opportunities, filters]
  )

  // Quick win count for summary
  const quickWinCount = opportunities.filter(
    (o) => o.type === 'quick_win' && o.status === 'new'
  ).length

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <OpportunitySkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Quick wins banner */}
      {quickWinCount > 0 && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          <Zap className="w-4 h-4 shrink-0" />
          <span>
            <strong>{quickWinCount} quick win{quickWinCount > 1 ? 's' : ''}</strong> detected — these are
            position 4–15 pages where small optimisations can move the needle fast.
          </span>
        </div>
      )}

      {/* Filters */}
      <OpportunityFilters
        filters={filters}
        onChange={setFilters}
        totalCount={opportunities.filter((o) =>
          filters.status === 'all' ? true : o.status === filters.status
        ).length}
        filteredCount={filtered.length}
      />

      {/* List */}
      {filtered.length === 0 ? (
        <div className={cn('text-center py-16 bg-white rounded-xl border border-gray-200')}>
          <Lightbulb className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          {opportunities.length === 0 ? (
            <>
              <p className="text-sm font-medium text-gray-700">No opportunities yet</p>
              <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                Connect GSC and GA4 data, then click{' '}
                <strong>Generate Opportunities</strong> to automatically detect quick wins
                and CTR gaps.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-gray-700">No matches</p>
              <p className="text-xs text-gray-400 mt-1">
                Try adjusting your filters to see more opportunities.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((opp) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              onStatusChange={onStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default OpportunityList
