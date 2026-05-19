'use client'

import { useState } from 'react'
import { InternalLinkSuggestion } from '@/lib/database.types'
import { cn, truncate, getPriorityColor } from '@/lib/utils'
import { Copy, CheckCircle2, ExternalLink } from 'lucide-react'

const STATUS_OPTIONS = ['suggested', 'added', 'skipped', 'verified'] as const

export default function InternalLinkTable({
  suggestions,
}: {
  suggestions: InternalLinkSuggestion[]
}) {
  const [items, setItems] = useState(suggestions)
  const [copied, setCopied] = useState<string | null>(null)

  async function updateStatus(id: string, status: string) {
    await fetch('/api/internal-links', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    setItems((prev) => prev.map((s) => (s.id === id ? { ...s, status: status as InternalLinkSuggestion['status'] } : s)))
  }

  function copyAnchor(id: string, text: string) {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
        <p className="text-sm text-gray-500">No internal link suggestions yet.</p>
        <p className="text-xs text-gray-400 mt-1">Click "Generate Suggestions" to find opportunities, or add one manually.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-4 py-3 text-left font-medium text-gray-600">Source Page</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">Target Page</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">Anchor Text</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">Priority</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.map((s) => (
            <tr key={s.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3">
                <a
                  href={s.source_page_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline flex items-center gap-1 font-mono text-xs"
                >
                  {truncate(s.source_page_url.replace(/^https?:\/\/[^/]+/, ''), 35)}
                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                </a>
                {s.source_page_title && (
                  <div className="text-xs text-gray-400 mt-0.5">{truncate(s.source_page_title, 40)}</div>
                )}
              </td>
              <td className="px-4 py-3">
                <a
                  href={s.target_page_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline flex items-center gap-1 font-mono text-xs"
                >
                  {truncate(s.target_page_url.replace(/^https?:\/\/[^/]+/, ''), 35)}
                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                </a>
                {s.target_page_title && (
                  <div className="text-xs text-gray-400 mt-0.5">{truncate(s.target_page_title, 40)}</div>
                )}
              </td>
              <td className="px-4 py-3">
                {s.suggested_anchor_text ? (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-800 italic">"{s.suggested_anchor_text}"</span>
                    <button
                      onClick={() => copyAnchor(s.id, s.suggested_anchor_text!)}
                      className="text-gray-400 hover:text-gray-600"
                      title="Copy anchor text"
                    >
                      {copied === s.id ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
                {s.reason && (
                  <div className="text-xs text-gray-400 mt-1">{truncate(s.reason, 60)}</div>
                )}
              </td>
              <td className="px-4 py-3">
                <span
                  className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
                    getPriorityColor(s.priority)
                  )}
                >
                  {s.priority}
                </span>
              </td>
              <td className="px-4 py-3">
                <select
                  value={s.status}
                  onChange={(e) => updateStatus(s.id, e.target.value)}
                  className="text-xs border border-gray-200 rounded-md px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
