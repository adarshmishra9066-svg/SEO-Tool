import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDomainOverview, getDomainKeywords } from '@/lib/ubersuggest/client'

function getDomain(url: string): string {
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`)
    return u.hostname.replace(/^www\./, '')
  } catch {
    return url.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0]
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('client_id')

    if (!clientId) return NextResponse.json({ error: 'client_id required' }, { status: 400 })
    if (!process.env.UBERSUGGEST_API_KEY) {
      return NextResponse.json({ error: 'UBERSUGGEST_API_KEY not configured' }, { status: 503 })
    }

    const supabase = await createClient()
    const { data: rawClient } = await supabase
      .from('clients')
      .select('id, website_url')
      .eq('id', clientId)
      .single()

    const client = rawClient as { id: string; website_url: string } | null
    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 })

    const domain = getDomain(client.website_url)

    // Fetch overview and top keywords in parallel
    const [overview, keywordsData] = await Promise.all([
      getDomainOverview(domain),
      getDomainKeywords(domain, 50).catch(() => ({ keywords: [] })),
    ])

    // Save keywords to keywords table
    if (keywordsData.keywords.length > 0) {
      // Remove existing Ubersuggest keywords for this client
      await (supabase as any)
        .from('keywords')
        .delete()
        .eq('client_id', clientId)
        .eq('source', 'ubersuggest')

      const keywordRows = keywordsData.keywords.map((kw) => ({
        client_id: clientId,
        keyword: kw.keyword,
        search_volume: kw.search_volume ?? null,
        keyword_difficulty: kw.difficulty ?? null,
        cpc: kw.cpc ?? null,
        position: kw.position ?? null,
        page_url: kw.url ?? null,
        source: 'ubersuggest',
        data: kw,
      }))

      await (supabase as any).from('keywords').insert(keywordRows)
    }

    return NextResponse.json({
      domain,
      overview,
      keywords_saved: keywordsData.keywords.length,
    })
  } catch (err) {
    console.error('[ubersuggest/overview GET]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Overview fetch failed' },
      { status: 500 }
    )
  }
}
