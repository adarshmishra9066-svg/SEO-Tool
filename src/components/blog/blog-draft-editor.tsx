'use client'

import * as React from 'react'
import { Copy, CheckCircle, Loader2, Wand2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import type { BlogDraft } from '@/lib/database.types'

interface ScoreBarProps {
  label: string
  score: number
  invert?: boolean
}

function ScoreBar({ label, score, invert = false }: ScoreBarProps) {
  const display = invert ? 100 - score : score
  const color =
    display >= 75
      ? 'bg-green-500'
      : display >= 50
        ? 'bg-amber-500'
        : display >= 25
          ? 'bg-orange-500'
          : 'bg-red-500'

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold text-gray-800">{score}</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
    </div>
  )
}

interface BlogDraftEditorProps {
  draft: BlogDraft
  onQACheck?: (content: string) => void
  isQALoading?: boolean
  onChange?: (updated: Partial<BlogDraft>) => void
}

export function BlogDraftEditor({
  draft,
  onQACheck,
  isQALoading = false,
  onChange,
}: BlogDraftEditorProps) {
  const { toast } = useToast()
  const [seoTitle, setSeoTitle] = React.useState(draft.seo_title ?? '')
  const [metaDescription, setMetaDescription] = React.useState(draft.meta_description ?? '')
  const [urlSlug, setUrlSlug] = React.useState(draft.url_slug ?? '')
  const [content, setContent] = React.useState(draft.content ?? '')
  const [faqSection, setFaqSection] = React.useState(draft.faq_section ?? '')
  const [copied, setCopied] = React.useState(false)

  function handleCopyAll() {
    const fullText = [
      `META TITLE: ${seoTitle}`,
      `META DESCRIPTION: ${metaDescription}`,
      `URL SLUG: ${urlSlug}`,
      '',
      '---',
      '',
      content,
      '',
      faqSection,
    ]
      .filter(Boolean)
      .join('\n')

    navigator.clipboard.writeText(fullText).then(() => {
      setCopied(true)
      toast({ title: 'Copied to clipboard', description: 'Full draft content copied.' })
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleRunQA() {
    const fullContent = [content, faqSection].filter(Boolean).join('\n\n')
    onQACheck?.(fullContent)
  }

  function notifyChange(field: keyof BlogDraft, value: string) {
    onChange?.({ [field]: value } as Partial<BlogDraft>)
  }

  return (
    <div className="space-y-6">
      {/* Score indicators */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Content Scores</h3>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-5 sm:gap-y-0">
          <ScoreBar label="SEO" score={draft.seo_score ?? 0} />
          <ScoreBar label="E-E-A-T" score={draft.eeat_score ?? 0} />
          <ScoreBar label="AEO" score={draft.aeo_score ?? 0} />
          <ScoreBar label="Human Quality" score={draft.human_quality_score ?? 0} />
          <ScoreBar label="AI Risk" score={draft.ai_risk_score ?? 0} invert />
        </div>
      </div>

      {/* Meta fields */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
        <h3 className="text-sm font-semibold text-gray-800">Meta & SEO Fields</h3>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="seo-title">SEO Title</Label>
            <span
              className={`text-xs ${seoTitle.length > 60 ? 'text-red-500' : 'text-gray-400'}`}
            >
              {seoTitle.length}/60
            </span>
          </div>
          <Input
            id="seo-title"
            value={seoTitle}
            onChange={(e) => {
              setSeoTitle(e.target.value)
              notifyChange('seo_title', e.target.value)
            }}
            placeholder="SEO-optimised page title..."
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="meta-desc">Meta Description</Label>
            <span
              className={`text-xs ${metaDescription.length > 155 ? 'text-red-500' : 'text-gray-400'}`}
            >
              {metaDescription.length}/155
            </span>
          </div>
          <Textarea
            id="meta-desc"
            value={metaDescription}
            onChange={(e) => {
              setMetaDescription(e.target.value)
              notifyChange('meta_description', e.target.value)
            }}
            placeholder="Compelling meta description..."
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="url-slug">URL Slug</Label>
          <Input
            id="url-slug"
            value={urlSlug}
            onChange={(e) => {
              setUrlSlug(e.target.value)
              notifyChange('url_slug', e.target.value)
            }}
            placeholder="url-friendly-slug"
            className="font-mono text-sm"
          />
        </div>
      </div>

      {/* Main content */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-semibold text-gray-800">Article Content</h3>
        <Textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value)
            notifyChange('content', e.target.value)
          }}
          placeholder="Article content in Markdown..."
          rows={24}
          className="font-mono text-sm resize-y"
        />
        <p className="text-xs text-gray-400">
          {content.split(/\s+/).filter(Boolean).length} words — Use ## for H2, ### for H3, [LINK:
          anchor → /url] for internal links
        </p>
      </div>

      {/* FAQ section */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-semibold text-gray-800">FAQ Section</h3>
        <Textarea
          value={faqSection}
          onChange={(e) => {
            setFaqSection(e.target.value)
            notifyChange('faq_section', e.target.value)
          }}
          placeholder="## FAQ&#10;&#10;### Question?&#10;Answer..."
          rows={10}
          className="font-mono text-sm resize-y"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {onQACheck && (
          <Button
            onClick={handleRunQA}
            disabled={isQALoading || !content}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700"
          >
            {isQALoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Wand2 className="w-4 h-4" />
            )}
            {isQALoading ? 'Running QA...' : 'Run QA Check'}
          </Button>
        )}

        <Button variant="outline" onClick={handleCopyAll} className="gap-2">
          {copied ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy All'}
        </Button>
      </div>
    </div>
  )
}
