'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'
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
import { cn } from '@/lib/utils'
import { INDUSTRIES, PRIORITY_LEVELS, CLIENT_STATUSES } from '@/lib/constants'
import { toast } from '@/components/ui/use-toast'

const clientSchema = z.object({
  // Step 1
  name: z.string().min(2, 'Client name must be at least 2 characters'),
  website_url: z.string().url('Please enter a valid URL (include https://)'),
  industry: z.string().optional(),
  target_location: z.string().optional(),
  // Step 2
  services_products: z.string().optional(),
  main_goals: z.string().optional(),
  primary_conversion_goal: z.string().optional(),
  target_audience: z.string().optional(),
  brand_tone: z.string().optional(),
  content_style_notes: z.string().optional(),
  client_expectations_notes: z.string().optional(),
  // Step 3
  retainer_value: z.string().optional(),
  priority_level: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  client_status: z.enum(['active', 'paused', 'onboarding', 'churned']).optional(),
})

type ClientFormData = z.infer<typeof clientSchema>

const STEPS = [
  { id: 1, label: 'Basic Info' },
  { id: 2, label: 'Business Context' },
  { id: 3, label: 'Account Details' },
]

interface ClientFormProps {
  agencyId: string
}

export function ClientForm({ agencyId }: ClientFormProps) {
  const router = useRouter()
  const [step, setStep] = React.useState(1)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      priority_level: 'medium',
      client_status: 'active',
    },
  })

  const handleNext = async () => {
    let fieldsToValidate: (keyof ClientFormData)[] = []
    if (step === 1) fieldsToValidate = ['name', 'website_url']
    const valid = await trigger(fieldsToValidate)
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length))
  }

  const onSubmit = async (data: ClientFormData) => {
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          agency_id: agencyId,
          retainer_value: data.retainer_value
            ? parseFloat(data.retainer_value)
            : null,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Failed to create client')
      }

      const client = await res.json()
      toast({ title: 'Client created', description: `${data.name} has been added.`, variant: 'success' })
      router.push(`/clients/${client.id}`)
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

  const priorityLevel = watch('priority_level')
  const clientStatus = watch('client_status')
  const industry = watch('industry')

  return (
    <div className="max-w-2xl mx-auto">
      {/* Step indicator */}
      <div className="flex items-center justify-center mb-8">
        {STEPS.map((s, i) => (
          <React.Fragment key={s.id}>
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors',
                  step > s.id
                    ? 'bg-indigo-600 text-white'
                    : step === s.id
                    ? 'bg-indigo-600 text-white ring-4 ring-indigo-100'
                    : 'bg-gray-100 text-gray-400'
                )}
              >
                {step > s.id ? <Check className="w-4 h-4" /> : s.id}
              </div>
              <span
                className={cn(
                  'text-xs font-medium',
                  step >= s.id ? 'text-indigo-600' : 'text-gray-400'
                )}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-0.5 mx-3 mb-4',
                  step > s.id ? 'bg-indigo-600' : 'bg-gray-200'
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Start with the essentials about this client.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="name">Client / Business Name *</Label>
              <Input
                id="name"
                placeholder="e.g. Acme Plumbing Services"
                error={!!errors.name}
                {...register('name')}
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="website_url">Website URL *</Label>
              <Input
                id="website_url"
                placeholder="https://example.com"
                error={!!errors.website_url}
                {...register('website_url')}
              />
              {errors.website_url && (
                <p className="text-xs text-red-500">{errors.website_url.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="industry">Industry</Label>
              <Select
                value={industry}
                onValueChange={(v) => setValue('industry', v)}
              >
                <SelectTrigger id="industry">
                  <SelectValue placeholder="Select industry..." />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((ind) => (
                    <SelectItem key={ind.value} value={ind.value}>
                      {ind.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="target_location">Target Location</Label>
              <Input
                id="target_location"
                placeholder="e.g. Sydney, NSW / National / USA"
                {...register('target_location')}
              />
              <p className="text-xs text-gray-400">
                The geographic area this business targets (for local SEO context).
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Business Context */}
        {step === 2 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Business Context</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                This context powers AI-driven recommendations and content strategies.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="services_products">Services / Products</Label>
              <Textarea
                id="services_products"
                placeholder="List the main services or products offered..."
                rows={3}
                {...register('services_products')}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="main_goals">Main Business Goals</Label>
              <Textarea
                id="main_goals"
                placeholder="e.g. Increase qualified leads, rank #1 for X keywords, grow organic traffic by 50%..."
                rows={3}
                {...register('main_goals')}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="primary_conversion_goal">Primary Conversion Goal</Label>
              <Input
                id="primary_conversion_goal"
                placeholder="e.g. Phone call enquiries, form submissions, product purchases"
                {...register('primary_conversion_goal')}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="target_audience">Target Audience</Label>
              <Textarea
                id="target_audience"
                placeholder="e.g. Homeowners aged 35-65 in Sydney metro area looking for emergency plumbing..."
                rows={2}
                {...register('target_audience')}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="brand_tone">Brand Tone & Voice</Label>
              <Input
                id="brand_tone"
                placeholder="e.g. Professional, friendly, authoritative, conversational"
                {...register('brand_tone')}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="client_expectations_notes">Client Expectations & Notes</Label>
              <Textarea
                id="client_expectations_notes"
                placeholder="Any specific preferences, restrictions, or important context the team should know..."
                rows={3}
                {...register('client_expectations_notes')}
              />
            </div>
          </div>
        )}

        {/* Step 3: Account Details */}
        {step === 3 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Account Details</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Set up the account management settings for this client.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="retainer_value">Monthly Retainer Value (USD)</Label>
              <Input
                id="retainer_value"
                type="number"
                placeholder="e.g. 2500"
                min="0"
                step="100"
                {...register('retainer_value')}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Client Status</Label>
              <Select
                value={clientStatus}
                onValueChange={(v) =>
                  setValue('client_status', v as ClientFormData['client_status'])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CLIENT_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Priority Level</Label>
              <Select
                value={priorityLevel}
                onValueChange={(v) =>
                  setValue('priority_level', v as ClientFormData['priority_level'])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_LEVELS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-400">
                This affects how prominently the client appears in your dashboard.
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => (step === 1 ? router.back() : setStep((s) => s - 1))}
          >
            <ChevronLeft className="w-4 h-4" />
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>

          {step < STEPS.length ? (
            <Button type="button" onClick={handleNext}>
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button type="submit" loading={isSubmitting}>
              {isSubmitting ? 'Creating client...' : 'Create Client'}
              {!isSubmitting && <Check className="w-4 h-4" />}
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
