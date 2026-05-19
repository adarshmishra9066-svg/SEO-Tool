'use client'

import * as React from 'react'
import Link from 'next/link'
import { Calendar, ExternalLink, ChevronDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  cn,
  formatDate,
  isOverdue,
  getImpactColor,
  getStatusColor,
  getTaskTypeLabel,
} from '@/lib/utils'
import { TASK_STATUSES } from '@/lib/constants'
import { toast } from '@/components/ui/use-toast'
import type { Task, Client } from '@/lib/database.types'

interface TaskCardProps {
  task: Task & { client?: Pick<Client, 'id' | 'name'> }
  showClient?: boolean
  onStatusChange?: (taskId: string, status: Task['status']) => void
}

const effortLabel: Record<string, string> = {
  low: 'Quick win',
  medium: 'Medium effort',
  high: 'High effort',
}

const urgencyVariant: Record<string, string> = {
  low: 'text-gray-500',
  medium: 'text-blue-600',
  high: 'text-orange-600',
  critical: 'text-red-600',
}

export function TaskCard({ task, showClient = false, onStatusChange }: TaskCardProps) {
  const [updating, setUpdating] = React.useState(false)
  const overdue = isOverdue(task.due_date) && !['completed', 'skipped'].includes(task.status)

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true)
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error('Failed to update')
      onStatusChange?.(task.id, newStatus as Task['status'])
      toast({ title: 'Task updated', variant: 'success' })
    } catch {
      toast({ title: 'Failed to update task', variant: 'destructive' })
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div
      className={cn(
        'bg-white rounded-xl border shadow-sm p-4 transition-all hover:shadow-md group',
        overdue ? 'border-red-200' : 'border-gray-200',
        task.status === 'completed' && 'opacity-60'
      )}
    >
      {/* Priority score bar */}
      <div className="flex items-start gap-3">
        {/* Score indicator */}
        <div
          className={cn(
            'flex flex-col items-center justify-center w-10 h-10 rounded-lg shrink-0 font-bold text-sm',
            task.priority_score >= 80
              ? 'bg-red-50 text-red-700'
              : task.priority_score >= 60
              ? 'bg-orange-50 text-orange-700'
              : task.priority_score >= 40
              ? 'bg-amber-50 text-amber-700'
              : 'bg-gray-50 text-gray-600'
          )}
        >
          {task.priority_score}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Client chip */}
          {showClient && task.client && (
            <Link
              href={`/clients/${task.client.id}`}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700 mb-1 block"
            >
              {task.client.name}
            </Link>
          )}

          <h3 className="text-sm font-semibold text-gray-900 leading-snug">{task.title}</h3>

          {/* Type + Urgency */}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {getTaskTypeLabel(task.task_type)}
            </span>
            {task.urgency !== 'low' && (
              <span className={cn('text-xs font-medium', urgencyVariant[task.urgency])}>
                {task.urgency.charAt(0).toUpperCase() + task.urgency.slice(1)} urgency
              </span>
            )}
            {overdue && (
              <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                Overdue
              </span>
            )}
          </div>

          {/* Description */}
          {task.recommended_action && (
            <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
              {task.recommended_action}
            </p>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <Badge className={cn('text-xs px-1.5 py-0', getImpactColor(task.impact))}>
              {task.impact === 'very_high' ? 'Very High Impact' : `${task.impact.charAt(0).toUpperCase() + task.impact.slice(1)} Impact`}
            </Badge>
            <span className="text-xs text-gray-400">{effortLabel[task.effort]}</span>
            {task.due_date && (
              <span
                className={cn(
                  'text-xs flex items-center gap-1',
                  overdue ? 'text-red-500' : 'text-gray-400'
                )}
              >
                <Calendar className="w-3 h-3" />
                {formatDate(task.due_date)}
              </span>
            )}
            {task.related_page_url && (
              <a
                href={task.related_page_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-indigo-500 hover:text-indigo-600 flex items-center gap-1"
              >
                <ExternalLink className="w-2.5 h-2.5" />
                Related page
              </a>
            )}
          </div>
        </div>

        {/* Status selector */}
        <div className="shrink-0">
          <Select
            value={task.status}
            onValueChange={handleStatusChange}
            disabled={updating}
          >
            <SelectTrigger
              className={cn(
                'h-7 text-xs px-2 min-w-[110px] border',
                getStatusColor(task.status)
              )}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TASK_STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value} className="text-xs">
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
