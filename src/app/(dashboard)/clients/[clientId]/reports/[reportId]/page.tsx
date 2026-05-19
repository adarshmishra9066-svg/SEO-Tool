import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ReportViewer from '@/components/reports/report-viewer'

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ clientId: string; reportId: string }>
}) {
  const { clientId, reportId } = await params
  const supabase = await createClient()

  const [{ data: client }, { data: report }] = await Promise.all([
    supabase.from('clients').select('id, name, website_url').eq('id', clientId).single(),
    supabase.from('reports').select('*').eq('id', reportId).eq('client_id', clientId).single(),
  ])

  if (!client || !report) notFound()

  return (
    <div className="p-6">
      <ReportViewer report={report} client={client} />
    </div>
  )
}
