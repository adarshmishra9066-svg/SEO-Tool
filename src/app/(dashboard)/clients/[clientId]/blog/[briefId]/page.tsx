'use client'

import * as React from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Loader2,
  Wand2,
  CheckCircle2,
  Tag,
  FileText,
  Users,
  Target,
  MessageSquare,
  Link2,
  Brain,
  Shield,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { BlogDraftEditor } from '@/components/blog/blog-draft-editor'
import { ContentQAPanel, type QAResult } from '@/components/blog/content-qa-panel'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import type { BlogBrief, BlogDraft } from '@/lib/database.types'

// ─── Section component ─────────────────────────────────────────────────────────

interface InfoSectionProps {
  icon: React.ElementType
  label: string
  children: React.ReactNode
  className?: string
}

function InfoSection({ icon: Icon, label, children, className }: InfoSectionProps) {
  return (
    <div className={cn('bg-white rounded-xl border border-gray-200 p-4', className)}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-indigo-500" />
        <h3 className="text-sm font-semibold text-gray-800">{label}</h3>
      </div>
      {children}
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function BlogBriefDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const clientId = params.clientId as string
  const briefId = params.briefId as string
  const autoGenerate = searchParams.get('generate') === 'true'

  const [brief, setBrief] = React.useState<BlogBrief | null>(null)
  const [draft, setDraft] = React.useState<BlogDraft | null>(null)
  const [qaResult, setQaResult] = React.useState<QAResult | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isGeneratingDraft, setIsGeneratingDraft] = React.useState(false)
  const [isQALoading, setIsQALoading] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState('brief')

  // Fetch brief and draft
  React.useEffect(() => {
    async function load() {
      setIsLoading(true)
      try {
        const [briefRes, draftRes] = await Promise.all([
          fetch(`/api/blog/brief?id=${briefId}`),
          fetch(`/api/blog/draft?brief_id=${briefId}`),
        ])

        if (briefRes.ok) {
          const data = await briefRes.json()
          setBrief(data.brief ?? data)
        }
        if (draftRes.ok) {
          const data = await draftRes.json()
          if (data.draft) setDraft(data.draft)
        }
      } catch {
        // Brief will be null — handled below
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [briefId])

  // Auto-generate draft if ?generate=true
  React.useEffect(() => {
    if (autoGenerate && brief && !draft && !isGeneratingDraft) {
      handleGenerateDraft()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoGenerate, brief, draft])

  async function handleGenerateDraft() {
    setIsGeneratingDraft(true)
    setActiveTab('draft')
    try {
      const res = await fetch('/api/blog/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief_id: briefId, client_id: clientId }),
      })

      if (!res.ok) throw new Error('Draft generation failed')
      const data = await res.json()
      setDraft(data.draft)
      toast({ title: 'Draft generated!', description: 'Your blog draft is ready for review.' })
    } catch (err) {
      toast({
        title: 'Generation failed',
        description: err instanceof Error ? err.message : 'Something went wrong',
        variant: 'destructive',
      })
    } finally {
      setIsGeneratingDraft(false)
    }
  }

  async function handleQACheck(content: string) {
    setIsQALoading(true)
    try {
      const res = await fetch('/api/content/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, client_id: clientId }),
      })
      if (!res.ok) throw new Error('QA check failed')
      const result = await res.json()
      setQaResult(result)
      setActiveTab('qa')
    } catch (err) {
      toast({
        title: 'QA failed',
        description: err instanceof Error ? err.message : 'Something went wrong',
        variant: 'destructive',
      })
    } finally {
      setIsQALoading(false)
    }
  }

  async function updatePublishStatus(status: BlogBrief['status']) {
    try {
      const res = await fetch(`/api/blog/brief?id=${briefId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Update failed')
      setBrief((prev) => (prev ? { ...prev, status } : prev))
      toast({ title: 'Status updated', description: `Brief marked as ${status}` })
    } catch {
      toast({ title: 'Update failed', variant: 'destructive' })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  if (!brief) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-gray-500">Brief not found.</p>
        <Button variant="outline" onClick={() => router.push(`/clients/${clientId}/blog`)}>
          Back to Blog
        </Button>
      </div>
    )
  }

  const faqs = (brief.faqs ?? []) as { question: string; answer_hint: string }[]
  const internalLinks = (brief.internal_links ?? []) as { anchor: string; target: string }[]

  const statusVariant =
    brief.status === 'published'
      ? 'success'
      : brief.status === 'in_progress'
        ? 'warning'
        : brief.status === 'approved'
          ? 'blue'
          : 'secondary'

  return (
    <div className="flex flex-col h-full">
      {/* Sticky header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0 -ml-2"
              onClick={() => router.push(`/clients/${clientId}/blog`)}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <Badge variant={statusVariant}>
                  {brief.status === 'in_progress'
                    ? 'In Progress'
                    : brief.status.charAt(0).toUpperCase() + brief.status.slice(1)}
                </Badge>
                {brief.funnel_stage && (
                  <span className="text-xs text-gray-400 capitalize">
                    {brief.funnel_stage}-of-Funnel
                  </span>
                )}
              </div>
              <h1 className="text-lg font-bold text-gray-900 line-clamp-2">{brief.title}</h1>
              {brief.primary_keyword && (
                <div className="flex items-center gap-1 mt-1">
                  <Tag className="w-3 h-3 text-indigo-500" />
                  <span className="text-xs text-indigo-600 font-medium">
                    {brief.primary_keyword}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {brief.status !== 'published' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => updatePublishStatus('published')}
                className="gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Mark Published
              </Button>
            )}
            {!draft ? (
              <Button
                size="sm"
                onClick={handleGenerateDraft}
                disabled={isGeneratingDraft}
                className="gap-2 bg-indigo-600 hover:bg-indigo-700"
              >
                {isGeneratingDraft ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Wand2 className="w-4 h-4" />
                )}
                {isGeneratingDraft ? 'Generating...' : 'Generate Draft'}
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={handleGenerateDraft}
                disabled={isGeneratingDraft}
                className="gap-2"
              >
                {isGeneratingDraft ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Wand2 className="w-4 h-4" />
                )}
                Regenerate Draft
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="brief">Brief</TabsTrigger>
            <TabsTrigger value="draft" disabled={!draft && !isGeneratingDraft}>
              Draft {draft && '✓'}
            </TabsTrigger>
            <TabsTrigger value="qa" disabled={!qaResult}>
              QA {qaResult && `(${qaResult.overall_score})`}
            </TabsTrigger>
          </TabsList>

          {/* Brief tab */}
          <TabsContent value="brief" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              {/* Left column */}
              <div className="space-y-4">
                <InfoSection icon={Target} label="Targeting">
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Search Intent</dt>
                      <dd className="font-medium text-gray-800 capitalize">
                        {brief.search_intent ?? '—'}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Funnel Stage</dt>
                      <dd className="font-medium text-gray-800 capitalize">
                        {brief.funnel_stage ?? '—'}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Word Count Target</dt>
                      <dd className="font-medium text-gray-800">
                        {brief.recommended_word_count?.toLocaleString() ?? '—'} words
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Schema</dt>
                      <dd className="font-medium text-gray-800">
                        {brief.schema_recommendation ?? '—'}
                      </dd>
                    </div>
                  </dl>
                </InfoSection>

                <InfoSection icon={Users} label="Target Audience">
                  <p className="text-sm text-gray-700">{brief.target_audience ?? '—'}</p>
                </InfoSection>

                <InfoSection icon={TrendingUp} label="Content Angle">
                  <p className="text-sm text-gray-700">{brief.content_angle ?? '—'}</p>
                </InfoSection>

                {brief.secondary_keywords && brief.secondary_keywords.length > 0 && (
                  <InfoSection icon={Tag} label="Secondary Keywords">
                    <div className="flex flex-wrap gap-2">
                      {brief.secondary_keywords.map((kw, i) => (
                        <Badge key={i} variant="secondary">
                          {kw}
                        </Badge>
                      ))}
                    </div>
                  </InfoSection>
                )}
              </div>

              {/* Right column */}
              <div className="space-y-4">
                {brief.required_sections && brief.required_sections.length > 0 && (
                  <InfoSection icon={FileText} label="Required Sections">
                    <ol className="space-y-1">
                      {brief.required_sections.map((section, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center shrink-0 font-semibold mt-0.5">
                            {i + 1}
                          </span>
                          {section}
                        </li>
                      ))}
                    </ol>
                  </InfoSection>
                )}

                {faqs.length > 0 && (
                  <InfoSection icon={MessageSquare} label="FAQs to Answer">
                    <div className="space-y-3">
                      {faqs.map((faq, i) => (
                        <div key={i} className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm font-medium text-gray-800">{faq.question}</p>
                          <p className="text-xs text-gray-500 mt-1">{faq.answer_hint}</p>
                        </div>
                      ))}
                    </div>
                  </InfoSection>
                )}
              </div>
            </div>

            {/* Full-width sections */}
            <div className="grid gap-4 lg:grid-cols-2">
              {brief.eeat_notes && (
                <InfoSection icon={Shield} label="E-E-A-T Guidance">
                  <p className="text-sm text-gray-700 whitespace-pre-line">{brief.eeat_notes}</p>
                </InfoSection>
              )}

              {brief.aeo_notes && (
                <InfoSection icon={Brain} label="AEO / Answer Engine Guidance">
                  <p className="text-sm text-gray-700 whitespace-pre-line">{brief.aeo_notes}</p>
                </InfoSection>
              )}

              {internalLinks.length > 0 && (
                <InfoSection icon={Link2} label="Internal Link Opportunities">
                  <div className="space-y-2">
                    {internalLinks.map((link, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <code className="bg-gray-100 px-2 py-0.5 rounded text-xs text-gray-700">
                          {link.anchor}
                        </code>
                        <span className="text-gray-400">→</span>
                        <code className="bg-indigo-50 px-2 py-0.5 rounded text-xs text-indigo-700">
                          {link.target}
                        </code>
                      </div>
                    ))}
                  </div>
                </InfoSection>
              )}

              {brief.cta_suggestion && (
                <InfoSection icon={Target} label="CTA Suggestion">
                  <p className="text-sm text-gray-700">{brief.cta_suggestion}</p>
                </InfoSection>
              )}
            </div>

            {(brief.competitor_weaknesses || brief.tone_notes || brief.llm_notes) && (
              <div className="grid gap-4 lg:grid-cols-3">
                {brief.competitor_weaknesses && (
                  <InfoSection icon={TrendingUp} label="Competitor Weaknesses">
                    <p className="text-sm text-gray-700 whitespace-pre-line">
                      {brief.competitor_weaknesses}
                    </p>
                  </InfoSection>
                )}
                {brief.tone_notes && (
                  <InfoSection icon={FileText} label="Tone Notes">
                    <p className="text-sm text-gray-700 whitespace-pre-line">{brief.tone_notes}</p>
                  </InfoSection>
                )}
                {brief.llm_notes && (
                  <InfoSection icon={Brain} label="LLM / AI Citation Notes">
                    <p className="text-sm text-gray-700 whitespace-pre-line">{brief.llm_notes}</p>
                  </InfoSection>
                )}
              </div>
            )}
          </TabsContent>

          {/* Draft tab */}
          <TabsContent value="draft">
            {isGeneratingDraft ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
                <p className="text-lg font-semibold text-gray-800">Generating draft...</p>
                <p className="text-sm text-gray-400 mt-2">
                  Writing a complete, publish-ready blog post. This may take up to 60 seconds.
                </p>
              </div>
            ) : draft ? (
              <BlogDraftEditor
                draft={draft}
                onQACheck={handleQACheck}
                isQALoading={isQALoading}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Wand2 className="w-12 h-12 text-gray-300 mb-4" />
                <p className="text-lg font-semibold text-gray-700">No draft yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Click &quot;Generate Draft&quot; to create your AI-written blog post.
                </p>
                <Button
                  className="mt-5 gap-2 bg-indigo-600 hover:bg-indigo-700"
                  onClick={handleGenerateDraft}
                >
                  <Wand2 className="w-4 h-4" />
                  Generate Draft
                </Button>
              </div>
            )}
          </TabsContent>

          {/* QA tab */}
          <TabsContent value="qa">
            {qaResult ? (
              <div className="max-w-2xl">
                <ContentQAPanel result={qaResult} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Shield className="w-12 h-12 text-gray-300 mb-4" />
                <p className="text-lg font-semibold text-gray-700">No QA results yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Run a QA check from the Draft tab once your draft is ready.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
