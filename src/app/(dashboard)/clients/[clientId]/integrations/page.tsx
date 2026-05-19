import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import GscConnect from '@/components/integrations/gsc-connect'
import Ga4Connect from '@/components/integrations/ga4-connect'
import UbersuggestImport from '@/components/integrations/ubersuggest-import'
import { Database, BarChart3, Upload } from 'lucide-react'
import UbersuggestLive from '@/components/integrations/ubersuggest-live'
import type { GscProperty, Ga4PropertyRow } from '@/lib/database.types'

export default async function IntegrationsPage({
  params,
}: {
  params: Promise<{ clientId: string }>
}) {
  const { clientId } = await params
  const supabase = await createClient()

  const [{ data: client }, { data: gscProps }, { data: ga4Props }] = await Promise.all([
    supabase.from('clients').select('id, name, website_url').eq('id', clientId).single(),
    supabase.from('gsc_properties').select('*').eq('client_id', clientId),
    supabase.from('ga4_properties').select('*').eq('client_id', clientId),
  ])

  if (!client) notFound()
  const safeClient = client as { id: string; name: string; website_url: string }
  const gscProperty = ((gscProps ?? []) as GscProperty[])[0] ?? null
  const ga4Property = ((ga4Props ?? []) as Ga4PropertyRow[])[0] ?? null

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Integrations</h1>
        <p className="text-sm text-gray-500 mt-1">
          Connect data sources for {safeClient.name} to unlock opportunities and reports.
        </p>
      </div>

      <div className="grid gap-6">
        {/* GSC */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Database className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Google Search Console</h2>
              <p className="text-sm text-gray-500">Clicks, impressions, positions, and query data</p>
            </div>
            <div className="ml-auto">
              {gscProperty?.is_connected ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Connected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                  Not connected
                </span>
              )}
            </div>
          </div>
          <GscConnect clientId={clientId} initialProperty={gscProperty} />
        </div>

        {/* GA4 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Google Analytics 4</h2>
              <p className="text-sm text-gray-500">Sessions, conversions, engagement, and landing pages</p>
            </div>
            <div className="ml-auto">
              {ga4Property?.is_connected ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Connected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                  Not connected
                </span>
              )}
            </div>
          </div>
          <Ga4Connect clientId={clientId} initialProperty={ga4Property} />
        </div>

        {/* Ubersuggest — Live */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Upload className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Ubersuggest</h2>
              <p className="text-sm text-gray-500">
                Live site audit, domain overview, and keyword data — no CSV needed
              </p>
            </div>
            <span className="ml-auto text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
              Live
            </span>
          </div>
          <UbersuggestLive clientId={clientId} />
        </div>
      </div>
    </div>
  )
}
