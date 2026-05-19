'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Globe, RefreshCw, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/components/ui/use-toast'
import { formatRelativeDate } from '@/lib/utils'

const schema = z.object({
  property_url: z.string().min(1, 'Property URL is required'),
})

type FormValues = z.infer<typeof schema>

interface GscConnectProps {
  clientId: string
  initialProperty?: {
    id: string
    property_url: string
    is_connected: boolean
    last_synced: string | null
  } | null
}

export function GscConnect({ clientId, initialProperty }: GscConnectProps) {
  const [property, setProperty] = React.useState(initialProperty ?? null)
  const [saving, setSaving] = React.useState(false)
  const [syncing, setSyncing] = React.useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { property_url: property?.property_url ?? '' },
  })

  const onSave = async (values: FormValues) => {
    setSaving(true)
    try {
      const res = await fetch('/api/gsc/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: clientId, property_url: values.property_url }),
      })
      const data = await res.json() as { success?: boolean; property_id?: string; message?: string; error?: string }

      if (!res.ok) throw new Error(data.error ?? 'Failed to save')

      setProperty({
        id: data.property_id ?? '',
        property_url: values.property_url,
        is_connected: false,
        last_synced: null,
      })
      toast({ title: 'GSC property saved', description: data.message, variant: 'success' })
    } catch (err) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const onSync = async () => {
    setSyncing(true)
    try {
      const res = await fetch('/api/gsc/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: clientId }),
      })
      const data = await res.json() as { success?: boolean; rows_synced?: number; note?: string; error?: string }

      if (!res.ok) throw new Error(data.error ?? 'Sync failed')

      setProperty((prev) =>
        prev ? { ...prev, last_synced: new Date().toISOString() } : prev
      )
      toast({
        title: `Synced ${data.rows_synced ?? 0} queries`,
        description: data.note,
        variant: 'success',
      })
    } catch (err) {
      toast({ title: 'Sync failed', description: (err as Error).message, variant: 'destructive' })
    } finally {
      setSyncing(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Globe className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-base">Google Search Console</CardTitle>
            <CardDescription className="text-xs">
              Connect to sync keyword rankings and search performance data
            </CardDescription>
          </div>
          <div className="ml-auto">
            {property ? (
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
        <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
          <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>
            Real Google OAuth requires credentials set in your environment. Use{' '}
            <strong>Sync Mock Data</strong> to generate realistic demo data for testing.
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSave)} className="space-y-3">
          <div>
            <Label htmlFor="gsc-property" className="text-xs font-medium">
              Property URL
            </Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="gsc-property"
                placeholder="https://example.com or sc-domain:example.com"
                className="text-sm"
                {...register('property_url')}
              />
              <Button type="submit" size="sm" disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </Button>
            </div>
            {errors.property_url && (
              <p className="text-xs text-red-500 mt-1">{errors.property_url.message}</p>
            )}
          </div>
        </form>

        {/* Sync section */}
        {property && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div>
              <p className="text-xs font-medium text-gray-700">{property.property_url}</p>
              {property.last_synced ? (
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  Last synced {formatRelativeDate(property.last_synced)}
                </p>
              ) : (
                <p className="text-xs text-gray-400 mt-0.5">Never synced</p>
              )}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={onSync}
              disabled={syncing}
              className="gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing…' : 'Sync Mock Data'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
