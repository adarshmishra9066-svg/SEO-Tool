'use client'

import * as React from 'react'
import { BookOpen, Clock, CheckSquare, ChevronDown, ChevronUp, Search } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { BUILT_IN_SOPS, SOP_CATEGORIES, type BuiltInSop } from '@/lib/constants'

const categoryColors: Record<string, string> = {
  analytics: 'text-blue-700 bg-blue-50',
  content: 'text-purple-700 bg-purple-50',
  technical: 'text-orange-700 bg-orange-50',
  on_page: 'text-indigo-700 bg-indigo-50',
  backlinks: 'text-green-700 bg-green-50',
  client_management: 'text-amber-700 bg-amber-50',
  local_seo: 'text-teal-700 bg-teal-50',
  research: 'text-pink-700 bg-pink-50',
}

function SopCard({ sop }: { sop: BuiltInSop }) {
  const [expanded, setExpanded] = React.useState(false)
  const [checkedItems, setCheckedItems] = React.useState<Record<string, boolean>>({})

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const completedCount = Object.values(checkedItems).filter(Boolean).length
  const categoryLabel =
    SOP_CATEGORIES.find((c) => c.value === sop.category)?.label ?? sop.category
  const colorClass = categoryColors[sop.category] ?? 'text-gray-700 bg-gray-50'

  return (
    <Card className="border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Category color bar */}
      <div
        className={cn(
          'h-1',
          sop.category === 'analytics'
            ? 'bg-blue-500'
            : sop.category === 'content'
            ? 'bg-purple-500'
            : sop.category === 'technical'
            ? 'bg-orange-500'
            : sop.category === 'on_page'
            ? 'bg-indigo-500'
            : sop.category === 'backlinks'
            ? 'bg-green-500'
            : sop.category === 'client_management'
            ? 'bg-amber-500'
            : sop.category === 'local_seo'
            ? 'bg-teal-500'
            : 'bg-pink-500'
        )}
      />

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', colorClass)}>
                {categoryLabel}
              </span>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {sop.estimatedTime}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-gray-900 leading-snug">{sop.title}</h3>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
              {sop.description}
            </p>
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 mt-2">
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            {sop.steps.length} steps
          </span>
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <CheckSquare className="w-3 h-3" />
            {sop.checklist.length} checklist items
          </span>
          {expanded && completedCount > 0 && (
            <span className="text-xs font-medium text-indigo-600 ml-auto">
              {completedCount}/{sop.checklist.length} done
            </span>
          )}
        </div>

        {/* Expand button */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 mt-2 transition-colors w-fit"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" /> Collapse
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" /> View SOP
            </>
          )}
        </button>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0 border-t border-gray-100">
          {/* Steps */}
          <div className="mt-4 mb-5">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Steps
            </h4>
            <ol className="space-y-3">
              {sop.steps.map((step) => (
                <li key={step.order} className="flex gap-3">
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold shrink-0 mt-0.5">
                    {step.order}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{step.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                      {step.description}
                    </p>
                    {step.tip && (
                      <div className="flex items-start gap-1.5 mt-1.5 p-2 bg-amber-50 rounded-lg">
                        <span className="text-amber-500 text-xs font-bold shrink-0">Tip:</span>
                        <p className="text-xs text-amber-700 leading-relaxed">{step.tip}</p>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Checklist */}
          <div className="border-t border-gray-100 pt-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Completion Checklist
            </h4>
            <div className="space-y-2">
              {sop.checklist.map((item) => (
                <label
                  key={item.id}
                  className="flex items-center gap-2.5 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={checkedItems[item.id] ?? false}
                    onChange={() => toggleCheck(item.id)}
                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span
                    className={cn(
                      'text-sm transition-colors',
                      checkedItems[item.id]
                        ? 'text-gray-400 line-through'
                        : 'text-gray-700 group-hover:text-gray-900'
                    )}
                  >
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

export function SopLibrary() {
  const [search, setSearch] = React.useState('')
  const [categoryFilter, setCategoryFilter] = React.useState<string>('all')

  const filtered = BUILT_IN_SOPS.filter((sop) => {
    const matchesSearch =
      search === '' ||
      sop.title.toLowerCase().includes(search.toLowerCase()) ||
      sop.description.toLowerCase().includes(search.toLowerCase())

    const matchesCategory =
      categoryFilter === 'all' || sop.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search SOPs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {SOP_CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="text-sm text-gray-500 ml-auto">
          {filtered.length} SOP{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <BookOpen className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-base font-medium text-gray-900 mb-1">No SOPs found</p>
          <p className="text-sm text-gray-500">Try adjusting your search or filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((sop) => (
            <SopCard key={sop.id} sop={sop} />
          ))}
        </div>
      )}
    </div>
  )
}
