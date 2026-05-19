import { createClient } from '@/lib/supabase/server'
import type { TechnicalIssue } from '@/lib/database.types'
import { notFound } from 'next/navigation'
import TechnicalChecklist from '@/components/technical/technical-checklist'
import { ShieldCheck } from 'lucide-react'

export default async function TechnicalSEOPage({
  params,
}: {
  params: Promise<{ clientId: string }>
}) {
  const { clientId } = await params
  const supabase = await createClient()

  const [{ data: client }, { data: issues }] = await Promise.all([
    supabase.from('clients').select('id, name').eq('id', clientId).single(),
    supabase
      .from('technical_issues')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false }),
  ])

  if (!client) notFound()
  const safe = (issues ?? []) as TechnicalIssue[]

  const critical = safe.filter((i) => i.severity === 'critical').length ?? 0
  const high = safe.filter((i) => i.severity === 'high').length ?? 0
  const open = safe.filter((i) => i.status === 'open').length ?? 0

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Technical SEO</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track and fix technical issues that affect crawling, indexing, and ranking.
          </p>
        </div>
      </div>

      {/* Severity Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="text-sm text-red-600 font-medium mb-1">Critical</div>
          <div className="text-2xl font-bold text-red-700">{critical}</div>
          <div className="text-xs text-red-500 mt-1">Fix immediately</div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="text-sm text-orange-600 font-medium mb-1">High Priority</div>
          <div className="text-2xl font-bold text-orange-700">{high}</div>
          <div className="text-xs text-orange-500 mt-1">Fix this week</div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 font-medium mb-1">
            <ShieldCheck className="w-4 h-4" />
            Open Issues
          </div>
          <div className="text-2xl font-bold text-gray-900">{open}</div>
          <div className="text-xs text-gray-500 mt-1">Total open</div>
        </div>
      </div>

      <TechnicalChecklist issues={safe} />
    </div>
  )
}
