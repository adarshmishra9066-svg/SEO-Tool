import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { callAIJSON } from '@/lib/ai/client'

interface QAIssue {
  type: 'ai_language' | 'generic_phrase' | 'missing_eeat' | 'keyword_stuffing' | 'thin_content'
  text: string
  fix: string
}

interface QAResult {
  overall_score: number
  seo_score: number
  eeat_score: number
  aeo_score: number
  human_quality_score: number
  ai_detection_risk: number
  issues: QAIssue[]
  verdict: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { content, client_id, url } = body

    if (!content) {
      return NextResponse.json({ error: 'content is required' }, { status: 400 })
    }

    const systemPrompt = `You are an expert SEO content QA reviewer. Analyse the provided content and return a detailed quality assessment as JSON only — no markdown, no explanation.

Evaluate:
1. SEO quality: keyword usage, structure, meta elements, headings
2. E-E-A-T signals: experience, expertise, authoritativeness, trustworthiness
3. AEO readiness: answer engine optimisation, direct answers, structured content
4. Human writing quality: naturalness, specificity, engagement
5. AI detection risk: phrases that sound AI-generated, generic sentences, lack of personality

Issue types:
- ai_language: Generic AI-sounding phrases
- generic_phrase: Vague, non-specific claims
- missing_eeat: Missing expertise/trust signals
- keyword_stuffing: Overuse of keywords
- thin_content: Sections lacking depth`

    const userPrompt = `Analyse this content and return a JSON QA report:

${content.slice(0, 6000)}

Return exactly this JSON structure:
{
  "overall_score": <0-100>,
  "seo_score": <0-100>,
  "eeat_score": <0-100>,
  "aeo_score": <0-100>,
  "human_quality_score": <0-100>,
  "ai_detection_risk": <0-100>,
  "issues": [
    {
      "type": "ai_language|generic_phrase|missing_eeat|keyword_stuffing|thin_content",
      "text": "exact problematic text or description of the issue",
      "fix": "specific actionable fix recommendation"
    }
  ],
  "verdict": "One sentence overall verdict — Publish-ready | Needs minor revisions | Needs significant work | Not ready to publish"
}`

    const result = await callAIJSON<QAResult>({
      system: systemPrompt,
      user: userPrompt,
      maxTokens: 2000,
    })

    // Optionally save to content_qa_results
    if (client_id) {
      await supabase.from('content_qa_results').insert({
        client_id,
        url: url ?? null,
        overall_score: result.overall_score,
        seo_score: result.seo_score,
        eeat_score: result.eeat_score,
        aeo_score: result.aeo_score,
        human_quality_score: result.human_quality_score,
        ai_detection_risk: result.ai_detection_risk,
        issues: result.issues,
        verdict: result.verdict,
        content_snippet: content.slice(0, 500),
      })
    }

    return NextResponse.json(result)
  } catch (err) {
    console.error('Content QA error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    )
  }
}
