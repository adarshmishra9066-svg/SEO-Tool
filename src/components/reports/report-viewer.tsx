'use client'

import { useState } from 'react'
import { Report } from '@/lib/database.types'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Copy, Check, MessageSquare } from 'lucide-react'

function Section({ title, content }: { title: string; content: string | null }) {
  if (!content) return null
  return (
    <div className="space-y-2">
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{content}</div>
    </div>
  )
}

export default function ReportViewer({
  report,
  client,
}: {
  report: Report
  client: { name: string; website_url: string }
}) {
  const [copied, setCopied] = useState(false)
  const [simplifying, setSimplifying] = useState(false)
  const [simpleSummary, setSimpleSummary] = useState<string | null>(null)

  function copyReport() {
    const text = [
      report.title,
      `Period: ${formatDate(report.period_start)} — ${formatDate(report.period_end)}`,
      '',
      'SUMMARY',
      report.summary,
      '',
      'WINS',
      report.wins,
      '',
      'NEXT MONTH',
      report.next_month_plan,
    ].filter(Boolean).join('\n')
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function explainSimply() {
    setSimplifying(true)
    const res = await fetch('/api/reports/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'explain_simply',
        content: report.summary,
        client_name: client.name,
      }),
    })
    const data = await res.json()
    setSimpleSummary(data.simple ?? report.summary)
    setSimplifying(false)
  }

  const gscSummary = report.gsc_summary as Record<string, unknown>
  const completedTasks = report.tasks_completed as Array<{ title: string; task_type: string }> ?? []

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{report.title}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {formatDate(report.period_start)} — {formatDate(report.period_end)} · {report.report_type} report
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={copyReport} className="flex items-center gap-2">
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
            <Button variant="outline" size="sm" onClick={explainSimply} disabled={simplifying} className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              {simplifying ? 'Simplifying…' : 'Explain Simply'}
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'GSC Clicks', value: (gscSummary?.total_clicks as number)?.toLocaleString() ?? '—' },
          { label: 'Impressions', value: (gscSummary?.total_impressions as number)?.toLocaleString() ?? '—' },
          { label: 'Tasks Done', value: completedTasks.length },
          { label: 'Live Backlinks', value: report.backlinks_built },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{m.value}</div>
            <div className="text-xs text-gray-500 mt-1">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Report body */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        {simpleSummary && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <p className="text-xs font-semibold text-indigo-600 mb-2 uppercase tracking-wide">Client-Friendly Version</p>
            <p className="text-sm text-indigo-900 leading-relaxed">{simpleSummary}</p>
          </div>
        )}

        <Section title="Executive Summary" content={report.summary} />
        <Section title="Wins This Period" content={report.wins} />
        <Section title="What to Watch" content={report.losses} />

        {completedTasks.length > 0 && (
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-2">Tasks Completed</h2>
            <ul className="space-y-1">
              {completedTasks.map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-green-500 mt-0.5">✓</span>
                  {t.title}
                </li>
              ))}
            </ul>
          </div>
        )}

        <Section title="Next Month's Plan" content={report.next_month_plan} />
      </div>
    </div>
  )
}
