// ─── Priority Scoring Engine ──────────────────────────────────────────────────

export type ScoringInput = {
  position: number | null          // GSC average position
  impressions: number | null       // GSC monthly impressions
  clicks: number | null            // GSC monthly clicks
  ctr: number | null               // GSC CTR (0-1)
  conversions: number | null       // GA4 conversions
  engagementRate: number | null    // GA4 engagement rate (0-1)
  pageType: 'service' | 'blog' | 'landing' | 'category' | 'other' | null
  effort: 'low' | 'medium' | 'high'
  contentAge: number | null        // days since published
  hasBacklinks: boolean
  competitorCount: number          // how many competitors outrank
}

export type ScoringOutput = {
  priorityScore: number            // 0-100
  impact: 'low' | 'medium' | 'high' | 'very_high'
  effort: 'low' | 'medium' | 'high'
  urgency: 'low' | 'medium' | 'high' | 'critical'
  reasoning: string
}

/**
 * Industry average CTRs by position (positions 1-10+).
 * Based on widely-cited SEO CTR studies.
 */
function getExpectedCtr(position: number): number {
  const ctrs = [0.32, 0.17, 0.11, 0.08, 0.06, 0.05, 0.04, 0.04, 0.03, 0.03]
  const idx = Math.max(0, Math.min(9, Math.floor(position) - 1))
  return ctrs[idx]
}

export function calculatePriorityScore(input: ScoringInput): ScoringOutput {
  let score = 0
  const reasons: string[] = []

  // ── Position scoring (max 30 points) ───────────────────────────────────────
  if (input.position !== null) {
    if (input.position >= 1 && input.position <= 3) {
      score += 10
      // Already ranking well — less urgent to change
    } else if (input.position >= 4 && input.position <= 10) {
      score += 30
      reasons.push(`ranks position ${Math.round(input.position)} — quick win territory`)
    } else if (input.position >= 11 && input.position <= 20) {
      score += 25
      reasons.push(`ranks position ${Math.round(input.position)} — reachable with optimisation`)
    } else if (input.position >= 21 && input.position <= 50) {
      score += 10
    }
    // 50+ gets minimal points — too much lift needed
  }

  // ── Impressions scoring (max 25 points) ────────────────────────────────────
  if (input.impressions !== null) {
    if (input.impressions >= 5000) {
      score += 25
      reasons.push(`${input.impressions.toLocaleString()} monthly impressions`)
    } else if (input.impressions >= 1000) {
      score += 18
      reasons.push(`${input.impressions.toLocaleString()} impressions`)
    } else if (input.impressions >= 200) {
      score += 10
    } else {
      score += 3
    }
  }

  // ── CTR gap scoring (max 15 points) ────────────────────────────────────────
  if (input.ctr !== null && input.position !== null) {
    const expectedCtr = getExpectedCtr(input.position)
    const ctrGap = expectedCtr - input.ctr
    if (ctrGap > 0.1) {
      score += 15
      reasons.push(
        `CTR ${(input.ctr * 100).toFixed(1)}% vs expected ${(expectedCtr * 100).toFixed(1)}% — significant title/meta opportunity`
      )
    } else if (ctrGap > 0.05) {
      score += 8
      reasons.push(`CTR below benchmark for position ${Math.round(input.position)}`)
    }
  }

  // ── Conversion value (max 20 points) ───────────────────────────────────────
  if (input.conversions !== null && input.conversions > 0) {
    const conversionPoints = Math.min(20, Math.round(input.conversions * 2))
    score += conversionPoints
    reasons.push(`generates ${input.conversions} conversions`)
  }

  // ── Page type modifier ──────────────────────────────────────────────────────
  if (input.pageType === 'service') {
    score += 10
    reasons.push('service page with commercial intent')
  } else if (input.pageType === 'landing') {
    score += 8
  } else if (input.pageType === 'category') {
    score += 5
  }

  // ── Engagement rate boost ───────────────────────────────────────────────────
  if (input.engagementRate !== null && input.engagementRate >= 0.6) {
    score += 5
    reasons.push(`strong engagement rate (${(input.engagementRate * 100).toFixed(0)}%)`)
  }

  // ── Content decay penalty ───────────────────────────────────────────────────
  if (input.contentAge !== null && input.contentAge > 365) {
    score -= 5
    reasons.push('content is over 1 year old — may need refresh')
  }

  // ── Backlink presence boost ─────────────────────────────────────────────────
  if (input.hasBacklinks) {
    score += 3
  }

  // ── Competitor pressure ─────────────────────────────────────────────────────
  if (input.competitorCount >= 3) {
    score -= 3
  }

  // ── Effort modifier ─────────────────────────────────────────────────────────
  if (input.effort === 'low') {
    score += 10
  } else if (input.effort === 'high') {
    score -= 10
  }

  // ── Clamp ───────────────────────────────────────────────────────────────────
  score = Math.max(0, Math.min(100, score))

  // ── Derive labels ───────────────────────────────────────────────────────────
  const impact: ScoringOutput['impact'] =
    score >= 75 ? 'very_high' :
    score >= 55 ? 'high' :
    score >= 35 ? 'medium' : 'low'

  const urgency: ScoringOutput['urgency'] =
    score >= 80 ? 'critical' :
    score >= 60 ? 'high' :
    score >= 40 ? 'medium' : 'low'

  return {
    priorityScore: score,
    impact,
    effort: input.effort,
    urgency,
    reasoning:
      reasons.length > 0
        ? `Priority score ${score}/100: ${reasons.join(', ')}.`
        : `Score: ${score}/100`,
  }
}

/**
 * Detect the page type from a URL path.
 */
export function detectPageType(
  url: string
): ScoringInput['pageType'] {
  const path = (() => {
    try {
      return new URL(url).pathname.toLowerCase()
    } catch {
      return url.toLowerCase()
    }
  })()

  if (/\/(service|services|solution|solutions|product|products)/.test(path)) return 'service'
  if (/\/(blog|news|article|post|resource|guide|tips)/.test(path)) return 'blog'
  if (/\/(category|cat|tag|topic)/.test(path)) return 'category'
  if (/\/(landing|lp|offer|promo|campaign)/.test(path)) return 'landing'

  return 'other'
}
