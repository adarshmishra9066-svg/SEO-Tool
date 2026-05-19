import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import OpportunityList from '@/components/opportunities/opportunity-list'
import OpportunityFilters from '@/components/opportunities/opportunity-filters'
import { Zap, TrendingUp, AlertCircle } from 'lucide-react'

export default async function OpportunitiesPage({
  params,
}: {
  params: Promise<{ clientId: string }>
}) {
  const { clientId } = await params
  const supabase = await createClient()

  const [{ data: client }, { data: opportunities }] = await Promise.all([
    supabase.from('clients').select('id, name').eq('id', clientId).single(),
    supabase
      .from('opportunities')
      .select('*')
      .eq('client_id', clientId)
      .order('priority_score', { ascending: false }),
  ])

  if (!client) notFound()

  const newCount = opportunities?.filter((o) => o.status === 'new').length ?? 0
  const highImpact = opportunities?.filter((o) => o.impact === 'very_high' || o.impact === 'high').length ?? 0
  const criticalCount = opportunities?.filter((o) => o.urgency === 'critical').length ?? 0

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">SEO Opportunities</h1>
          <p className="text-sm text-gray-500 mt-1">
            Ranked by priority score — act on the highest first.
          </p>
        </div>
        <form action={`/api/opportunities?client_id=${clientId}&action=generate`} method="POST">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Zap className="w-4 h-4" />
            Generate Opportunities
          </button>
        </form>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Zap className="w-4 h-4" />
            New Opportunities
          </div>
          <div className="text-2xl font-bold text-gray-900">{newCount}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <TrendingUp className="w-4 h-4" />
            High Impact
          </div>
          <div className="text-2xl font-bold text-gray-900">{highImpact}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <AlertCircle className="w-4 h-4" />
            Critical Urgency
          </div>
          <div className="text-2xl font-bold text-red-600">{criticalCount}</div>
        </div>
      </div>

      {/* Filters + List */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-100">
          <OpportunityFilters />
        </div>
        <div className="p-4">
          <OpportunityList opportunities={opportunities ?? []} clientId={clientId} />
        </div>
      </div>
    </div>
  )
}
