import { createClient } from '@/lib/supabase/server'
import type { InternalLinkSuggestion } from '@/lib/database.types'
import { notFound } from 'next/navigation'
import InternalLinkTable from '@/components/internal-links/internal-link-table'
import InternalLinkForm from '@/components/internal-links/internal-link-form'
import { Link2, CheckCircle2, AlertCircle } from 'lucide-react'

export default async function InternalLinksPage({
  params,
}: {
  params: Promise<{ clientId: string }>
}) {
  const { clientId } = await params
  const supabase = await createClient()

  const [{ data: client }, { data: suggestions }] = await Promise.all([
    supabase.from('clients').select('id, name').eq('id', clientId).single(),
    supabase
      .from('internal_link_suggestions')
      .select('*')
      .eq('client_id', clientId)
      .order('priority', { ascending: false }),
  ])

  if (!client) notFound()
  const safe = (suggestions ?? []) as InternalLinkSuggestion[]

  const suggested = safe.filter((s) => s.status === 'suggested').length ?? 0
  const added = safe.filter((s) => s.status === 'added').length ?? 0
  const verified = safe.filter((s) => s.status === 'verified').length ?? 0

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Internal Linking</h1>
          <p className="text-sm text-gray-500 mt-1">
            Move link equity to pages that need ranking support.
          </p>
        </div>
        <a
          href={`/api/internal-links?client_id=${clientId}&action=generate`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Link2 className="w-4 h-4" />
          Generate Suggestions
        </a>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <AlertCircle className="w-4 h-4" />
            Suggested
          </div>
          <div className="text-2xl font-bold text-gray-900">{suggested}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link2 className="w-4 h-4" />
            Added
          </div>
          <div className="text-2xl font-bold text-indigo-600">{added}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <CheckCircle2 className="w-4 h-4" />
            Verified
          </div>
          <div className="text-2xl font-bold text-green-600">{verified}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <InternalLinkTable suggestions={safe} />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Add Suggestion Manually</h3>
          <InternalLinkForm clientId={clientId} />
        </div>
      </div>
    </div>
  )
}
