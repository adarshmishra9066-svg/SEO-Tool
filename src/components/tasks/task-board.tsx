'use client'

import * as React from 'react'
import { Plus, Filter, CheckSquare, Clock, AlertCircle, ListTodo } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TaskCard } from './task-card'
import { TaskForm } from './task-form'
import { isOverdue } from '@/lib/utils'
import { TASK_TYPES, TASK_STATUSES } from '@/lib/constants'
import type { Task, Client } from '@/lib/database.types'

interface TaskBoardProps {
  initialTasks: (Task & { client?: Pick<Client, 'id' | 'name'> })[]
  clients: Pick<Client, 'id' | 'name'>[]
  defaultClientId?: string
  showClientFilter?: boolean
}

type ViewFilter = 'all' | 'today' | 'this_week' | 'overdue'

const VIEW_OPTIONS = [
  { value: 'all', label: 'All Tasks', icon: ListTodo },
  { value: 'today', label: 'Due Today', icon: CheckSquare },
  { value: 'this_week', label: 'This Week', icon: Clock },
  { value: 'overdue', label: 'Overdue', icon: AlertCircle },
] as const

function isThisWeek(date: string | null) {
  if (!date) return false
  const d = new Date(date)
  const now = new Date()
  const start = new Date(now)
  start.setDate(now.getDate() - now.getDay())
  const end = new Date(start)
  end.setDate(start.getDate() + 7)
  return d >= start && d <= end
}

function isToday(date: string | null) {
  if (!date) return false
  return new Date(date).toDateString() === new Date().toDateString()
}

export function TaskBoard({
  initialTasks,
  clients,
  defaultClientId,
  showClientFilter = false,
}: TaskBoardProps) {
  const [tasks, setTasks] = React.useState(initialTasks)
  const [showCreate, setShowCreate] = React.useState(false)
  const [viewFilter, setViewFilter] = React.useState<ViewFilter>('all')
  const [statusFilter, setStatusFilter] = React.useState<string>('all')
  const [typeFilter, setTypeFilter] = React.useState<string>('all')
  const [clientFilter, setClientFilter] = React.useState<string>('all')

  const handleStatusChange = (taskId: string, status: Task['status']) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status } : t))
    )
  }

  const handleTaskCreated = async () => {
    setShowCreate(false)
    // Refresh would be done via router.refresh() in a real app
    // For now we just close the dialog
  }

  const filtered = tasks.filter((t) => {
    if (viewFilter === 'today' && !isToday(t.due_date)) return false
    if (viewFilter === 'this_week' && !isThisWeek(t.due_date)) return false
    if (viewFilter === 'overdue' && !isOverdue(t.due_date)) return false
    if (statusFilter !== 'all' && t.status !== statusFilter) return false
    if (typeFilter !== 'all' && t.task_type !== typeFilter) return false
    if (
      clientFilter !== 'all' &&
      (t.client as Pick<Client, 'id' | 'name'> | undefined)?.id !== clientFilter
    )
      return false
    return true
  })

  const sorted = [...filtered].sort((a, b) => b.priority_score - a.priority_score)

  const overdueCnt = tasks.filter(
    (t) => isOverdue(t.due_date) && !['completed', 'skipped'].includes(t.status)
  ).length

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-200 bg-white flex-wrap">
        {/* View tabs */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {VIEW_OPTIONS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setViewFilter(value as ViewFilter)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                viewFilter === value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
              {value === 'overdue' && overdueCnt > 0 && (
                <span className="ml-1 bg-red-100 text-red-600 text-xs font-bold px-1.5 py-0 rounded-full">
                  {overdueCnt}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 ml-auto">
          <Filter className="w-3.5 h-3.5 text-gray-400" />

          {showClientFilter && (
            <Select value={clientFilter} onValueChange={setClientFilter}>
              <SelectTrigger className="h-7 text-xs w-36">
                <SelectValue placeholder="All clients" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All clients</SelectItem>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-7 text-xs w-32">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {TASK_STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-7 text-xs w-36">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {TASK_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="w-3.5 h-3.5" />
            Create Task
          </Button>
        </div>
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto p-4">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <CheckSquare className="w-6 h-6 text-gray-300" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">No tasks found</h3>
            <p className="text-sm text-gray-500 mb-5 max-w-xs">
              {viewFilter !== 'all'
                ? `No tasks match the current view. Try switching to "All Tasks".`
                : 'Create your first task to start tracking SEO work.'}
            </p>
            <Button size="sm" onClick={() => setShowCreate(true)}>
              <Plus className="w-4 h-4" />
              Create Task
            </Button>
          </div>
        ) : (
          <div className="space-y-3 max-w-4xl">
            <p className="text-xs text-gray-400 font-medium">
              Showing {sorted.length} task{sorted.length !== 1 ? 's' : ''} · Sorted by priority score
            </p>
            {sorted.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                showClient={showClientFilter}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Task Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <TaskForm
            clients={clients}
            defaultClientId={defaultClientId}
            onSuccess={handleTaskCreated}
            onCancel={() => setShowCreate(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
