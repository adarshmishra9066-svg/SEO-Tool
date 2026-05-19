import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

async function callClaude(system: string, user: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return 'AI generation unavailable — set ANTHROPIC_API_KEY to enable.'

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2048,
        system,
        messages: [{ role: 'user', content: user }],
      }),
    })
    if (!res.ok) return 'AI generation failed. Please fill in manually.'
    const data = await res.json()
    return data.content?.[0]?.text ?? 'No response from AI.'
  } catch {
    return 'AI generation unavailable.'
  }
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()
  const { client_id, period_start, period_end, report_type = 'monthly' } = body

  if (!client_id || !period_start || !period_end) {
    return NextResponse.json({ error: 'client_id, period_start, period_end required' }, { status: 400 })
  }

  // Gather data
  const [
    { data: client },
    { data: gscData },
    { data: tasks },
    { data: backlinks },
  ] = await Promise.all([
    supabase.from('clients').select('name, website_url, industry').eq('id', client_id).single(),
    supabase
      .from('gsc_query_data')
      .select('query, clicks, impressions, position')
      .eq('client_id', client_id)
      .gte('date', period_start)
      .lte('date', period_end)
      .order('clicks', { ascending: false })
      .limit(20),
    supabase
      .from('tasks')
      .select('title, status, task_type, completion_date')
      .eq('client_id', client_id)
      .in('status', ['completed', 'in_progress']),
    supabase
      .from('backlink_prospects')
      .select('website, status')
      .eq('client_id', client_id)
      .in('status', ['live_link_verified', 'indexed', 'published']),
  ])

  const completedTasks = tasks?.filter((t) => t.status === 'completed') ?? []
  const totalClicks = gscData?.reduce((s, r) => s + (r.clicks ?? 0), 0) ?? 0
  const totalImpressions = gscData?.reduce((s, r) => s + (r.impressions ?? 0), 0) ?? 0
  const liveBacklinks = backlinks?.length ?? 0

  const reportTitle = `${client?.name ?? 'Client'} SEO Report — ${new Date(period_start).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`

  const context = `
Client: ${client?.name} (${client?.website_url})
Industry: ${client?.industry ?? 'Not specified'}
Period: ${period_start} to ${period_end}
GSC Summary: ${totalClicks} total clicks, ${totalImpressions} impressions across ${gscData?.length ?? 0} queries
Top keywords: ${gscData?.slice(0, 5).map((d) => `${d.query} (${d.clicks} clicks)`).join(', ') || 'No data'}
Tasks completed: ${completedTasks.length}
${completedTasks.map((t) => `- ${t.title}`).join('\n')}
Live backlinks built: ${liveBacklinks}
  `.trim()

  const system = `You are a senior SEO account manager writing a client-facing monthly report.
Write in plain English that a non-technical business owner can understand.
Be honest — never fabricate numbers or claim results that aren't in the data.
If data is missing, say so clearly.
Structure: Executive Summary, Wins, What to Watch, Tasks Completed, Next Month Plan.
Keep it concise but comprehensive. Tone: confident, clear, professional, human.`

  const [summary, wins, nextPlan] = await Promise.all([
    callClaude(system, `Write a 2-paragraph executive summary for this SEO report:\n${context}`),
    callClaude(system, `List the 3-5 key wins from this period in plain English bullet points:\n${context}`),
    callClaude(system, `Write a concise next-month SEO plan (3-5 priorities) based on this data:\n${context}`),
  ])

  const { data: report, error } = await supabase
    .from('reports')
    .insert({
      client_id,
      title: reportTitle,
      period_start,
      period_end,
      report_type,
      summary,
      wins,
      next_month_plan: nextPlan,
      tasks_completed: completedTasks,
      gsc_summary: {
        total_clicks: totalClicks,
        total_impressions: totalImpressions,
        top_queries: gscData?.slice(0, 10) ?? [],
      },
      backlinks_built: liveBacklinks,
      blogs_published: completedTasks.filter((t) => t.task_type === 'new_blog').length,
      pages_refreshed: completedTasks.filter((t) => t.task_type === 'content_refresh').length,
      status: 'draft',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ report })
}
