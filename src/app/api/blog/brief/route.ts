import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { callAIJSON } from '@/lib/ai/client'
import type { Client } from '@/lib/database.types'

interface BlogBriefPayload {
  title: string
  primary_keyword: string
  secondary_keywords: string[]
  search_intent: string
  target_audience: string
  funnel_stage: string
  content_angle: string
  required_sections: string[]
  faqs: { question: string; answer_hint: string }[]
  internal_links: { anchor: string; target: string }[]
  schema_recommendation: string
  cta_suggestion: string
  eeat_notes: string
  aeo_notes: string
  llm_notes: string
  competitor_weaknesses: string
  recommended_word_count: number
  tone_notes: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { client_id, topic, source_type, keyword, target_audience, content_angle } = body

    if (!client_id || !topic) {
      return NextResponse.json({ error: 'client_id and topic are required' }, { status: 400 })
    }

    // Fetch client context
    const { data: rawClient } = await supabase
      .from('clients')
      .select('*')
      .eq('id', client_id)
      .single()

    if (!rawClient) return NextResponse.json({ error: 'Client not found' }, { status: 404 })

    const client = rawClient as Client

    // Fetch related GSC data for keyword
    let gscContext = ''
    if (keyword) {
      const { data: gscData } = await supabase
        .from('gsc_query_data')
        .select('query, clicks, impressions, position')
        .eq('client_id', client_id)
        .ilike('query', `%${keyword}%`)
        .order('impressions', { ascending: false })
        .limit(10)

      if (gscData && gscData.length > 0) {
        gscContext = `\n\nRelated GSC search data:\n${gscData
          .map(
            (d: Record<string, unknown>) =>
              `- "${d.query}": ${d.clicks} clicks, ${d.impressions} impressions, position ${typeof d.position === 'number' ? d.position.toFixed(1) : d.position}`
          )
          .join('\n')}`
      }
    }

    const systemPrompt = `You are an expert SEO content strategist. Your job is to create comprehensive, actionable blog briefs that result in content that ranks, converts, and satisfies E-E-A-T signals.

You must respond with ONLY valid JSON — no markdown, no explanation, just the JSON object.`

    const userPrompt = `Create a detailed blog brief for the following:

Client: ${client.name}
Website: ${client.website_url}
Industry: ${client.industry ?? 'Not specified'}
Brand Tone: ${client.brand_tone ?? 'Professional and helpful'}
Target Audience: ${target_audience ?? client.target_audience ?? 'Not specified'}
Main Goals: ${client.main_goals ?? 'Not specified'}
Primary Conversion Goal: ${client.primary_conversion_goal ?? 'Not specified'}
Content Style Notes: ${client.content_style_notes ?? 'None'}

Topic: ${topic}
Primary Keyword: ${keyword ?? topic}
Source Type: ${source_type ?? 'manual'}
${content_angle ? `Content Angle: ${content_angle}` : ''}
${gscContext}

Return a JSON object with exactly these fields:
{
  "title": "Compelling, SEO-optimised blog title (include primary keyword)",
  "primary_keyword": "exact primary keyword to target",
  "secondary_keywords": ["keyword1", "keyword2", "keyword3"],
  "search_intent": "informational|commercial|transactional|navigational",
  "target_audience": "specific description of who this is written for",
  "funnel_stage": "top|middle|bottom",
  "content_angle": "unique angle that differentiates this from competitors",
  "required_sections": ["Introduction", "Section 2", "Section 3", "Section 4", "FAQ", "Conclusion"],
  "faqs": [
    {"question": "FAQ question 1?", "answer_hint": "Key points to cover in the answer"},
    {"question": "FAQ question 2?", "answer_hint": "Key points to cover in the answer"},
    {"question": "FAQ question 3?", "answer_hint": "Key points to cover in the answer"},
    {"question": "FAQ question 4?", "answer_hint": "Key points to cover in the answer"}
  ],
  "internal_links": [
    {"anchor": "suggested anchor text", "target": "/suggested-url-path"}
  ],
  "schema_recommendation": "Article|FAQPage|HowTo",
  "cta_suggestion": "specific call-to-action for the end of the post",
  "eeat_notes": "How to demonstrate Experience, Expertise, Authoritativeness, and Trustworthiness in this post",
  "aeo_notes": "How to optimise for AI/answer engines — what questions to answer directly, what formats to use",
  "llm_notes": "How to structure this so AI tools cite this content accurately",
  "competitor_weaknesses": "What competitors are missing that this post should cover",
  "recommended_word_count": 1800,
  "tone_notes": "Specific tone and style guidance for this post"
}`

    const brief = await callAIJSON<BlogBriefPayload>({
      system: systemPrompt,
      user: userPrompt,
      maxTokens: 2000,
    })

    // Get agency id
    const { data: rawAgency } = await supabase
      .from('agencies')
      .select('id')
      .eq('owner_id', user.id)
      .single()
    const agency = rawAgency as { id: string } | null

    // Save to blog_briefs table
    const { data: savedBrief, error: saveError } = await supabase
      .from('blog_briefs')
      .insert({
        client_id,
        agency_id: agency?.id,
        title: brief.title,
        primary_keyword: brief.primary_keyword,
        secondary_keywords: brief.secondary_keywords,
        search_intent: brief.search_intent,
        target_audience: brief.target_audience,
        funnel_stage: brief.funnel_stage,
        content_angle: brief.content_angle,
        required_sections: brief.required_sections,
        faqs: brief.faqs,
        internal_links: brief.internal_links,
        schema_recommendation: brief.schema_recommendation,
        cta_suggestion: brief.cta_suggestion,
        eeat_notes: brief.eeat_notes,
        aeo_notes: brief.aeo_notes,
        llm_notes: brief.llm_notes,
        competitor_weaknesses: brief.competitor_weaknesses,
        recommended_word_count: brief.recommended_word_count,
        tone_notes: brief.tone_notes,
        status: 'draft',
        source_type: source_type ?? 'manual',
        source_keyword: keyword ?? null,
      } as any)
      .select()
      .single()

    if (saveError) {
      console.error('Error saving brief:', saveError)
      // Return the brief even if save fails
      return NextResponse.json({ brief, saved: false })
    }

    return NextResponse.json({ brief: savedBrief, saved: true })
  } catch (err) {
    console.error('Blog brief generation error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    )
  }
}
