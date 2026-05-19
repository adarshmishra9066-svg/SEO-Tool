'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

const CHECKLIST_ITEMS = [
  'Site is niche relevant',
  'Site has real organic traffic',
  'Site is indexed in Google',
  'Does not look like a link farm',
  'DA/DR is acceptable (20+)',
  'Spam score is low (<10%)',
  'Content quality is acceptable',
  'Outbound links are not excessive',
  'Recent posts are indexed',
  'Has real authors/about/contact pages',
  'Anchor text is safe (not over-optimised)',
  'Link target page is correct',
  'Link placement is contextual',
  'Link type confirmed (dofollow/nofollow)',
  'Live link verified',
  'Link indexed after publishing',
]

export default function BacklinkChecklist({
  prospectId,
  checklist,
}: {
  prospectId: string
  checklist: Record<string, boolean>
}) {
  const [checks, setChecks] = useState<Record<string, boolean>>(checklist ?? {})

  async function toggle(item: string) {
    const updated = { ...checks, [item]: !checks[item] }
    setChecks(updated)
    await fetch('/api/backlinks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: prospectId, checklist: updated }),
    })
  }

  const completed = Object.values(checks).filter(Boolean).length
  const total = CHECKLIST_ITEMS.length
  const pct = Math.round((completed / total) * 100)

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-700">Quality Checklist</span>
        <span className={cn(
          'text-xs font-medium',
          pct >= 80 ? 'text-green-600' : pct >= 50 ? 'text-amber-600' : 'text-red-600'
        )}>
          {completed}/{total} ({pct}%)
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-200 mb-3">
        <div
          className={cn(
            'h-full rounded-full transition-all',
            pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="space-y-1.5 max-h-48 overflow-y-auto">
        {CHECKLIST_ITEMS.map((item) => (
          <label key={item} className="flex items-start gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={!!checks[item]}
              onChange={() => toggle(item)}
              className="mt-0.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className={cn(
              'text-xs',
              checks[item] ? 'text-gray-400 line-through' : 'text-gray-700 group-hover:text-gray-900'
            )}>
              {item}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}
