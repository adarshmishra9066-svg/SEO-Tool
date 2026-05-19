'use client'

import * as React from 'react'
import { ExternalLink, Trash2, Globe, StickyNote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import { formatDate, getDomain } from '@/lib/utils'
import type { Competitor } from '@/lib/database.types'

interface CompetitorListProps {
  competitors: Competitor[]
  onDelete?: (id: string) => void
}

export function CompetitorList({ competitors, onDelete }: CompetitorListProps) {
  const [deleting, setDeleting] = React.useState<string | null>(null)

  const handleDelete = async (id: string) => {
    setDeleting(id)
    try {
      const res = await fetch(`/api/competitors/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      toast({ title: 'Competitor removed', variant: 'success' })
      onDelete?.(id)
    } catch {
      toast({ title: 'Failed to remove competitor', variant: 'destructive' })
    } finally {
      setDeleting(null)
    }
  }

  if (competitors.length === 0) {
    return (
      <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300">
        <Globe className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500">No competitors added yet</p>
        <p className="text-xs text-gray-400 mt-1">
          Add competitors above to track them and import their keyword data from Ubersuggest.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-gray-600 text-xs">Website</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600 text-xs">Name</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600 text-xs hidden md:table-cell">
              Notes
            </th>
            <th className="text-left px-4 py-3 font-medium text-gray-600 text-xs hidden sm:table-cell">
              Added
            </th>
            <th className="w-16" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {competitors.map((comp) => (
            <tr key={comp.id} className="hover:bg-gray-50 transition-colors group">
              <td className="px-4 py-3">
                <a
                  href={comp.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  <Globe className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate max-w-[140px]">{getDomain(comp.url)}</span>
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </a>
              </td>
              <td className="px-4 py-3 text-gray-700">
                {comp.name ?? <span className="text-gray-400">—</span>}
              </td>
              <td className="px-4 py-3 text-gray-500 hidden md:table-cell max-w-[200px]">
                {comp.notes ? (
                  <span className="flex items-start gap-1">
                    <StickyNote className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                    <span className="truncate text-xs">{comp.notes}</span>
                  </span>
                ) : (
                  <span className="text-gray-300">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-gray-400 text-xs hidden sm:table-cell whitespace-nowrap">
                {formatDate(comp.created_at)}
              </td>
              <td className="px-4 py-3">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  onClick={() => handleDelete(comp.id)}
                  disabled={deleting === comp.id}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default CompetitorList
