'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { BarChart2, RefreshCw, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/components/ui/use-toast'
import { formatRelativeDate } from '@/lib/utils'

const schema = z.object({
  property_id: z.string().min(1, 'Property ID is required'),
  property_name: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface Ga4ConnectProps {
  clientId: string
  initialProperty?: {
    id: string
    property_id: string
    property_name: string | null
    is_connected: boolean
    last_synced: string | null
  } | null
}

export function Ga4Connect({ clientId, initialProperty }: Ga4ConnectProps) {
  const [property, setProperty] = React.useState(initialProperty ?? null)
  const [saving, setSaving] = React.useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      property_id: property?.property_id ?? '',
      property_name: property?.property_name ?? '',
    },
  })

  const onSave = async (values: FormValues) => {
    setSaving(true)
    try {
      const res = await fetch('/api/ga4/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          property_id: values.property_id,
          property_name: values.property_name || undefined,
        }),
      })
      const data = await res.json() as {
        success?: boolean
        property_id?: string
        rows_synced?: number
        message?: string
        error?: string
      }

      if (!res.ok) throw new Error(data.error ?? 'Failed to save')

      setProperty({
        id: data.property_id ?? '',
        property_id: values.property_id,
        property_name: values.property_name ?? null,
        is_connected: false,
        last_synced: new Date().toISOString(),
      })

      toast({
        title: 'GA4 connected',
        description: `${data.rows_synced ?? 0} landing pages synced with mock data`,
        variant: 'success',
      })
    } catch (err) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
            <BarChart2 className="w-4 h-4 text-orange-600" />
          </div>
          <div>
            <CardTitle className="text-base">Google Analytics 4</CardTitle>
            <CardDescription className="text-xs">
              Connect to sync landing page sessions, conversions, and engagement data
            </CardDescription>
          </div>
          <div className="ml-auto">
            {property?.last_synced ? (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                <AlertCircle className="w-3 h-3" />
                Mock data
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500">
                Not connected
              </span>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Mock data notice */}
        <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg text-xs text-orange-700">
          <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>
            Real GA4 data requires Google OAuth. Enter any Property ID and save to generate
            realistic mock landing page data for demo purposes.
          </span>
        </div>

        <form onSubmit={handleSubmit(onSave)} className="space-y-3">
          <div>
            <Label htmlFor="ga4-property-id" className="text-xs font-medium">
              GA4 Property ID
            </Label>
            <Input
              id="ga4-property-id"
              placeholder="e.g. 123456789"
              className="text-sm mt-1"
              {...register('property_id')}
            />
            {errors.property_id && (
              <p className="text-xs text-red-500 mt-1">{errors.property_id.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="ga4-property-name" className="text-xs font-medium">
              Property Name <span className="text-gray-400 font-normal">(optional)</span>
            </Label>
            <Input
              id="ga4-property-name"
              placeholder="e.g. My Website - GA4"
              className="text-sm mt-1"
              {...register('property_name')}
            />
          </div>

          <Button type="submit" size="sm" disabled={saving} className="w-full">
            {saving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin" />
                Connecting…
              </>
            ) : (
              'Save & Sync Mock Data'
            )}
          </Button>
        </form>

        {/* Connected state */}
        {property?.last_synced && (
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
            <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
            <div>
              <p className="text-xs font-medium text-gray-700">
                {property.property_name ?? `Property ${property.property_id}`}
              </p>
              <p className="text-xs text-gray-500">
                Last synced {formatRelativeDate(property.last_synced)}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
