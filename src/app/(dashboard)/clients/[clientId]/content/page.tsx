import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { RefreshCw, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { ContentRefreshCard, type ContentRefreshItem } from '@/components/content/content-refresh-card'
import type { Client } from '@/lib/database.types'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ clientId: string }>
  searchParams: Promise<{ tab?: string }>
}

function buildRefreshItems(
  gscData: Record<string, unknown>[]
): ContentRefreshItem[] {
  // Group by page URL and compute trends
  const byPage: Record<
    string,
    { recent: Record<string, unknown>[]; older: Record<string, unknown>[] }
  > = {}

  // Split into recent (last 28 days) and older (28-56 days ago) — we approximate with first/last half
  const sorted = [...gscData].sort(
    (a, b) => new Date(b.date as string).getTime() - new Date(a.date as string).getTime()
  )

  sorted.forEach((row) => {
    const page = (row.page as string) ?? 'unknown'
    if (!byPage[page]) byPage[page] = { recent: [], older: [] }
    // First 14 entries per page = recent, next 14 = older (rough approximation)
    if (byPage[page].recent.length < 14) byPage[page].recent.push(row)
    else byPage[page].older.push(row)
  })

  const items: ContentRefreshItem[] = []

  for (const [url, { recent, older }] of Object.entries(byPage)) {
    const recentClicks = recent.reduce((s, r) => s + ((r.clicks as number) ?? 0), 0)
    const olderClicks = older.reduce((s, r) => s + ((r.clicks as number) ?? 0), 0)
    const recentImpressions = recent.reduce((s, r) => s + ((r.impressions as number) ?? 0), 0)
    const olderImpressions = older.reduce((s, r) => s + ((r.impressions as number) ?? 0), 0)
    const recentPositions = recent
      .map((r) => r.position as number)
      .filter(Boolean)
    const olderPositions = older
      .map((r) => r.position as number)
      .filter(Boolean)

    const avgRecentPos =
      recentPositions.length > 0
        ? recentPositions.reduce((a, b) => a + b, 0) / recentPositions.length
        : null
    const avgOlderPos =
      olderPositions.length > 0
        ? olderPositions.reduce((a, b) => a + b, 0) / olderPositions.length
        : null

    // Only show pages that are declining
    const clicksDrop = olderClicks > 0 && recentClicks < olderClicks * 0.85
    const posDrop = avgRecentPos && avgOlderPos && avgRecentPos > avgOlderPos + 2

    if (!clicksDrop && !posDrop) continue

    const what: string[] = []
    if (clicksDrop) what.push('Update content to recover declining clicks')
    if (posDrop) what.push('Improve on-page SEO — position has dropped')
    if (recentImpressions > 500 && recentClicks < recentImpressions * 0.02)
      what.push('Rewrite meta title/description to improve CTR')
    what.push('Add FAQ section with schema markup')
    what.push('Strengthen E-E-A-T signals with specific examples')

    const dropPercent = olderClicks > 0 ? ((olderClicks - recentClicks) / olderClicks) * 100 : 0
    const priority: ContentRefreshItem['refresh_priority'] =
      dropPercent > 40 || (posDrop && avgRecentPos! > avgOlderPos! + 5)
        ? 'high'
        : dropPercent > 20 || posDrop
          ? 'medium'
          : 'low'

    items.push({
      url,
      title: null,
      last_published: null,
      current_position: avgRecentPos,
      prev_position: avgOlderPos,
      current_clicks: recentClicks,
      prev_clicks: olderClicks,
      current_impressions: recentImpressions,
      prev_impressions: olderImpressions,
      refresh_priority: priority,
      what_to_update: what.slice(0, 4),
    })
  }

  return items.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 }
    return order[a.refresh_priority] - order[b.refresh_priority]
  })
}

export default async function ContentPage({ params, searchParams }: PageProps) {
  const { clientId } = await params
  const { tab = 'needs_refresh' } = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: rawClient } = await supabase
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .single()

  if (!rawClient) notFound()
  const client = rawClient as Client

  // Fetch GSC data for content analysis
  const { data: gscData } = await supabase
    .from('gsc_query_data')
    .select('page, clicks, impressions, position, date')
    .eq('client_id', clientId)
    .not('page', 'is', null)
    .order('date', { ascending: false })
    .limit(2000)

  const allGscData = (gscData ?? []) as Record<string, unknown>[]
  const refreshItems = buildRefreshItems(allGscData)

  const highPriority = refreshItems.filter((i) => i.refresh_priority === 'high')
  const medPriority = refreshItems.filter((i) => i.refresh_priority === 'medium')
  const lowPriority = refreshItems.filter((i) => i.refresh_priority === 'low')

  const tabs = [
    { value: 'needs_refresh', label: `Needs Refresh (${refreshItems.length})` },
    { value: 'all', label: 'All Pages' },
  ]

  const displayItems = tab === 'all' ? refreshItems : refreshItems

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Content Refresh"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Clients', href: '/clients' },
          { label: client.name, href: `/clients/${clientId}` },
          { label: 'Content QA' },
        ]}
        description="Pages with declining performance that need refreshing"
      />

      <div className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'High Priority', value: highPriority.length, color: 'text-red-600' },
            { label: 'Medium Priority', value: medPriority.length, color: 'text-amber-600' },
            { label: 'Low Priority', value: lowPriority.length, color: 'text-gray-600' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tab filter */}
        <div className="flex gap-2">
          {tabs.map((t) => (
            <Link
              key={t.value}
              href={`?tab=${t.value}`}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                tab === t.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-300'
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>

        {/* Grid */}
        {displayItems.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {displayItems.map((item) => (
              <ContentRefreshCard key={item.url} item={item} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700">All pages look healthy!</h3>
            <p className="text-sm text-gray-400 mt-1 max-w-xs">
              {allGscData.length === 0
                ? 'Connect Google Search Console to see content performance data.'
                : 'No pages are showing significant declines. Check back after connecting more GSC data.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
