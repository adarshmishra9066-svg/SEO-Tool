'use client'

import { cn, truncate } from '@/lib/utils'

const TYPE_COLORS: Record<string, string> = {
  blog: 'bg-indigo-100 text-indigo-700',
  report: 'bg-green-100 text-green-700',
  backlink: 'bg-amber-100 text-amber-700',
  technical: 'bg-red-100 text-red-700',
  audit: 'bg-purple-100 text-purple-700',
  outreach: 'bg-blue-100 text-blue-700',
  default: 'bg-gray-100 text-gray-600',
}

export default function CalendarEvent({
  title,
  type,
  clientName,
  onClick,
}: {
  title: string
  type: string | null
  clientName?: string
  onClick?: () => void
}) {
  const colorClass = type ? (TYPE_COLORS[type] ?? TYPE_COLORS.default) : TYPE_COLORS.default

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left px-1.5 py-0.5 rounded text-xs font-medium truncate transition-opacity hover:opacity-80',
        colorClass
      )}
      title={`${title}${clientName ? ` — ${clientName}` : ''}`}
    >
      {truncate(title, 22)}
    </button>
  )
}
