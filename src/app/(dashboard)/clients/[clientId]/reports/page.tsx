import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ReportCard from '@/components/reports/report-card'
import ReportGenerator from '@/components/reports/report-generator'
import { FileText, Plus } from 'lucide-react'

export default async function ReportsPage({
  params,
}: {
  params: Promise<{ clientId: string }>
}) {
  const { clientId } = await params
  const supabase = await createClient()

  const [{ data: client }, { data: reports }] = await Promise.all([
    supabase.from('clients').select('id, name').eq('id', clientId).single(),
    supabase
      .from('reports')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false }),
  ])

  if (!client) notFound()

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500 mt-1">
            Generate plain-English reports that clients actually understand.
          </p>
        </div>
        <ReportGenerator clientId={clientId} clientName={client.name} />
      </div>

      {reports && reports.length > 0 ? (
        <div className="grid gap-4">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} clientId={clientId} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-200">
          <FileText className="w-10 h-10 text-gray-300 mb-3" />
          <h3 className="font-medium text-gray-900 mb-1">No reports yet</h3>
          <p className="text-sm text-gray-500 mb-4 text-center max-w-xs">
            Generate your first monthly report. It will pull from GSC, GA4, tasks, and backlinks automatically.
          </p>
          <ReportGenerator clientId={clientId} clientName={client.name} buttonLabel="Generate First Report" />
        </div>
      )}
    </div>
  )
}
