import Link from 'next/link'
import { Report } from '@/lib/database.types'
import { formatDate, getStatusColor } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { FileText, Calendar, CheckSquare, Globe, Link2 } from 'lucide-react'

export default function ReportCard({ report, clientId }: { report: Report; clientId: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-start justify-between hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
          <FileText className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900">{report.title}</h3>
            <span className={cn(
              'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
              report.report_type === 'monthly' ? 'text-indigo-700 bg-indigo-100' : 'text-blue-700 bg-blue-100'
            )}>
              {report.report_type}
            </span>
            <span className={cn(
              'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
              getStatusColor(report.status)
            )}>
              {report.status}
            </span>
          </div>

          {report.period_start && report.period_end && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(report.period_start, 'MMM d')} — {formatDate(report.period_end, 'MMM d, yyyy')}
            </div>
          )}

          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <CheckSquare className="w-3.5 h-3.5" />
              {(report.tasks_completed as unknown[])?.length ?? 0} tasks
            </span>
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" />
              {report.blogs_published} blogs
            </span>
            <span className="flex items-center gap-1">
              <Link2 className="w-3.5 h-3.5" />
              {report.backlinks_built} links
            </span>
          </div>

          {report.summary && (
            <p className="text-xs text-gray-500 mt-2 max-w-lg line-clamp-2">{report.summary}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0 ml-4">
        <span className="text-xs text-gray-400">{formatDate(report.created_at)}</span>
        <Link
          href={`/clients/${clientId}/reports/${report.id}`}
          className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
        >
          View
        </Link>
      </div>
    </div>
  )
}
