import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import BacklinkProspectTable from '@/components/backlinks/backlink-prospect-table'
import BacklinkForm from '@/components/backlinks/backlink-form'
import { ExternalLink } from 'lucide-react'

export default async function BacklinksPage({
  params,
}: {
  params: Promise<{ clientId: string }>
}) {
  const { clientId } = await params
  const supabase = await createClient()

  const [{ data: client }, { data: prospects }] = await Promise.all([
    supabase.from('clients').select('id, name').eq('id', clientId).single(),
    supabase
      .from('backlink_prospects')
      .select('*')
      .eq('client_id', clientId)
      .order('quality_score', { ascending: false }),
  ])

  if (!client) notFound()

  const pipeline: Record<string, number> = {}
  for (const p of prospects ?? []) {
    pipeline[p.status] = (pipeline[p.status] ?? 0) + 1
  }

  const live = (pipeline['live_link_verified'] ?? 0) + (pipeline['indexed'] ?? 0)
  const inProgress = (pipeline['outreach_sent'] ?? 0) + (pipeline['negotiating'] ?? 0) + (pipeline['content_required'] ?? 0) + (pipeline['content_sent'] ?? 0)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Backlink Research & Tracking</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your backlink pipeline from prospect to live link.
          </p>
        </div>
      </div>

      {/* Pipeline stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Prospects', value: pipeline['prospect_found'] ?? 0, color: 'text-gray-900' },
          { label: 'Outreach / Active', value: inProgress, color: 'text-amber-600' },
          { label: 'Live Links', value: live, color: 'text-green-600' },
          { label: 'Rejected', value: pipeline['rejected'] ?? 0, color: 'text-red-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-sm text-gray-500 mb-1">{stat.label}</div>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <BacklinkProspectTable prospects={prospects ?? []} />
        </div>
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Add Prospect
            </h3>
            <BacklinkForm clientId={clientId} />
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            <p className="font-medium mb-1">Quality first</p>
            <p>Only pursue links from sites with real organic traffic, niche relevance, and clean spam scores. A bad link does more damage than no link.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
