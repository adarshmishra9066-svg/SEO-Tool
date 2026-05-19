'use client'

import * as React from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronDown,
  Wrench,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'
import type { TechnicalIssue } from '@/lib/database.types'

// ─── Default checklist items (shown if no imported data) ─────────────────────

const DEFAULT_CHECKS: Array<Omit<TechnicalIssue, 'id' | 'created_at' | 'updated_at'>> = [
  {
    client_id: '',
    issue_type: 'indexing',
    page_url: null,
    severity: 'high',
    title: 'Check robots.txt is not blocking important pages',
    description: 'A misconfigured robots.txt can prevent Google from crawling and indexing your most important pages.',
    fix_recommendation: 'Review robots.txt at /robots.txt and ensure key pages are not disallowed. Test in Google Search Console > URL Inspection.',
    client_friendly_explanation: 'This file tells Google which pages it is allowed to visit. If it is wrong, your pages won\'t show up in Google.',
    status: 'open',
  },
  {
    client_id: '',
    issue_type: 'indexing',
    page_url: null,
    severity: 'high',
    title: 'Verify XML sitemap is submitted and error-free',
    description: 'An up-to-date XML sitemap helps Google discover and index all important pages efficiently.',
    fix_recommendation: 'Check /sitemap.xml exists, is error-free, and is submitted via Google Search Console > Sitemaps.',
    client_friendly_explanation: 'A sitemap is like a table of contents for Google — it helps Google find all your pages quickly.',
    status: 'open',
  },
  {
    client_id: '',
    issue_type: 'performance',
    page_url: null,
    severity: 'high',
    title: 'Core Web Vitals: LCP, INP, and CLS within targets',
    description: 'Core Web Vitals measure user experience. LCP < 2.5s, INP < 200ms, CLS < 0.1 are Google ranking factors.',
    fix_recommendation: 'Run a PageSpeed Insights test on key pages. Address largest content element load time, interaction delays, and layout shifts.',
    client_friendly_explanation: 'These are Google\'s speed tests. A fast, stable website ranks better and keeps visitors from leaving.',
    status: 'open',
  },
  {
    client_id: '',
    issue_type: 'on_page',
    page_url: null,
    severity: 'medium',
    title: 'All key pages have unique, optimised title tags',
    description: 'Title tags appear in search results and browser tabs. Each page should have a unique, keyword-rich title within 50-60 characters.',
    fix_recommendation: 'Audit title tags with Screaming Frog or GSC. Rewrite any duplicates, missing, or over-length titles.',
    client_friendly_explanation: 'The title tag is the blue link text in Google search results. It needs to include your keywords and describe the page clearly.',
    status: 'open',
  },
  {
    client_id: '',
    issue_type: 'on_page',
    page_url: null,
    severity: 'medium',
    title: 'Meta descriptions are unique and compelling',
    description: 'While not a direct ranking factor, meta descriptions influence CTR. They should be 120-160 characters and include a CTA.',
    fix_recommendation: 'Write unique meta descriptions for each page. Include the primary keyword and a call to action. Aim for 130-155 characters.',
    client_friendly_explanation: 'This is the grey description text under your page title in Google. A good one encourages people to click through.',
    status: 'open',
  },
  {
    client_id: '',
    issue_type: 'on_page',
    page_url: null,
    severity: 'medium',
    title: 'Each page has exactly one H1 tag',
    description: 'A missing or duplicate H1 is a common on-page SEO issue. Each page should have exactly one H1 containing the primary keyword.',
    fix_recommendation: 'Check all pages have exactly one H1. The H1 should closely match or contain the title tag keyword.',
    client_friendly_explanation: 'The H1 is the main heading on your page. Google uses it to understand what the page is about.',
    status: 'open',
  },
  {
    client_id: '',
    issue_type: 'technical',
    page_url: null,
    severity: 'high',
    title: 'HTTPS enabled with no mixed content warnings',
    description: 'All pages should be served over HTTPS. Mixed content (HTTP resources on HTTPS pages) triggers browser warnings.',
    fix_recommendation: 'Check SSL certificate is valid. Use a tool like whynopadlock.com to detect mixed content issues.',
    client_friendly_explanation: 'HTTPS shows the padlock icon in browsers, telling visitors (and Google) your site is secure.',
    status: 'open',
  },
  {
    client_id: '',
    issue_type: 'schema',
    page_url: null,
    severity: 'low',
    title: 'Schema markup implemented for key page types',
    description: 'Structured data (JSON-LD) helps search engines understand your content and enables rich results in SERPs.',
    fix_recommendation: 'Implement LocalBusiness, Service, Article, and FAQ schema where relevant. Test with Google\'s Rich Results Test.',
    client_friendly_explanation: 'This is special code that helps Google show extra information about your business in search results, like star ratings.',
    status: 'open',
  },
  {
    client_id: '',
    issue_type: 'mobile',
    page_url: null,
    severity: 'high',
    title: 'Mobile-friendly: no tap targets too close, text readable',
    description: 'Google uses mobile-first indexing. All pages must be mobile-friendly with readable text and sufficient tap target spacing.',
    fix_recommendation: 'Test with Google\'s Mobile-Friendly Test. Check tap targets are at least 48px and text is at least 16px on mobile.',
    client_friendly_explanation: 'Google now ranks websites based on how they look on phones, not desktop. Your site must work perfectly on mobile.',
    status: 'open',
  },
  {
    client_id: '',
    issue_type: 'indexing',
    page_url: null,
    severity: 'medium',
    title: 'Canonical tags correct — no self-referencing loops',
    description: 'Incorrect canonical tags can cause Google to index the wrong version of pages or ignore important content.',
    fix_recommendation: 'Audit canonical tags. Ensure every page has a self-referencing canonical or points to the correct canonical URL.',
    client_friendly_explanation: 'Canonical tags tell Google which is the "master" version of a page when you have similar content in multiple places.',
    status: 'open',
  },
  {
    client_id: '',
    issue_type: 'technical',
    page_url: null,
    severity: 'medium',
    title: 'Internal linking: key pages receive sufficient links',
    description: 'Internal links distribute PageRank and help search engines discover and understand page importance.',
    fix_recommendation: 'Audit internal links to service pages. Every key service page should receive links from related blog posts and the homepage.',
    client_friendly_explanation: 'Links between your own pages tell Google which pages are most important. Service pages should be well-linked.',
    status: 'open',
  },
  {
    client_id: '',
    issue_type: 'performance',
    page_url: null,
    severity: 'medium',
    title: 'Images are compressed and have descriptive alt text',
    description: 'Uncompressed images slow load times. Missing alt text is an accessibility and minor SEO issue.',
    fix_recommendation: 'Compress all images to WebP format. Add descriptive alt text to all images, especially those near key content.',
    client_friendly_explanation: 'Large images make pages slow to load. Alt text helps visually impaired users and helps Google understand images.',
    status: 'open',
  },
]

// ─── Severity config ──────────────────────────────────────────────────────────

const SEVERITY_CONFIG = {
  critical: { label: 'Critical', color: 'bg-red-100 text-red-700', icon: XCircle, ring: 'ring-red-200' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-700', icon: AlertTriangle, ring: 'ring-orange-200' },
  medium: { label: 'Medium', color: 'bg-amber-100 text-amber-700', icon: AlertTriangle, ring: 'ring-amber-200' },
  low: { label: 'Low', color: 'bg-blue-100 text-blue-700', icon: CheckCircle2, ring: 'ring-blue-200' },
  info: { label: 'Info', color: 'bg-gray-100 text-gray-600', icon: CheckCircle2, ring: 'ring-gray-200' },
}

const STATUS_CONFIG = {
  open: { label: 'Open', color: 'text-red-600 bg-red-50' },
  in_progress: { label: 'In Progress', color: 'text-amber-600 bg-amber-50' },
  resolved: { label: 'Resolved', color: 'text-green-600 bg-green-50' },
  wont_fix: { label: "Won't Fix", color: 'text-gray-500 bg-gray-100' },
}

const CATEGORY_LABELS: Record<string, string> = {
  indexing: 'Indexing & Crawling',
  performance: 'Performance & Core Web Vitals',
  on_page: 'On-Page SEO',
  technical: 'Technical',
  schema: 'Schema & Structured Data',
  mobile: 'Mobile',
}

// ─── Single check item ────────────────────────────────────────────────────────

interface CheckItemProps {
  issue: TechnicalIssue | (typeof DEFAULT_CHECKS)[0]
  isDefault?: boolean
  onStatusChange?: (id: string, status: TechnicalIssue['status']) => void
}

function CheckItem({ issue, isDefault = false, onStatusChange }: CheckItemProps) {
  const [expanded, setExpanded] = React.useState(false)
  const [status, setStatus] = React.useState(issue.status)
  const [saving, setSaving] = React.useState(false)

  const sev = SEVERITY_CONFIG[issue.severity]
  const SevIcon = sev.icon

  const handleStatusChange = async (newStatus: string) => {
    if (isDefault) {
      setStatus(newStatus as TechnicalIssue['status'])
      return
    }

    setSaving(true)
    try {
      const issueWithId = issue as TechnicalIssue
      await fetch(`/api/technical/${issueWithId.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      setStatus(newStatus as TechnicalIssue['status'])
      onStatusChange?.((issue as TechnicalIssue).id, newStatus as TechnicalIssue['status'])
    } catch {
      toast({ title: 'Failed to update status', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className={cn(
        'bg-white rounded-lg border p-3 transition-all',
        status === 'resolved' ? 'opacity-60 border-gray-200' : 'border-gray-200 hover:border-gray-300'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Severity icon */}
        <div
          className={cn(
            'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ring-1',
            sev.color,
            sev.ring
          )}
        >
          <SevIcon className="w-3.5 h-3.5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <Badge className={cn('text-xs px-1.5 py-0', sev.color)}>{sev.label}</Badge>
          </div>
          <h4
            className={cn(
              'text-sm font-medium leading-snug',
              status === 'resolved' ? 'line-through text-gray-400' : 'text-gray-900'
            )}
          >
            {issue.title}
          </h4>
          {issue.page_url && (
            <p className="text-xs text-indigo-500 mt-0.5 truncate">{issue.page_url}</p>
          )}

          {/* Expandable details */}
          <button
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 mt-1"
            onClick={() => setExpanded((v) => !v)}
          >
            <ChevronDown className={cn('w-3 h-3 transition-transform', expanded && 'rotate-180')} />
            {expanded ? 'Hide details' : 'Show details'}
          </button>

          {expanded && (
            <div className="mt-2 space-y-2 text-xs">
              {issue.description && (
                <p className="text-gray-600 leading-relaxed">{issue.description}</p>
              )}
              {issue.fix_recommendation && (
                <div className="p-2 bg-indigo-50 border border-indigo-100 rounded">
                  <p className="font-medium text-indigo-800 mb-0.5">How to fix</p>
                  <p className="text-indigo-700">{issue.fix_recommendation}</p>
                </div>
              )}
              {issue.client_friendly_explanation && (
                <div className="p-2 bg-gray-50 border border-gray-200 rounded">
                  <p className="font-medium text-gray-700 mb-0.5">Client explanation</p>
                  <p className="text-gray-600">{issue.client_friendly_explanation}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Status selector */}
        <div className="shrink-0">
          <Select value={status} onValueChange={handleStatusChange} disabled={saving}>
            <SelectTrigger
              className={cn(
                'h-7 text-xs px-2 min-w-[100px] border',
                STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.color ?? ''
              )}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                <SelectItem key={value} value={value} className="text-xs">
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface TechnicalChecklistProps {
  issues: TechnicalIssue[]
}

export function TechnicalChecklist({ issues }: TechnicalChecklistProps) {
  const useDefaultChecks = issues.length === 0
  const items = useDefaultChecks
    ? DEFAULT_CHECKS
    : (issues as unknown as (typeof DEFAULT_CHECKS)[0][])

  // Group by category
  const grouped = React.useMemo(() => {
    const map = new Map<string, typeof items>()
    items.forEach((issue) => {
      const cat = issue.issue_type ?? 'technical'
      if (!map.has(cat)) map.set(cat, [])
      map.get(cat)!.push(issue)
    })
    return map
  }, [items])

  // Summary counts
  const counts = React.useMemo(() => {
    const c = { critical: 0, high: 0, medium: 0, low: 0, info: 0 }
    items.forEach((i) => { c[i.severity] = (c[i.severity] ?? 0) + 1 })
    return c
  }, [items])

  const openItems = items.filter((i) => i.status === 'open').length
  const resolvedItems = items.filter((i) => i.status === 'resolved').length

  return (
    <div className="space-y-6">
      {/* Summary bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {counts.critical > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-red-700">{counts.critical}</p>
            <p className="text-xs text-red-600">Critical</p>
          </div>
        )}
        {counts.high > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-orange-700">{counts.high}</p>
            <p className="text-xs text-orange-600">High</p>
          </div>
        )}
        {counts.medium > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-amber-700">{counts.medium}</p>
            <p className="text-xs text-amber-600">Medium</p>
          </div>
        )}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-gray-700">{resolvedItems}</p>
          <p className="text-xs text-gray-500">Resolved</p>
        </div>
      </div>

      {useDefaultChecks && (
        <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
          <Wrench className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>
            Showing the standard technical SEO checklist. Import a Ubersuggest site audit CSV to replace this with your actual audit data.
          </span>
        </div>
      )}

      {/* Progress */}
      <div>
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span>{openItems} issues remaining</span>
          <span>{resolvedItems} resolved</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all"
            style={{
              width: items.length > 0 ? `${(resolvedItems / items.length) * 100}%` : '0%',
            }}
          />
        </div>
      </div>

      {/* Grouped checks */}
      {[...grouped.entries()].map(([category, categoryItems]) => (
        <div key={category}>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            {CATEGORY_LABELS[category] ?? category}
          </h3>
          <div className="space-y-2">
            {categoryItems.map((issue, idx) => (
              <CheckItem
                key={(issue as TechnicalIssue).id ?? `default-${idx}`}
                issue={issue as unknown as TechnicalIssue}
                isDefault={useDefaultChecks}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default TechnicalChecklist
