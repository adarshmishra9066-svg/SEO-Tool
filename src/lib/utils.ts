import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns'

// ─── Class merging ────────────────────────────────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

export function formatDate(
  date: string | Date | null | undefined,
  fmt = 'MMM d, yyyy'
): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? parseISO(date) : date
  return isValid(d) ? format(d, fmt) : '—'
}

export function formatRelativeDate(
  date: string | Date | null | undefined
): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? parseISO(date) : date
  return isValid(d) ? formatDistanceToNow(d, { addSuffix: true }) : '—'
}

export function isOverdue(date: string | null | undefined): boolean {
  if (!date) return false
  return parseISO(date) < new Date()
}

// ─── Number helpers ───────────────────────────────────────────────────────────

export function formatNumber(n: number | null | undefined): string {
  if (n == null) return '—'
  return new Intl.NumberFormat('en-US', { notation: 'compact' }).format(n)
}

export function formatCurrency(n: number | null | undefined): string {
  if (n == null) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
}

// ─── String helpers ───────────────────────────────────────────────────────────

export function truncate(str: string | null | undefined, length: number): string {
  if (!str) return ''
  return str.length <= length ? str : str.slice(0, length) + '…'
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// ─── Color helpers ────────────────────────────────────────────────────────────

export function getRiskColor(risk: string): string {
  switch (risk) {
    case 'low':
      return 'text-green-600 bg-green-50 border-green-200'
    case 'medium':
      return 'text-amber-600 bg-amber-50 border-amber-200'
    case 'high':
      return 'text-orange-600 bg-orange-50 border-orange-200'
    case 'critical':
      return 'text-red-600 bg-red-50 border-red-200'
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'low':
      return 'text-gray-600 bg-gray-50 border-gray-200'
    case 'medium':
      return 'text-blue-600 bg-blue-50 border-blue-200'
    case 'high':
      return 'text-orange-600 bg-orange-50 border-orange-200'
    case 'critical':
      return 'text-red-600 bg-red-50 border-red-200'
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

export function getImpactColor(impact: string): string {
  switch (impact) {
    case 'low':
      return 'text-gray-600 bg-gray-100'
    case 'medium':
      return 'text-blue-700 bg-blue-100'
    case 'high':
      return 'text-indigo-700 bg-indigo-100'
    case 'very_high':
      return 'text-purple-700 bg-purple-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

export function getEffortColor(effort: string): string {
  switch (effort) {
    case 'low':
      return 'text-green-700 bg-green-100'
    case 'medium':
      return 'text-amber-700 bg-amber-100'
    case 'high':
      return 'text-red-700 bg-red-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'new':
      return 'text-blue-700 bg-blue-100'
    case 'planned':
      return 'text-purple-700 bg-purple-100'
    case 'in_progress':
      return 'text-amber-700 bg-amber-100'
    case 'waiting':
      return 'text-orange-700 bg-orange-100'
    case 'completed':
      return 'text-green-700 bg-green-100'
    case 'skipped':
      return 'text-gray-500 bg-gray-100'
    case 'active':
      return 'text-green-700 bg-green-100'
    case 'paused':
      return 'text-amber-700 bg-amber-100'
    case 'onboarding':
      return 'text-blue-700 bg-blue-100'
    case 'churned':
      return 'text-red-700 bg-red-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

export function getHealthScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-amber-600'
  if (score >= 40) return 'text-orange-600'
  return 'text-red-600'
}

export function getHealthScoreBarColor(score: number): string {
  if (score >= 80) return 'bg-green-500'
  if (score >= 60) return 'bg-amber-500'
  if (score >= 40) return 'bg-orange-500'
  return 'bg-red-500'
}

// ─── Label helpers ────────────────────────────────────────────────────────────

export function getTaskTypeLabel(type: string): string {
  const map: Record<string, string> = {
    technical_seo: 'Technical SEO',
    on_page_seo: 'On-Page SEO',
    content_refresh: 'Content Refresh',
    new_blog: 'New Blog Post',
    internal_linking: 'Internal Linking',
    backlink_outreach: 'Backlink Outreach',
    competitor_analysis: 'Competitor Analysis',
    reporting: 'Reporting',
    local_seo: 'Local SEO',
    conversion_improvement: 'Conversion Improvement',
    metadata_rewrite: 'Metadata Rewrite',
    keyword_addition: 'Keyword Addition',
    schema_recommendation: 'Schema Markup',
  }
  return map[type] ?? type
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    new: 'New',
    planned: 'Planned',
    in_progress: 'In Progress',
    waiting: 'Waiting',
    completed: 'Completed',
    skipped: 'Skipped',
    active: 'Active',
    paused: 'Paused',
    onboarding: 'Onboarding',
    churned: 'Churned',
  }
  return map[status] ?? status
}

export function getImpactLabel(impact: string): string {
  const map: Record<string, string> = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    very_high: 'Very High',
  }
  return map[impact] ?? impact
}

// ─── Domain helpers ───────────────────────────────────────────────────────────

export function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return url
  }
}
