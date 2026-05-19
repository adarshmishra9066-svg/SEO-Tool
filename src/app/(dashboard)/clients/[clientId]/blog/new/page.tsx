import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { BlogBriefForm } from '@/components/blog/blog-brief-form'
import type { Client } from '@/lib/database.types'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ clientId: string }>
}

export default async function NewBlogBriefPage({ params }: PageProps) {
  const { clientId } = await params
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

  // Fetch top GSC opportunities (position 4-20, sorted by impressions)
  const { data: gscData } = await supabase
    .from('gsc_query_data')
    .select('query, impressions, position')
    .eq('client_id', clientId)
    .gte('position', 4)
    .lte('position', 20)
    .gte('impressions', 50)
    .order('impressions', { ascending: false })
    .limit(30)

  const gscOpportunities = (gscData ?? []).map((d) => ({
    query: d.query as string,
    impressions: d.impressions as number,
    position: d.position as number,
  }))

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Create New Blog Brief"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Clients', href: '/clients' },
          { label: client.name, href: `/clients/${clientId}` },
          { label: 'Blog', href: `/clients/${clientId}/blog` },
          { label: 'New Brief' },
        ]}
        description="AI-powered blog brief wizard — generates a full content strategy from your topic"
      />

      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <BlogBriefForm clientId={clientId} gscOpportunities={gscOpportunities} />
        </div>
      </div>
    </div>
  )
}
