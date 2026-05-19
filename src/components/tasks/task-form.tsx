'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { TASK_TYPES, IMPACT_LEVELS, EFFORT_LEVELS, URGENCY_LEVELS } from '@/lib/constants'
import { toast } from '@/components/ui/use-toast'
import type { Client } from '@/lib/database.types'

const taskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  task_type: z.string().min(1, 'Please select a task type'),
  impact: z.enum(['low', 'medium', 'high', 'very_high']).default('medium'),
  effort: z.enum(['low', 'medium', 'high']).default('medium'),
  urgency: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  priority_score: z.string().optional(),
  due_date: z.string().optional(),
  related_page_url: z.string().url().optional().or(z.literal('')),
  related_keyword: z.string().optional(),
  recommended_action: z.string().optional(),
  notes: z.string().optional(),
  client_id: z.string().min(1, 'Client is required'),
})

type TaskFormData = z.infer<typeof taskSchema>

interface TaskFormProps {
  clients: Pick<Client, 'id' | 'name'>[]
  defaultClientId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function TaskForm({ clients, defaultClientId, onSuccess, onCancel }: TaskFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      impact: 'medium',
      effort: 'medium',
      urgency: 'medium',
      client_id: defaultClientId ?? '',
    },
  })

  const taskType = watch('task_type')
  const impact = watch('impact')
  const effort = watch('effort')
  const urgency = watch('urgency')
  const clientId = watch('client_id')

  const onSubmit = async (data: TaskFormData) => {
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          priority_score: data.priority_score ? parseInt(data.priority_score) : 50,
          related_page_url: data.related_page_url || null,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Failed to create task')
      }

      toast({ title: 'Task created', description: data.title, variant: 'success' })
      onSuccess?.()
    } catch (e) {
      toast({
        title: 'Error',
        description: e instanceof Error ? e.message : 'Something went wrong',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Create New Task</DialogTitle>
        <DialogDescription>
          Add a new SEO task. Assign it to a client and set priority details.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
        {/* Title */}
        <div className="space-y-1.5">
          <Label htmlFor="title">Task Title *</Label>
          <Input
            id="title"
            placeholder="e.g. Rewrite meta title for service page"
            error={!!errors.title}
            {...register('title')}
          />
          {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
        </div>

        {/* Client */}
        {!defaultClientId && (
          <div className="space-y-1.5">
            <Label>Client *</Label>
            <Select value={clientId} onValueChange={(v) => setValue('client_id', v)}>
              <SelectTrigger error={!!errors.client_id}>
                <SelectValue placeholder="Select client..." />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.client_id && (
              <p className="text-xs text-red-500">{errors.client_id.message}</p>
            )}
          </div>
        )}

        {/* Task Type */}
        <div className="space-y-1.5">
          <Label>Task Type *</Label>
          <Select value={taskType} onValueChange={(v) => setValue('task_type', v)}>
            <SelectTrigger error={!!errors.task_type}>
              <SelectValue placeholder="Select task type..." />
            </SelectTrigger>
            <SelectContent>
              {TASK_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.task_type && (
            <p className="text-xs text-red-500">{errors.task_type.message}</p>
          )}
        </div>

        {/* Impact / Effort / Urgency */}
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label>Impact</Label>
            <Select value={impact} onValueChange={(v) => setValue('impact', v as TaskFormData['impact'])}>
              <SelectTrigger className="text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {IMPACT_LEVELS.map((l) => (
                  <SelectItem key={l.value} value={l.value} className="text-xs">
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Effort</Label>
            <Select value={effort} onValueChange={(v) => setValue('effort', v as TaskFormData['effort'])}>
              <SelectTrigger className="text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EFFORT_LEVELS.map((l) => (
                  <SelectItem key={l.value} value={l.value} className="text-xs">
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Urgency</Label>
            <Select value={urgency} onValueChange={(v) => setValue('urgency', v as TaskFormData['urgency'])}>
              <SelectTrigger className="text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {URGENCY_LEVELS.map((l) => (
                  <SelectItem key={l.value} value={l.value} className="text-xs">
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Due Date */}
        <div className="space-y-1.5">
          <Label htmlFor="due_date">Due Date</Label>
          <Input id="due_date" type="date" {...register('due_date')} />
        </div>

        {/* Recommended Action */}
        <div className="space-y-1.5">
          <Label htmlFor="recommended_action">Recommended Action</Label>
          <Textarea
            id="recommended_action"
            placeholder="What specific action should be taken?"
            rows={2}
            {...register('recommended_action')}
          />
        </div>

        {/* Related Page */}
        <div className="space-y-1.5">
          <Label htmlFor="related_page_url">Related Page URL</Label>
          <Input
            id="related_page_url"
            placeholder="https://example.com/page"
            {...register('related_page_url')}
          />
        </div>

        {/* Related Keyword */}
        <div className="space-y-1.5">
          <Label htmlFor="related_keyword">Related Keyword</Label>
          <Input
            id="related_keyword"
            placeholder="e.g. emergency plumber sydney"
            {...register('related_keyword')}
          />
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            Create Task
          </Button>
        </DialogFooter>
      </form>
    </>
  )
}
