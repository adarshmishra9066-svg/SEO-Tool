'use client'

import * as React from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type OpportunityFilterState = {
  search: string
  type: string
  impact: string
  effort: string
  status: string
}

interface OpportunityFiltersProps {
  filters: OpportunityFilterState
  onChange: (filters: OpportunityFilterState) => void
  totalCount: number
  filteredCount: number
}

const TYPE_OPTIONS = [
  { value: 'all', label: 'All types' },
  { value: 'quick_win', label: 'Quick Win' },
  { value: 'ctr_gap', label: 'CTR Gap' },
  { value: 'content_decay', label: 'Content Decay' },
  { value: 'new_content', label: 'New Content' },
  { value: 'technical', label: 'Technical' },
  { value: 'internal_linking', label: 'Internal Linking' },
  { value: 'conversion', label: 'Conversion' },
]

const IMPACT_OPTIONS = [
  { value: 'all', label: 'All impacts' },
  { value: 'very_high', label: 'Very High' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

const EFFORT_OPTIONS = [
  { value: 'all', label: 'All effort' },
  { value: 'low', label: 'Low effort' },
  { value: 'medium', label: 'Medium effort' },
  { value: 'high', label: 'High effort' },
]

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'task_created', label: 'Task created' },
  { value: 'dismissed', label: 'Dismissed' },
  { value: 'all', label: 'All statuses' },
]

export function OpportunityFilters({
  filters,
  onChange,
  totalCount,
  filteredCount,
}: OpportunityFiltersProps) {
  const hasActiveFilters =
    filters.search !== '' ||
    filters.type !== 'all' ||
    filters.impact !== 'all' ||
    filters.effort !== 'all' ||
    filters.status !== 'new'

  const handleReset = () => {
    onChange({ search: '', type: 'all', impact: 'all', effort: 'all', status: 'new' })
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
        <Input
          placeholder="Search opportunities…"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="pl-8 h-8 text-xs w-52"
        />
      </div>

      {/* Type */}
      <Select value={filters.type} onValueChange={(v) => onChange({ ...filters, type: v })}>
        <SelectTrigger className="h-8 text-xs w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {TYPE_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value} className="text-xs">
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Impact */}
      <Select value={filters.impact} onValueChange={(v) => onChange({ ...filters, impact: v })}>
        <SelectTrigger className="h-8 text-xs w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {IMPACT_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value} className="text-xs">
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Effort */}
      <Select value={filters.effort} onValueChange={(v) => onChange({ ...filters, effort: v })}>
        <SelectTrigger className="h-8 text-xs w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {EFFORT_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value} className="text-xs">
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status */}
      <Select value={filters.status} onValueChange={(v) => onChange({ ...filters, status: v })}>
        <SelectTrigger className="h-8 text-xs w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value} className="text-xs">
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Reset */}
      {hasActiveFilters && (
        <Button
          size="sm"
          variant="ghost"
          onClick={handleReset}
          className="h-8 text-xs gap-1 text-gray-500"
        >
          <X className="w-3 h-3" />
          Reset
        </Button>
      )}

      {/* Count */}
      <span className={cn('text-xs text-gray-400 ml-auto', hasActiveFilters && 'text-indigo-600')}>
        {filteredCount === totalCount
          ? `${totalCount} total`
          : `${filteredCount} of ${totalCount}`}
      </span>
    </div>
  )
}

export default OpportunityFilters
