import { callAIJSON } from './client'
import {
  SEO_OPPORTUNITY_PROMPT,
  BLOG_BRIEF_PROMPT,
  EXPLAIN_FOR_CLIENT_PROMPT,
  WEEKLY_PLAN_PROMPT,
} from './prompts'

// ─── Types ────────────────────────────────────────────────────────────────────

export type AiOpportunity = {
  type: string
  title: string
  description: string
  priority_score: number
  impact: 'low' | 'medium' | 'high' | 'very_high'
  effort: 'low' | 'medium' | 'high'
  urgency: 'low' | 'medium' | 'high' | 'critical'
  related_page_url: string | null
  related_keyword: string | null
  recommended_action: string
}

export type GscDataPoint = {
  query: string
  page: string | null
  clicks: number
  impressions: number
  ctr: number
  position: number
}

export type Ga4DataPoint = {
  page_path: string
  sessions: number
  conversions: number
  engagement_rate: number
}

export type OpportunityInput = {
  clientName: string
  websiteUrl: string
  industry: string | null
  gscData: GscDataPoint[]
  ga4Data: Ga4DataPoint[]
  topPages: string[]
  competitors: string[]
}

export type ExplainOpportunityInput = {
  opportunity: {
    title: string
    description: string
    recommended_action: string
  }
  clientContext: {
    name: string
    industry: string | null
  }
}

export type WeeklyPlanInput = {
  clientName: string
  tasks: Array<{ title: string; priority_score: number; task_type: string; status: string }>
  opportunities: Array<{ title: string; priority_score: number; type: string }>
  weekStartDate: string
}

export type WeeklyPlan = {
  quick_wins: string[]
  content_task: string
  internal_linking_task: string
  technical_task: string | null
  backlink_task: string | null
  reporting_task: string
  rationale: string
}

export type ExplainForClientInput = {
  technicalText: string
  context?: string
}

// ─── Validation helpers ───────────────────────────────────────────────────────

const VALID_IMPACT = ['low', 'medium', 'high', 'very_high'] as const
const VALID_EFFORT = ['low', 'medium', 'high'] as const
const VALID_URGENCY = ['low', 'medium', 'high', 'critical'] as const

function validateOpportunity(o: unknown): o is AiOpportunity {
  if (!o || typeof o !== 'object') return false
  const obj = o as Record<string, unknown>
  return (
    typeof obj.type === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.description === 'string' &&
    typeof obj.priority_score === 'number' &&
    VALID_IMPACT.includes(obj.impact as AiOpportunity['impact']) &&
    VALID_EFFORT.includes(obj.effort as AiOpportunity['effort']) &&
    VALID_URGENCY.includes(obj.urgency as AiOpportunity['urgency']) &&
    typeof obj.recommended_action === 'string'
  )
}

function sanitizeOpportunity(o: Record<string, unknown>): AiOpportunity {
  return {
    type: typeof o.type === 'string' ? o.type : 'general',
    title: typeof o.title === 'string' ? o.title.slice(0, 120) : 'Untitled opportunity',
    description: typeof o.description === 'string' ? o.description : '',
    priority_score: typeof o.priority_score === 'number' ? Math.max(0, Math.min(100, o.priority_score)) : 50,
    impact: VALID_IMPACT.includes(o.impact as AiOpportunity['impact']) ? (o.impact as AiOpportunity['impact']) : 'medium',
    effort: VALID_EFFORT.includes(o.effort as AiOpportunity['effort']) ? (o.effort as AiOpportunity['effort']) : 'medium',
    urgency: VALID_URGENCY.includes(o.urgency as AiOpportunity['urgency']) ? (o.urgency as AiOpportunity['urgency']) : 'medium',
    related_page_url: typeof o.related_page_url === 'string' ? o.related_page_url : null,
    related_keyword: typeof o.related_keyword === 'string' ? o.related_keyword : null,
    recommended_action: typeof o.recommended_action === 'string' ? o.recommended_action : 'Review and optimise this area.',
  }
}

// ─── AI Functions ─────────────────────────────────────────────────────────────

/**
 * Generate SEO opportunities from GSC + GA4 data using AI analysis.
 * Returns empty array on any failure — never throws.
 */
export async function generateSeoOpportunities(
  input: OpportunityInput
): Promise<AiOpportunity[]> {
  try {
    const gscSummary = input.gscData
      .sort((a, b) => b.impressions - a.impressions)
      .slice(0, 30)
      .map(
        (d) =>
          `Query: "${d.query}" | Page: ${d.page ?? 'unknown'} | Pos: ${d.position.toFixed(1)} | Impressions: ${d.impressions} | Clicks: ${d.clicks} | CTR: ${(d.ctr * 100).toFixed(1)}%`
      )
      .join('\n')

    const ga4Summary = input.ga4Data
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, 20)
      .map(
        (d) =>
          `Page: ${d.page_path} | Sessions: ${d.sessions} | Conversions: ${d.conversions} | Engagement: ${(d.engagement_rate * 100).toFixed(0)}%`
      )
      .join('\n')

    const userMessage = `Analyse the following SEO data for ${input.clientName} (${input.websiteUrl}) in the ${input.industry ?? 'unknown'} industry.

GSC DATA (top 30 by impressions):
${gscSummary || 'No GSC data available'}

GA4 LANDING PAGE DATA:
${ga4Summary || 'No GA4 data available'}

TOP PAGES: ${input.topPages.join(', ') || 'Not provided'}
COMPETITORS: ${input.competitors.join(', ') || 'Not provided'}

Generate 5-8 specific, data-driven SEO opportunities based on this data. Focus on quick wins first (positions 4-15), then CTR gaps, then content and technical issues.`

    const result = await callAIJSON<unknown[]>({
      system: SEO_OPPORTUNITY_PROMPT,
      user: userMessage,
      maxTokens: 4096,
    })

    if (!Array.isArray(result)) return []

    return result
      .map((o) => {
        if (!o || typeof o !== 'object') return null
        if (validateOpportunity(o)) return o
        return sanitizeOpportunity(o as Record<string, unknown>)
      })
      .filter((o): o is AiOpportunity => o !== null)
      .slice(0, 10)
  } catch (err) {
    console.error('[generateSeoOpportunities] Error:', err)
    return []
  }
}

/**
 * Explain a specific SEO opportunity in both technical and client-friendly terms.
 * Returns fallback strings on failure — never throws.
 */
export async function explainOpportunity(
  input: ExplainOpportunityInput
): Promise<{ explanation: string; client_friendly: string }> {
  const fallback = {
    explanation: input.opportunity.description,
    client_friendly: `This opportunity could help ${input.clientContext.name} get more organic traffic from search engines.`,
  }

  try {
    const result = await callAIJSON<{ explanation: string; client_friendly: string }>({
      system: EXPLAIN_FOR_CLIENT_PROMPT,
      user: `Explain this SEO opportunity for ${input.clientContext.name} (${input.clientContext.industry ?? 'general business'}):

Title: ${input.opportunity.title}
Description: ${input.opportunity.description}
Recommended Action: ${input.opportunity.recommended_action}

Provide two versions:
1. "explanation": A clear technical explanation (for the SEO team)
2. "client_friendly": A plain-English version for the business owner (2-3 sentences, business impact focused)

Return JSON: { "explanation": "...", "client_friendly": "..." }`,
      maxTokens: 1024,
    })

    return {
      explanation: result.explanation || fallback.explanation,
      client_friendly: result.client_friendly || fallback.client_friendly,
    }
  } catch (err) {
    console.error('[explainOpportunity] Error:', err)
    return fallback
  }
}

/**
 * Generate a prioritised weekly work plan for a client.
 * Returns a sensible default plan on failure — never throws.
 */
export async function generateWeeklyPlan(input: WeeklyPlanInput): Promise<WeeklyPlan> {
  const fallback: WeeklyPlan = {
    quick_wins: ['Review top position 4-15 pages and optimise title tags'],
    content_task: 'Identify one blog post opportunity based on keyword data',
    internal_linking_task: 'Add internal links from blog posts to main service pages',
    technical_task: null,
    backlink_task: null,
    reporting_task: 'Prepare weekly GSC summary for client update',
    rationale: 'Balanced weekly plan focused on quick wins and sustainable growth.',
  }

  try {
    const topTasks = input.tasks
      .filter((t) => t.status !== 'completed' && t.status !== 'skipped')
      .sort((a, b) => b.priority_score - a.priority_score)
      .slice(0, 10)

    const topOpportunities = input.opportunities
      .sort((a, b) => b.priority_score - a.priority_score)
      .slice(0, 5)

    const result = await callAIJSON<WeeklyPlan>({
      system: WEEKLY_PLAN_PROMPT,
      user: `Create a weekly SEO work plan for ${input.clientName} for the week starting ${input.weekStartDate}.

PENDING TASKS (top 10 by priority):
${topTasks.map((t) => `- [${t.task_type}] ${t.title} (score: ${t.priority_score})`).join('\n') || 'No pending tasks'}

TOP OPPORTUNITIES:
${topOpportunities.map((o) => `- [${o.type}] ${o.title} (score: ${o.priority_score})`).join('\n') || 'No opportunities identified'}

Recommend a focused, achievable week of work. Return as JSON matching the WeeklyPlan structure.`,
      maxTokens: 2048,
    })

    return {
      quick_wins: Array.isArray(result.quick_wins) ? result.quick_wins : fallback.quick_wins,
      content_task: result.content_task || fallback.content_task,
      internal_linking_task: result.internal_linking_task || fallback.internal_linking_task,
      technical_task: result.technical_task || null,
      backlink_task: result.backlink_task || null,
      reporting_task: result.reporting_task || fallback.reporting_task,
      rationale: result.rationale || fallback.rationale,
    }
  } catch (err) {
    console.error('[generateWeeklyPlan] Error:', err)
    return fallback
  }
}

/**
 * Explain a technical SEO concept in plain English for a client.
 * Returns a sensible fallback on failure — never throws.
 */
export async function explainForClient(
  input: ExplainForClientInput
): Promise<{ client_explanation: string }> {
  const fallback = {
    client_explanation:
      'This is a technical SEO improvement that can help your website get found by more potential customers on Google.',
  }

  try {
    const result = await callAIJSON<{ client_explanation: string }>({
      system: EXPLAIN_FOR_CLIENT_PROMPT,
      user: `Explain this technical SEO concept in plain English for a business owner:

${input.technicalText}
${input.context ? `\nContext: ${input.context}` : ''}

Return JSON: { "client_explanation": "your plain English explanation here" }`,
      maxTokens: 512,
    })

    return {
      client_explanation: result.client_explanation || fallback.client_explanation,
    }
  } catch (err) {
    console.error('[explainForClient] Error:', err)
    return fallback
  }
}

/**
 * Generate a blog brief for a given keyword and client.
 * Returns null on failure — never throws.
 */
export async function generateBlogBrief(input: {
  keyword: string
  clientName: string
  industry: string | null
  websiteUrl: string
  targetAudience: string | null
  brandTone: string | null
}): Promise<Record<string, unknown> | null> {
  try {
    const result = await callAIJSON<Record<string, unknown>>({
      system: BLOG_BRIEF_PROMPT,
      user: `Create a detailed blog brief for this keyword and client:

Client: ${input.clientName} (${input.websiteUrl})
Industry: ${input.industry ?? 'General business'}
Target Audience: ${input.targetAudience ?? 'Business owners and decision makers'}
Brand Tone: ${input.brandTone ?? 'Professional and helpful'}
Primary Keyword: ${input.keyword}

Return a complete blog brief as JSON.`,
      maxTokens: 4096,
    })

    return result
  } catch (err) {
    console.error('[generateBlogBrief] Error:', err)
    return null
  }
}
