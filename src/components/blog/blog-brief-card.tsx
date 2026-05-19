import Link from 'next/link'
import { FileText, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'
import type { BlogBrief } from '@/lib/database.types'

interface BlogBriefCardProps {
  brief: BlogBrief
  clientId: string
  onGenerateDraft?: (briefId: string) => void
}

function getStatusVariant(
  status: BlogBrief['status']
): 'secondary' | 'warning' | 'blue' | 'success' {
  switch (status) {
    case 'draft':
      return 'secondary'
    case 'approved':
      return 'blue'
    case 'in_progress':
      return 'warning'
    case 'published':
      return 'success'
    default:
      return 'secondary'
  }
}

function getFunnelColor(stage: string | null): string {
  switch (stage) {
    case 'top':
      return 'text-blue-700 bg-blue-50 border-blue-200'
    case 'middle':
      return 'text-amber-700 bg-amber-50 border-amber-200'
    case 'bottom':
      return 'text-green-700 bg-green-50 border-green-200'
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

export function BlogBriefCard({ brief, clientId, onGenerateDraft }: BlogBriefCardProps) {
  const statusLabel =
    brief.status === 'in_progress'
      ? 'In Progress'
      : brief.status.charAt(0).toUpperCase() + brief.status.slice(1)

  return (
    <Card className="flex flex-col hover:shadow-md transition-shadow">
      <CardContent className="flex-1 pt-5 pb-3">
        <div className="flex items-start justify-between gap-2 mb-3">
          <Badge variant={getStatusVariant(brief.status)}>{statusLabel}</Badge>
          {brief.funnel_stage && (
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${getFunnelColor(brief.funnel_stage)}`}
            >
              {brief.funnel_stage.charAt(0).toUpperCase() + brief.funnel_stage.slice(1)}-of-Funnel
            </span>
          )}
        </div>

        <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-2 line-clamp-2">
          {brief.title}
        </h3>

        {brief.primary_keyword && (
          <div className="mb-3">
            <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-xs font-medium text-indigo-700">
              <FileText className="w-3 h-3" />
              {brief.primary_keyword}
            </span>
          </div>
        )}

        <div className="space-y-1 text-xs text-gray-500">
          {brief.recommended_word_count && (
            <div className="flex items-center justify-between">
              <span>Target word count</span>
              <span className="font-medium text-gray-700">
                {brief.recommended_word_count.toLocaleString()} words
              </span>
            </div>
          )}
          {brief.search_intent && (
            <div className="flex items-center justify-between">
              <span>Search intent</span>
              <span className="font-medium text-gray-700 capitalize">{brief.search_intent}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span>Created</span>
            <span className="font-medium text-gray-700">{formatDate(brief.created_at)}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0 pb-4 flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" asChild>
          <Link href={`/clients/${clientId}/blog/${brief.id}`}>View Brief</Link>
        </Button>
        {brief.status !== 'published' && onGenerateDraft && (
          <Button
            size="sm"
            variant="ghost"
            className="shrink-0 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
            onClick={() => onGenerateDraft(brief.id)}
            title="Generate Draft"
          >
            <Zap className="w-4 h-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
