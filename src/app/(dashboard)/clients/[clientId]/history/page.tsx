import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import HistoryTimeline from '@/components/history/history-timeline'

export default async function HistoryPage({
  params,
}: {
  params: Promise<{ clientId: string }>
}) {
  const { clientId } = await params
  const supabase = await createClient()

  const [{ data: client }, { data: history }] = await Promise.all([
    supabase.from('clients').select('id, name').eq('id', clientId).single(),
    supabase
      .from('client_history')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(200),
  ])

  if (!client) notFound()

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">SEO History</h1>
        <p className="text-sm text-gray-500 mt-1">
          Every action taken for {client.name} — helps explain future ranking and traffic changes.
        </p>
      </div>
      <HistoryTimeline entries={history ?? []} clientId={clientId} />
    </div>
  )
}
