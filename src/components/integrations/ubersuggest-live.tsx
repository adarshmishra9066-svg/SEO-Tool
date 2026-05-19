'use client'

import * as React from 'react'
import {
  RefreshCw, CheckCircle2, AlertCircle, Loader2,
  TrendingUp, Globe, ShieldAlert, Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface AuditReport {
  overview?: {
    health_score?: number
    errors?: number
    warnings?: number
    recommendations?: number
  }
}

interface AuditState {
  status: 'idle' | 'starting' | 'running' | 'done' | 'error'
  domain?: string
  crawl_count?: number
  crawl_max_pages?: number
  health_score?: number
  issues_saved?: number
  report?: AuditReport
  error?: string
}

interface OverviewState {
  status: 'idle' | 'loading' | 'done' | 'error'
  overview?: Record<string, unknown>
  keywords_saved?: number
  error?: string
}

export function UbersuggestLive({ clientId }: { clientId: string }) {
  const [audit, setAudit] = React.useState<AuditState>({ status: 'idle' })
  const [overview, setOverview] = React.useState<OverviewState>({ status: 'idle' })
  const pollRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const stopPolling = () => {
    if (pollRef.current) clearTimeout(pollRef.current)
  }

  // Poll until audit is done, then save to DB
  const pollAudit = React.useCallback(async (domain: string) => {
    try {
      const res = await fetch(
        `/api/ubersuggest/audit?client_id=${clientId}&domain=${encodeURIComponent(domain)}&save=false`
      )
      const data = await res.json()

      if (!res.ok) throw new Error(data.error ?? 'Poll failed')

      setAudit((prev) => ({
        ...prev,
        crawl_count: data.crawl_count,
        crawl_max_pages: data.crawl_max_pages,
        report: data.report,
      }))

      if (data.done) {
        // Save to DB
        const saveRes = await fetch(
          `/api/ubersuggest/audit?client_id=${clientId}&domain=${encodeURIComponent(domain)}&save=true`
        )
        const saveData = await saveRes.json()
        setAudit({
          status: 'done',
          domain,
          health_score: saveData.health_score,
          issues_saved: saveData.issues_saved,
          report: saveData.report,
        })
      } else {
        // Keep polling every 5s
        pollRef.current = setTimeout(() => pollAudit(domain), 5000)
      }
    } catch (err) {
      setAudit({ status: 'error', error: (err as Error).message })
    }
  }, [clientId])

  const runAudit = async (recrawl = false) => {
    stopPolling()
    setAudit({ status: 'starting' })

    try {
      const res = await fetch('/api/ubersuggest/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: clientId, recrawl }),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error ?? 'Failed to start audit')

      if (data.done) {
        // Cached result — save immediately
        const saveRes = await fetch(
          `/api/ubersuggest/audit?client_id=${clientId}&domain=${encodeURIComponent(data.domain)}&save=true`
        )
        const saveData = await saveRes.json()
        setAudit({
          status: 'done',
          domain: data.domain,
          health_score: saveData.health_score,
          issues_saved: saveData.issues_saved,
          report: saveData.report,
        })
      } else {
        setAudit({
          status: 'running',
          domain: data.domain,
          crawl_count: data.crawl_count,
          crawl_max_pages: data.crawl_max_pages,
        })
        pollRef.current = setTimeout(() => pollAudit(data.domain), 5000)
      }
    } catch (err) {
      setAudit({ status: 'error', error: (err as Error).message })
    }
  }

  const fetchOverview = async () => {
    setOverview({ status: 'loading' })
    try {
      const res = await fetch(`/api/ubersuggest/overview?client_id=${clientId}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to fetch overview')
      setOverview({ status: 'done', overview: data.overview, keywords_saved: data.keywords_saved })
    } catch (err) {
      setOverview({ status: 'error', error: (err as Error).message })
    }
  }

  React.useEffect(() => () => stopPolling(), [])

  const crawlProgress =
    audit.crawl_max_pages && audit.crawl_count !== undefined
      ? Math.round((audit.crawl_count / audit.crawl_max_pages) * 100)
      : 0

  const healthColor =
    (audit.health_score ?? 0) >= 80
      ? 'text-green-600'
      : (audit.health_score ?? 0) >= 60
      ? 'text-amber-600'
      : 'text-red-600'

  return (
    <div className="space-y-4">
      {/* Site Audit */}
      <div className="border border-gray-200 rounded-xl p-5 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-indigo-600" />
            <h4 className="font-medium text-gray-900 text-sm">Live Site Audit</h4>
          </div>
          {audit.status === 'done' && (
            <button
              onClick={() => runAudit(true)}
              className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Re-run
            </button>
          )}
        </div>

        {audit.status === 'idle' && (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500 mb-3">
              Crawl your site and auto-populate Technical SEO issues from real Ubersuggest data.
            </p>
            <Button onClick={() => runAudit(false)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Zap className="w-4 h-4 mr-2" />
              Run Site Audit
            </Button>
          </div>
        )}

        {audit.status === 'starting' && (
          <div className="flex items-center gap-3 py-4 text-sm text-gray-600">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
            Starting crawl…
          </div>
        )}

        {audit.status === 'running' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600 shrink-0" />
              Crawling {audit.domain} — {audit.crawl_count ?? 0} / {audit.crawl_max_pages ?? '?'} pages
            </div>
            <Progress value={crawlProgress} className="h-2" />
            <p className="text-xs text-gray-400">This can take 1–3 minutes. Stay on the page.</p>
          </div>
        )}

        {audit.status === 'done' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Audit complete for <strong>{audit.domain}</strong> — {audit.issues_saved} issues saved to Technical SEO
            </div>

            {audit.report?.overview && (
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className={cn('text-2xl font-bold', healthColor)}>
                    {audit.report.overview.health_score ?? '—'}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">Health Score</div>
                </div>
                <div className="bg-red-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-red-600">{audit.report.overview.errors ?? 0}</div>
                  <div className="text-xs text-gray-500 mt-0.5">Errors</div>
                </div>
                <div className="bg-amber-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-amber-600">{audit.report.overview.warnings ?? 0}</div>
                  <div className="text-xs text-gray-500 mt-0.5">Warnings</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-blue-600">{audit.report.overview.recommendations ?? 0}</div>
                  <div className="text-xs text-gray-500 mt-0.5">Tips</div>
                </div>
              </div>
            )}

            <p className="text-xs text-gray-500">
              Go to <strong>Technical SEO</strong> tab to see all issues and fix recommendations.
            </p>
          </div>
        )}

        {audit.status === 'error' && (
          <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Audit failed</p>
              <p className="text-xs mt-0.5">{audit.error}</p>
              <button
                onClick={() => runAudit(false)}
                className="text-xs text-red-600 underline mt-1"
              >
                Try again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Domain Overview + Keywords */}
      <div className="border border-gray-200 rounded-xl p-5 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <h4 className="font-medium text-gray-900 text-sm">Domain Overview & Keywords</h4>
          </div>
          {overview.status === 'done' && (
            <button
              onClick={fetchOverview}
              className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
          )}
        </div>

        {overview.status === 'idle' && (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500 mb-3">
              Fetch organic traffic, domain authority, and top ranking keywords.
            </p>
            <Button
              onClick={fetchOverview}
              variant="outline"
              className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
            >
              <Globe className="w-4 h-4 mr-2" />
              Fetch Domain Data
            </Button>
          </div>
        )}

        {overview.status === 'loading' && (
          <div className="flex items-center gap-3 py-4 text-sm text-gray-600">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
            Fetching domain data from Ubersuggest…
          </div>
        )}

        {overview.status === 'done' && overview.overview && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {overview.keywords_saved} keywords saved to database
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: 'Organic Traffic', key: 'organic_traffic' },
                { label: 'Organic Keywords', key: 'organic_keywords' },
                { label: 'Domain Authority', key: 'domain_authority' },
                { label: 'Backlinks', key: 'backlinks' },
              ].map(({ label, key }) => (
                <div key={key} className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500">{label}</div>
                  <div className="font-semibold text-gray-900 mt-0.5">
                    {overview.overview?.[key] !== undefined
                      ? Number(overview.overview[key]).toLocaleString()
                      : '—'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {overview.status === 'error' && (
          <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Failed to fetch domain data</p>
              <p className="text-xs mt-0.5">{overview.error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default UbersuggestLive
