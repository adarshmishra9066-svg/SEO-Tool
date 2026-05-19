'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import type { BlogBrief } from '@/lib/database.types'

// ─── Schemas ───────────────────────────────────────────────────────────────────

const step1Schema = z.object({
  source_type: z.enum(['manual', 'gsc_opportunity', 'competitor_gap']),
  topic: z.string().min(3, 'Topic must be at least 3 characters'),
  keyword: z.string().optional(),
  target_audience: z.string().optional(),
  content_angle: z.string().optional(),
})

type Step1Values = z.infer<typeof step1Schema>

// ─── Step indicators ───────────────────────────────────────────────────────────

interface StepIndicatorProps {
  steps: string[]
  current: number
}

function StepIndicator({ steps, current }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((step, idx) => (
        <React.Fragment key={step}>
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all',
                idx < current
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : idx === current
                    ? 'border-indigo-600 text-indigo-600 bg-white'
                    : 'border-gray-200 text-gray-400 bg-white'
              )}
            >
              {idx < current ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
            </div>
            <span
              className={cn(
                'mt-1 text-xs',
                idx === current ? 'text-indigo-600 font-medium' : 'text-gray-400'
              )}
            >
              {step}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div
              className={cn(
                'flex-1 h-0.5 mx-2 mt-[-12px]',
                idx < current ? 'bg-indigo-600' : 'bg-gray-200'
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

interface BlogBriefFormProps {
  clientId: string
  gscOpportunities?: { query: string; impressions: number; position: number }[]
}

export function BlogBriefForm({ clientId, gscOpportunities = [] }: BlogBriefFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = React.useState(0)
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [generatedBrief, setGeneratedBrief] = React.useState<BlogBrief | null>(null)
  const [editedBrief, setEditedBrief] = React.useState<Partial<BlogBrief>>({})

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Step1Values>({
    resolver: zodResolver(step1Schema),
    defaultValues: { source_type: 'manual' },
  })

  const sourceType = watch('source_type')

  async function generateBrief(values: Step1Values) {
    setIsGenerating(true)
    setStep(1)

    try {
      const res = await fetch('/api/blog/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          topic: values.topic,
          source_type: values.source_type,
          keyword: values.keyword || values.topic,
          target_audience: values.target_audience,
          content_angle: values.content_angle,
        }),
      })

      if (!res.ok) throw new Error('Failed to generate brief')
      const data = await res.json()
      const brief = (data.brief ?? data) as BlogBrief
      setGeneratedBrief(brief)
      setEditedBrief(brief)
      setStep(2)
    } catch (err) {
      toast({
        title: 'Generation failed',
        description: err instanceof Error ? err.message : 'Something went wrong',
        variant: 'destructive',
      })
      setStep(0)
    } finally {
      setIsGenerating(false)
    }
  }

  async function saveBrief() {
    if (!generatedBrief?.id) {
      toast({ title: 'Error', description: 'No brief to save', variant: 'destructive' })
      return
    }
    router.push(`/clients/${clientId}/blog/${generatedBrief.id}`)
  }

  async function generateDraftNow() {
    if (!generatedBrief?.id) return
    router.push(`/clients/${clientId}/blog/${generatedBrief.id}?generate=true`)
  }

  // ─── Step 0: Topic source ───────────────────────────────────────────────────

  const renderStep0 = () => (
    <form onSubmit={handleSubmit(generateBrief)} className="space-y-6">
      {/* Source type */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Topic Source</Label>
        <div className="grid gap-3">
          {[
            {
              value: 'manual',
              label: 'Manual Topic',
              desc: 'Enter a topic or keyword you want to cover',
            },
            {
              value: 'gsc_opportunity',
              label: 'From GSC Opportunity',
              desc: 'Select a keyword already getting impressions in search',
            },
            {
              value: 'competitor_gap',
              label: 'From Competitor Gap',
              desc: 'Target keywords competitors rank for that you do not',
            },
          ].map((opt) => (
            <label
              key={opt.value}
              className={cn(
                'flex items-start gap-3 rounded-xl border-2 p-4 cursor-pointer transition-all',
                sourceType === opt.value
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <input
                type="radio"
                value={opt.value}
                {...register('source_type')}
                className="mt-0.5 accent-indigo-600"
              />
              <div>
                <p className="font-medium text-sm text-gray-900">{opt.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* GSC opportunities dropdown */}
      {sourceType === 'gsc_opportunity' && gscOpportunities.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="gsc-select">Select GSC Keyword</Label>
          <select
            id="gsc-select"
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onChange={(e) => {
              const selected = gscOpportunities.find((o) => o.query === e.target.value)
              if (selected) {
                setValue('topic', selected.query)
                setValue('keyword', selected.query)
              }
            }}
          >
            <option value="">-- Select a keyword --</option>
            {gscOpportunities.map((opp) => (
              <option key={opp.query} value={opp.query}>
                {opp.query} — {opp.impressions.toLocaleString()} impressions, pos{' '}
                {opp.position.toFixed(1)}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Topic input */}
      <div className="space-y-2">
        <Label htmlFor="topic">
          {sourceType === 'manual' ? 'Blog Topic' : 'Primary Keyword / Topic'}
        </Label>
        <Input
          id="topic"
          {...register('topic')}
          placeholder={
            sourceType === 'manual'
              ? 'e.g. How to choose a plumber in Sydney'
              : 'e.g. emergency plumber cost'
          }
          className={errors.topic ? 'border-red-500' : ''}
        />
        {errors.topic && <p className="text-xs text-red-500">{errors.topic.message}</p>}
      </div>

      {/* Optional fields */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="keyword">Primary Keyword (optional)</Label>
          <Input
            id="keyword"
            {...register('keyword')}
            placeholder="Exact keyword to target"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="target_audience">Target Audience (optional)</Label>
          <Input
            id="target_audience"
            {...register('target_audience')}
            placeholder="e.g. Homeowners in Melbourne"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="content_angle">Content Angle (optional)</Label>
        <Input
          id="content_angle"
          {...register('content_angle')}
          placeholder="e.g. Expert guide for first-time buyers"
        />
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isGenerating}
          className="gap-2 bg-indigo-600 hover:bg-indigo-700"
        >
          Generate Brief
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </form>
  )

  // ─── Step 1: Loading ────────────────────────────────────────────────────────

  const renderStep1 = () => (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
      <p className="text-lg font-semibold text-gray-800">Generating your blog brief...</p>
      <p className="text-sm text-gray-500 mt-2 max-w-sm">
        Our AI is analysing your topic, client context, and search data to create a comprehensive
        brief.
      </p>
    </div>
  )

  // ─── Step 2: Review & Save ─────────────────────────────────────────────────

  const renderStep2 = () => {
    if (!generatedBrief) return null
    const brief = { ...generatedBrief, ...editedBrief }

    return (
      <div className="space-y-6">
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
          <p className="text-sm text-indigo-700">
            Your brief has been generated and saved. Review and edit it below, then choose to view
            the full brief or generate a draft immediately.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={editedBrief.title ?? brief.title}
              onChange={(e) => setEditedBrief((p) => ({ ...p, title: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Primary Keyword</Label>
            <Input
              value={editedBrief.primary_keyword ?? brief.primary_keyword ?? ''}
              onChange={(e) => setEditedBrief((p) => ({ ...p, primary_keyword: e.target.value }))}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Search Intent</Label>
            <select
              value={editedBrief.search_intent ?? brief.search_intent ?? 'informational'}
              onChange={(e) => setEditedBrief((p) => ({ ...p, search_intent: e.target.value }))}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="informational">Informational</option>
              <option value="commercial">Commercial</option>
              <option value="transactional">Transactional</option>
              <option value="navigational">Navigational</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Funnel Stage</Label>
            <select
              value={editedBrief.funnel_stage ?? brief.funnel_stage ?? 'top'}
              onChange={(e) => setEditedBrief((p) => ({ ...p, funnel_stage: e.target.value }))}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="top">Top of Funnel</option>
              <option value="middle">Middle of Funnel</option>
              <option value="bottom">Bottom of Funnel</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Word Count Target</Label>
            <Input
              type="number"
              value={editedBrief.recommended_word_count ?? brief.recommended_word_count ?? 1800}
              onChange={(e) =>
                setEditedBrief((p) => ({ ...p, recommended_word_count: parseInt(e.target.value) }))
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Content Angle</Label>
          <Textarea
            value={editedBrief.content_angle ?? brief.content_angle ?? ''}
            onChange={(e) => setEditedBrief((p) => ({ ...p, content_angle: e.target.value }))}
            rows={2}
          />
        </div>

        {/* Secondary keywords */}
        <div className="space-y-2">
          <Label>Secondary Keywords</Label>
          <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 min-h-[44px]">
            {(brief.secondary_keywords ?? []).map((kw, i) => (
              <Badge key={i} variant="secondary">
                {kw}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 justify-between pt-2">
          <Button variant="outline" onClick={() => setStep(0)} className="gap-1">
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" onClick={saveBrief}>
              View Full Brief
            </Button>
            <Button
              onClick={generateDraftNow}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700"
            >
              Generate Draft Now
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <StepIndicator steps={['Topic Source', 'Generating', 'Review & Save']} current={step} />

      {step === 0 && renderStep0()}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
    </div>
  )
}
