/**
 * Ubersuggest MCP HTTP client.
 * Calls the MCP server via JSON-RPC 2.0 over HTTP (Streamable HTTP transport).
 * No API key needed — auth is handled by the MCP server session.
 */

const MCP_URL = 'https://ubersuggest-mcp.neilpatelapi.com/mcp'

let _reqId = 1

async function callTool<T = unknown>(name: string, args: Record<string, unknown>): Promise<T> {
  const res = await fetch(MCP_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: String(_reqId++),
      method: 'tools/call',
      params: { name, arguments: args },
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(`Ubersuggest MCP error ${res.status}: ${text}`)
  }

  const contentType = res.headers.get('content-type') ?? ''

  // Streaming SSE response — read all events, return last result
  if (contentType.includes('text/event-stream')) {
    const text = await res.text()
    // Parse SSE: find the last `data:` line with a JSON-RPC result
    const lines = text.split('\n')
    let lastResult: T | undefined
    for (const line of lines) {
      if (line.startsWith('data:')) {
        try {
          const json = JSON.parse(line.slice(5).trim())
          if (json?.result !== undefined) lastResult = json.result as T
        } catch { /* skip non-JSON lines */ }
      }
    }
    if (lastResult === undefined) throw new Error('No result in SSE stream')
    return lastResult
  }

  // Standard JSON response
  const json = await res.json()
  if (json.error) throw new Error(`MCP error: ${json.error.message ?? JSON.stringify(json.error)}`)
  return json.result as T
}

// ─── Tool wrappers ────────────────────────────────────────────────────────────

export interface DomainOverview {
  domain: string
  organic_traffic?: number
  organic_keywords?: number
  domain_authority?: number
  backlinks?: number
  [key: string]: unknown
}

export interface SiteAuditStatus {
  done: boolean
  crawl_count?: number
  crawl_max_pages?: number
  extended_status?: string
  report?: {
    overview?: {
      health_score?: number
      errors?: number
      warnings?: number
      recommendations?: number
    }
    issues_per_category?: {
      errors?: Array<{ id: string; count: number; title?: string }>
      warnings?: Array<{ id: string; count: number; title?: string }>
      recommendations?: Array<{ id: string; count: number; title?: string }>
    }
  }
}

export interface SiteAuditIssueResult {
  breakdown?: Array<{
    url: string
    status?: string
    recommendation?: string
  }>
}

export interface DomainKeyword {
  keyword: string
  position?: number
  search_volume?: number
  difficulty?: number
  cpc?: number
  url?: string
  [key: string]: unknown
}

export async function getDomainOverview(domain: string): Promise<DomainOverview> {
  return callTool<DomainOverview>('domain_overview', { domain })
}

export async function startSiteAudit(domain: string, recrawl = false): Promise<SiteAuditStatus> {
  return callTool<SiteAuditStatus>('site_audit', { domain, recrawl })
}

export async function getSiteAuditStatus(domain: string): Promise<SiteAuditStatus> {
  return callTool<SiteAuditStatus>('site_audit_status', { domain })
}

export async function getSiteAuditResults(domain: string, issue: string): Promise<SiteAuditIssueResult> {
  return callTool<SiteAuditIssueResult>('site_audit_results', { domain, issue })
}

export async function getDomainKeywords(domain: string, limit = 50): Promise<{ keywords: DomainKeyword[] }> {
  return callTool<{ keywords: DomainKeyword[] }>('domain_keywords', { domain, limit })
}
