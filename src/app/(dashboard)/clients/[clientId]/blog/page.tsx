import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { Plus, PenTool } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { BlogBriefCard } from '@/components/blog/blog-brief-card'
import type { Client, BlogBrief } from '@/lib/database.types'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ clientId: string }>
  searchParams: Promise<{ status?: string }>
}

export default async function BlogPage({ params, searchParams }: PageProps) {
  const { clientId } = await params
  const { status } = await searchParams
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

  let query = supabase
    .from('blog_briefs')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data: rawBriefs } = await query
  const briefs = (rawBriefs ?? []) as BlogBrief[]

  // Stats
  const total = briefs.length
  const inProgress = briefs.filter((b) => b.status === 'in_progress').length
  const published = briefs.filter((b) => b.status === 'published').length

  const STATUS_FILTERS = [
    { value: '', label: 'All' },
    { value: 'draft', label: 'Draft' },
    { value: 'approved', label: 'Approved' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'published', label: 'Published' },
  ]

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Blog"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Clients', href: '/clients' },
          { label: client.name, href: `/clients/${clientId}` },
          { label: 'Blog' },
        ]}
        description="Manage blog briefs and generated drafts"
        actions={
          <Button asChild className="gap-2 bg-indigo-600 hover:bg-indigo-700">
            <Link href={`/clients/${clientId}/blog/new`}>
              <Plus className="w-4 h-4" />
              Create New Brief
            </Link>
          </Button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Briefs', value: total },
            { label: 'In Progress', value: inProgress },
            { label: 'Published', value: published },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Status filter */}
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map((f) => (
            <Link
              key={f.value}
              href={f.value ? `?status=${f.value}` : `?`}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                (status ?? '') === f.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600'
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>

        {/* Grid */}
        {briefs.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {briefs.map((brief) => (
              <BlogBriefCard key={brief.id} brief={brief} clientId={clientId} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <PenTool className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700">No blog briefs yet</h3>
            <p className="text-sm text-gray-400 mt-1 max-w-xs">
              Create your first blog brief using the AI wizard — it analyses your client context,
              keywords, and competitor gaps.
            </p>
            <Button asChild className="mt-5 gap-2 bg-indigo-600 hover:bg-indigo-700">
              <Link href={`/clients/${clientId}/blog/new`}>
                <Plus className="w-4 h-4" />
                Create New Brief
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
