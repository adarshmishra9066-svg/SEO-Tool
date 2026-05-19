import * as React from 'react'
import Link from 'next/link'
import { Zap, ArrowRight, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate, getImpactColor } from '@/lib/utils'
import type { Task, Client } from '@/lib/database.types'

interface TaskWithClient extends Task {
  client: Pick<Client, 'id' | 'name'>
}

interface DoThisFirstProps {
  tasks: TaskWithClient[]
}

const effortLabel: Record<string, string> = {
  low: 'Quick win',
  medium: 'Medium effort',
  high: 'High effort',
}

const effortColor: Record<string, string> = {
  low: 'success',
  medium: 'warning',
  high: 'danger',
}

export function DoThisFirst({ tasks }: DoThisFirstProps) {
  if (tasks.length === 0) {
    return (
      <Card className="border-indigo-100 bg-indigo-50/40">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="p-1.5 rounded-lg bg-indigo-100">
              <Zap className="w-4 h-4 text-indigo-600" />
            </div>
            Do This First Today
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-3">
              <Zap className="w-5 h-5 text-indigo-400" />
            </div>
            <p className="text-sm font-medium text-gray-700">All caught up!</p>
            <p className="text-xs text-gray-500 mt-1">
              No high-priority tasks pending. Great work!
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-indigo-100 shadow-sm">
      <CardHeader className="pb-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="p-1.5 rounded-lg bg-indigo-600">
              <Zap className="w-4 h-4 text-white" />
            </div>
            Do This First Today
            <Badge variant="default" className="ml-1 text-xs px-1.5 py-0">
              {tasks.length}
            </Badge>
          </CardTitle>
          <Link
            href="/tasks"
            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
          >
            View all tasks <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="pt-0 divide-y divide-gray-50">
        {tasks.map((task, i) => (
          <div
            key={task.id}
            className="flex items-start gap-4 py-3.5 group"
          >
            {/* Priority rank */}
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold shrink-0 mt-0.5">
              {i + 1}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2 flex-wrap">
                <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                  {task.client.name}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-900 mt-1 leading-snug">
                {task.title}
              </p>
              {task.recommended_action && (
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                  {task.recommended_action}
                </p>
              )}
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <Badge
                  className={`text-xs px-1.5 py-0 ${getImpactColor(task.impact)}`}
                >
                  {task.impact === 'very_high' ? 'Very High Impact' : `${task.impact.charAt(0).toUpperCase() + task.impact.slice(1)} Impact`}
                </Badge>
                <Badge
                  variant={(effortColor[task.effort] as 'success' | 'warning' | 'danger') ?? 'secondary'}
                  className="text-xs px-1.5 py-0"
                >
                  {effortLabel[task.effort]}
                </Badge>
                {task.due_date && (
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(task.due_date)}
                  </span>
                )}
              </div>
            </div>

            {/* Action */}
            <Link href={`/clients/${task.client_id}/tasks`} className="shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Open
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
