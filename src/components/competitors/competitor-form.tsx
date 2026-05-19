'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/use-toast'

const schema = z.object({
  url: z
    .string()
    .min(1, 'URL is required')
    .transform((v) => {
      const s = v.trim()
      if (s.startsWith('http')) return s
      return `https://${s}`
    }),
  name: z.string().optional(),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface CompetitorFormProps {
  clientId: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function CompetitorForm({ clientId, onSuccess, onCancel }: CompetitorFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (values: FormValues) => {
    try {
      const res = await fetch('/api/competitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          url: values.url,
          name: values.name || null,
          notes: values.notes || null,
        }),
      })

      const data = await res.json() as { error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Failed to add competitor')

      toast({ title: 'Competitor added', variant: 'success' })
      reset()
      onSuccess?.()
    } catch (err) {
      toast({
        title: 'Failed to add competitor',
        description: (err as Error).message,
        variant: 'destructive',
      })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="comp-url" className="text-xs font-medium">
          Competitor Website URL <span className="text-red-500">*</span>
        </Label>
        <Input
          id="comp-url"
          placeholder="https://competitor.com"
          className="mt-1 text-sm"
          {...register('url')}
        />
        {errors.url && (
          <p className="text-xs text-red-500 mt-1">{errors.url.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="comp-name" className="text-xs font-medium">
          Name <span className="text-gray-400 font-normal">(optional)</span>
        </Label>
        <Input
          id="comp-name"
          placeholder="e.g. Acme Accounting"
          className="mt-1 text-sm"
          {...register('name')}
        />
      </div>

      <div>
        <Label htmlFor="comp-notes" className="text-xs font-medium">
          Notes <span className="text-gray-400 font-normal">(optional)</span>
        </Label>
        <Textarea
          id="comp-notes"
          placeholder="Why is this a competitor? What are their strengths/weaknesses?"
          className="mt-1 text-sm resize-none"
          rows={3}
          {...register('notes')}
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting ? 'Adding…' : 'Add Competitor'}
        </Button>
        {onCancel && (
          <Button type="button" size="sm" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
