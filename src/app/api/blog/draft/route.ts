import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { callAI } from '@/lib/ai/client'
import type { Client, BlogBrief } from '@/lib/database.types'

function scoreDraft(content: string): {
  seo_score: number
  eeat_score: number
  aeo_score: number
  human_quality_score: number
  ai_risk_score: number
} {
  const lower = content.toLowerCase()

  // SEO score: headings, keyword usage, length
  let seo = 50
  if (content.includes('## ') || content.includes('# ')) seo += 15
  if (content.length > 2000) seo += 10
  if (content.length > 4000) seo += 10
  if (lower.includes('faq')) seo += 10
  if (content.match(/\[link:/i)) seo += 5
  seo = Math.min(seo, 100)

  // EEAT score: specificity signals
  let eeat = 50
  const hasNumbers = /\d+%|\d+\s+(years|clients|studies)/.test(content)
  if (hasNumbers) eeat += 15
  if (lower.includes('for example') || lower.includes('for instance')) eeat += 10
  if (lower.includes('according to') || lower.includes('research shows')) eeat += 10
  if (content.length > 3000) eeat += 10
  eeat = Math.min(eeat, 100)

  // AEO score: direct answers, structured content
  let aeo = 40
  if (lower.includes('faq') || lower.includes('frequently asked')) aeo += 20
  if (content.includes('?')) aeo += 10
  if (content.includes('- ') || content.includes('* ')) aeo += 15
  if (lower.includes('the answer is') || lower.includes('in short,')) aeo += 10
  aeo = Math.min(aeo, 100)

  // Human quality score: avoid AI tells
  let human = 70
  const aiBadPhrases = [
    'in today\'s digital world',
    'in the ever-evolving',
    'it\'s important to note',
    'as we delve into',
    'navigating the landscape',
    'in conclusion,',
    'to summarize,',
    'leverage',
    'cutting-edge',
  ]
  const aiHits = aiBadPhrases.filter((p) => lower.includes(p)).length
  human -= aiHits * 8
  if (content.match(/\b(I|we|our team)\b/)) human += 10
  human = Math.max(20, Math.min(human, 100))

  // AI risk score (lower is better = less AI-sounding)
  let aiRisk = 30
  aiRisk += aiHits * 10
  if (!content.match(/\b(I|we|our)\b/)) aiRisk += 10
  if (content.split('\n\n').every((p) => p.length > 200)) aiRisk += 10
  aiRisk = Math.max(5, Math.min(aiRisk, 95))

  return {
    seo_score: Math.round(seo),
    eeat_score: Math.round(eeat),
    aeo_score: Math.round(aeo),
    human_quality_score: Math.round(human),
    ai_risk_score: Math.round(aiRisk),
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { brief_id, client_id } = body

    if (!brief_id || !client_id) {
      return NextResponse.json({ error: 'brief_id and client_id are required' }, { status: 400 })
    }

    // Fetch brief
    const { data: rawBrief } = await supabase
      .from('blog_briefs')
      .select('*')
      .eq('id', brief_id)
      .single()

    if (!rawBrief) return NextResponse.json({ error: 'Brief not found' }, { status: 404 })
    const brief = rawBrief as BlogBrief

    // Fetch client context
    const { data: rawClient } = await supabase
      .from('clients')
      .select('*')
      .eq('id', client_id)
      .single()

    if (!rawClient) return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    const client = rawClient as Client

    const faqs = (brief.faqs ?? []) as { question: string; answer_hint: string }[]
    const internalLinks = (brief.internal_links ?? []) as { anchor: string; target: string }[]
    const sections = brief.required_sections ?? []

    const systemPrompt = `You are an expert SEO content writer who writes for humans first, search engines second.

Rules you MUST follow:
- NEVER start with "In today's digital world" or any variation
- NEVER start with "In the ever-evolving..."
- NEVER use "it's important to note"
- NEVER use "leverage" as a verb
- NEVER write generic, fluffy introductions — open with a specific, useful, direct statement
- Short paragraphs (2-4 sentences max)
- Include real examples, specific numbers, and concrete details — never vague claims
- Structure with clear H2 (##) and H3 (###) headings
- Include an FAQ section at the end answering the provided questions
- Mark internal link opportunities as [LINK: anchor text → /suggested-url]
- Match the client's brand tone exactly
- E-E-A-T: Write as someone with real experience, use specific numbers/examples
- AEO: Include direct answer blocks for key questions — state the answer clearly first
- Sound like a real expert wrote this, not a content mill
- Include meta title and meta description at the very top before the article

Format:
META TITLE: [60 chars max]
META DESCRIPTION: [155 chars max]
URL SLUG: [url-friendly-slug]

---

[Full article content with H2s and H3s]`

    const faqsText =
      faqs.length > 0
        ? faqs.map((f) => `Q: ${f.question}\nHint: ${f.answer_hint}`).join('\n\n')
        : 'Generate 4 relevant FAQs based on the topic'

    const internalLinksText =
      internalLinks.length > 0
        ? internalLinks.map((l) => `- "${l.anchor}" → ${l.target}`).join('\n')
        : 'Suggest natural internal links where relevant'

    const userPrompt = `Write a complete, publish-ready blog post based on this brief:

BRIEF DETAILS:
Title: ${brief.title}
Primary Keyword: ${brief.primary_keyword}
Secondary Keywords: ${(brief.secondary_keywords ?? []).join(', ')}
Search Intent: ${brief.search_intent}
Target Audience: ${brief.target_audience}
Funnel Stage: ${brief.funnel_stage}
Content Angle: ${brief.content_angle}
Required Word Count: ~${brief.recommended_word_count ?? 1800} words
Schema Type: ${brief.schema_recommendation}
CTA: ${brief.cta_suggestion}

REQUIRED SECTIONS:
${sections.map((s, i) => `${i + 1}. ${s}`).join('\n')}

E-E-A-T GUIDANCE:
${brief.eeat_notes}

AEO GUIDANCE:
${brief.aeo_notes}

TONE NOTES:
${brief.tone_notes}
Brand tone: ${client.brand_tone ?? 'Professional and helpful'}

FAQs TO ANSWER:
${faqsText}

INTERNAL LINK OPPORTUNITIES:
${internalLinksText}

CLIENT CONTEXT:
Website: ${client.website_url}
Industry: ${client.industry}
Services: ${client.services_products ?? 'Not specified'}

Write the complete article now. Make it genuinely useful, specific, and human.`

    const draftContent = await callAI({
      system: systemPrompt,
      user: userPrompt,
      maxTokens: 6000,
    })

    // Parse meta title, description, slug from content
    const lines = draftContent.split('\n')
    let seoTitle = brief.title
    let metaDescription = ''
    let urlSlug = brief.primary_keyword?.toLowerCase().replace(/\s+/g, '-') ?? ''
    let contentBody = draftContent

    for (const line of lines.slice(0, 10)) {
      if (line.startsWith('META TITLE:')) seoTitle = line.replace('META TITLE:', '').trim()
      if (line.startsWith('META DESCRIPTION:'))
        metaDescription = line.replace('META DESCRIPTION:', '').trim()
      if (line.startsWith('URL SLUG:')) urlSlug = line.replace('URL SLUG:', '').trim()
    }

    // Remove meta header from content body
    const dividerIdx = draftContent.indexOf('---')
    if (dividerIdx > -1) {
      contentBody = draftContent.slice(dividerIdx + 3).trim()
    }

    // Extract FAQ section
    const faqIdx = contentBody.toLowerCase().indexOf('## faq')
    let faqSection = ''
    if (faqIdx > -1) {
      faqSection = contentBody.slice(faqIdx)
      contentBody = contentBody.slice(0, faqIdx).trim()
    }

    // Score the draft
    const scores = scoreDraft(draftContent)

    // Save to blog_drafts
    const { data: savedDraft, error: saveError } = await supabase
      .from('blog_drafts')
      .insert({
        brief_id,
        client_id,
        seo_title: seoTitle,
        meta_description: metaDescription,
        url_slug: urlSlug,
        h1: seoTitle,
        content: contentBody,
        faq_section: faqSection,
        internal_link_suggestions: internalLinks,
        schema_suggestion: brief.schema_recommendation ?? 'Article',
        image_suggestions: [],
        cta: brief.cta_suggestion ?? '',
        keyword_usage_summary: {
          primary: brief.primary_keyword,
          secondary: brief.secondary_keywords,
        },
        eeat_score: scores.eeat_score,
        aeo_score: scores.aeo_score,
        seo_score: scores.seo_score,
        human_quality_score: scores.human_quality_score,
        ai_risk_score: scores.ai_risk_score,
        status: 'draft',
      } as any)
      .select()
      .single()

    if (saveError) {
      console.error('Error saving draft:', saveError)
      return NextResponse.json({
        draft: {
          seo_title: seoTitle,
          meta_description: metaDescription,
          url_slug: urlSlug,
          content: contentBody,
          faq_section: faqSection,
          ...scores,
        },
        saved: false,
      })
    }

    // Update brief status to in_progress
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('blog_briefs')
      .update({ status: 'in_progress' })
      .eq('id', brief_id)

    return NextResponse.json({ draft: savedDraft, saved: true })
  } catch (err) {
    console.error('Blog draft generation error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    )
  }
}
