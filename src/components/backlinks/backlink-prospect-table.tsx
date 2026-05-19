'use client'

import { useState } from 'react'
import { BacklinkProspect } from '@/lib/database.types'
import { cn, getDomain, truncate } from '@/lib/utils'
import { ExternalLink, ChevronDown } from 'lucide-react'
import BacklinkChecklist from './backlink-checklist'

const STATUS_OPTIONS: BacklinkProspect['status'][] = [
  'prospect_found', 'approved', 'outreach_sent', 'negotiating',
  'content_required', 'content_sent', 'published', 'live_link_verified',
  'indexed', 'rejected',
]

const STATUS_LABELS: Record<string, string> = {
  prospect_found: 'Found',
  approved: 'Approved',
  outreach_sent: 'Outreach Sent',
  negotiating: 'Negotiating',
  content_required: 'Content Required',
  content_sent: 'Content Sent',
  published: 'Published',
  live_link_verified: 'Live ✓',
  indexed: 'Indexed ✓',
  rejected: 'Rejected',
}

function SpamBadge({ score }: { score: number | null }) {
  if (score == null) return <span className="text-gray-400">—</span>
  const color = score <= 3 ? 'text-green-600' : score <= 7 ? 'text-amber-600' : 'text-red-600'
  return <span className={cn('font-medium', color)}>{score}%</span>
}

function QualityBadge({ score }: { score: number | null }) {
  if (score == null) return <span className="text-gray-400">—</span>
  const color = score >= 70 ? 'text-green-600 bg-green-50' : score >= 50 ? 'text-amber-600 bg-amber-50' : 'text-red-600 bg-red-50'
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', color)}>
      {score}/100
    </span>
  )
}

export default function BacklinkProspectTable({ prospects }: { prospects: BacklinkProspect[] }) {
  const [items, setItems] = useState(prospects)
  const [expanded, setExpanded] = useState<string | null>(null)

  async function updateStatus(id: string, status: string) {
    await fetch('/api/backlinks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, status: status as BacklinkProspect['status'] } : p)))
  }

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
        <p className="text-sm text-gray-500">No backlink prospects yet.</p>
        <p className="text-xs text-gray-400 mt-1">Add prospects manually or import from Ubersuggest CSV.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200 text-xs">
            <th className="px-4 py-3 text-left font-medium text-gray-600">Website</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">Niche</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">DA/DR</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">Spam</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">Quality</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.map((p) => (
            <>
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <a
                    href={`https://${p.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-indigo-600 hover:underline font-medium"
                  >
                    {getDomain(p.website)}
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  </a>
                  {p.target_page_url && (
                    <div className="text-xs text-gray-400 mt-0.5">
                      → {truncate(p.target_page_url.replace(/^https?:\/\/[^/]+/, ''), 30)}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-600">{p.niche ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">
                  {p.domain_authority ?? p.domain_rating ?? '—'}
                </td>
                <td className="px-4 py-3">
                  <SpamBadge score={p.spam_score} />
                </td>
                <td className="px-4 py-3">
                  <QualityBadge score={p.quality_score} />
                </td>
                <td className="px-4 py-3">
                  <select
                    value={p.status}
                    onChange={(e) => updateStatus(p.id, e.target.value)}
                    className="text-xs border border-gray-200 rounded-md px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 max-w-[130px]"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => setExpanded(expanded === p.id ? null : p.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <ChevronDown className={cn('w-4 h-4 transition-transform', expanded === p.id && 'rotate-180')} />
                  </button>
                </td>
              </tr>
              {expanded === p.id && (
                <tr key={`${p.id}-expanded`}>
                  <td colSpan={7} className="px-4 py-4 bg-gray-50 border-t border-gray-100">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2 text-sm">
                        {p.contact_email && (
                          <div><span className="text-gray-500">Contact:</span> <a href={`mailto:${p.contact_email}`} className="text-indigo-600">{p.contact_email}</a></div>
                        )}
                        {p.anchor_text && (
                          <div><span className="text-gray-500">Anchor:</span> <em>"{p.anchor_text}"</em></div>
                        )}
                        {p.price != null && (
                          <div><span className="text-gray-500">Price:</span> ${p.price}</div>
                        )}
                        {p.notes && (
                          <div><span className="text-gray-500">Notes:</span> {p.notes}</div>
                        )}
                        <div>
                          <span className={cn(
                            'inline-flex px-2 py-0.5 rounded text-xs font-medium',
                            p.risk_level === 'low' ? 'text-green-700 bg-green-100' :
                            p.risk_level === 'medium' ? 'text-amber-700 bg-amber-100' :
                            'text-red-700 bg-red-100'
                          )}>
                            {p.risk_level} risk
                          </span>
                        </div>
                      </div>
                      <BacklinkChecklist prospectId={p.id} checklist={p.checklist as Record<string, boolean>} />
                    </div>
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  )
}
