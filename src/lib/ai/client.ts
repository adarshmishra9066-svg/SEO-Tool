// AI client using fetch-based approach (no SDK dependency)
// Uses Anthropic's Messages API directly

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-6'

interface AnthropicMessage {
  role: 'user' | 'assistant'
  content: string
}

interface AnthropicRequest {
  model: string
  max_tokens: number
  system: string
  messages: AnthropicMessage[]
}

interface AnthropicContentBlock {
  type: 'text'
  text: string
}

interface AnthropicResponse {
  content: AnthropicContentBlock[]
  stop_reason: string
  usage: { input_tokens: number; output_tokens: number }
}

export async function callAI(params: {
  system: string
  user: string
  maxTokens?: number
}): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not set')
  }

  const body: AnthropicRequest = {
    model: MODEL,
    max_tokens: params.maxTokens ?? 4096,
    system: params.system,
    messages: [{ role: 'user', content: params.user }],
  }

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Anthropic API error ${response.status}: ${error}`)
  }

  const data = (await response.json()) as AnthropicResponse
  const content = data.content[0]
  if (content?.type === 'text') return content.text
  throw new Error('Unexpected AI response type')
}

export async function callAIJSON<T>(params: {
  system: string
  user: string
  maxTokens?: number
}): Promise<T> {
  const text = await callAI(params)
  // Strip markdown code blocks if present
  const cleaned = text
    .replace(/^```json\n?/, '')
    .replace(/^```\n?/, '')
    .replace(/\n?```$/, '')
    .trim()
  return JSON.parse(cleaned) as T
}
