import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import CompetitorList from '@/components/competitors/competitor-list'
import CompetitorForm from '@/components/competitors/competitor-form'

export default async function CompetitorsPage({
  params,
}: {
  params: Promise<{ clientId: string }>
}) {
  const { clientId } = await params
  const supabase = await createClient()

  const [{ data: client }, { data: competitors }] = await Promise.all([
    supabase.from('clients').select('id, name, website_url').eq('id', clientId).single(),
    supabase
      .from('competitors')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false }),
  ])

  if (!client) notFound()

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Competitors</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track competitor sites to find keyword gaps, content opportunities, and backlink targets.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CompetitorList competitors={competitors ?? []} clientId={clientId} />
        </div>
        <div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Add Competitor</h3>
            <CompetitorForm clientId={clientId} />
          </div>
          <div className="mt-4 bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-sm text-indigo-700">
            <p className="font-medium mb-1">Import competitor data</p>
            <p className="text-indigo-600">
              Upload a competitor keyword CSV from Ubersuggest via the{' '}
              <a href={`/clients/${clientId}/integrations`} className="underline font-medium">
                Integrations
              </a>{' '}
              tab to populate keyword gaps automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
