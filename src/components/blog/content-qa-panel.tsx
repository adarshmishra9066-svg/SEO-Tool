'use client'

import * as React from 'react'
import { Bot, AlertTriangle, ShieldAlert, Tag, FileText, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface QAIssue {
  type: 'ai_language' | 'generic_phrase' | 'missing_eeat' | 'keyword_stuffing' | 'thin_content'
  text: string
  fix: string
}

export interface QAResult {
  overall_score: number
  seo_score: number
  eeat_score: number
  aeo_score: number
  human_quality_score: number
  ai_detection_risk: number
  issues: QAIssue[]
  verdict: string
}

interface CircleScoreProps {
  label: string
  score: number
  invert?: boolean
  size?: 'sm' | 'md'
}

function CircleScore({ label, score, invert = false, size = 'md' }: CircleScoreProps) {
  const effective = invert ? 100 - score : score
  const color =
    effective >= 75
      ? 'text-green-600'
      : effective >= 50
        ? 'text-amber-600'
        : effective >= 25
          ? 'text-orange-600'
          : 'text-red-600'

  const bgColor =
    effective >= 75
      ? 'bg-green-50 border-green-200'
      : effective >= 50
        ? 'bg-amber-50 border-amber-200'
        : effective >= 25
          ? 'bg-orange-50 border-orange-200'
          : 'bg-red-50 border-red-200'

  const dim = size === 'sm' ? 'w-14 h-14' : 'w-16 h-16'
  const textSize = size === 'sm' ? 'text-lg' : 'text-xl'

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={cn(
          'rounded-full border-2 flex items-center justify-center',
          dim,
          bgColor,
          color
        )}
      >
        <span className={cn('font-bold', textSize)}>{score}</span>
      </div>
      <span className="text-xs text-gray-500 text-center leading-tight max-w-[60px]">{label}</span>
    </div>
  )
}

const ISSUE_CONFIG: Record<
  QAIssue['type'],
  { icon: React.ElementType; label: string; color: string; bgColor: string }
> = {
  ai_language: {
    icon: Bot,
    label: 'AI Language',
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-100',
  },
  generic_phrase: {
    icon: AlertTriangle,
    label: 'Generic Phrase',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 border-orange-100',
  },
  missing_eeat: {
    icon: ShieldAlert,
    label: 'Missing E-E-A-T',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 border-amber-100',
  },
  keyword_stuffing: {
    icon: Tag,
    label: 'Keyword Stuffing',
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-100',
  },
  thin_content: {
    icon: FileText,
    label: 'Thin Content',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 border-orange-100',
  },
}

interface ContentQAPanelProps {
  result: QAResult
  onApplyFix?: (issue: QAIssue) => void
}

export function ContentQAPanel({ result, onApplyFix }: ContentQAPanelProps) {
  const isPublishReady = result.overall_score >= 80
  const needsWork = result.overall_score < 60

  return (
    <div className="space-y-5">
      {/* Overall verdict */}
      <div
        className={cn(
          'rounded-xl border p-4 flex items-start gap-3',
          isPublishReady
            ? 'bg-green-50 border-green-200'
            : needsWork
              ? 'bg-red-50 border-red-200'
              : 'bg-amber-50 border-amber-200'
        )}
      >
        {isPublishReady ? (
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
        ) : (
          <XCircle
            className={cn(
              'w-5 h-5 shrink-0 mt-0.5',
              needsWork ? 'text-red-600' : 'text-amber-600'
            )}
          />
        )}
        <div>
          <p
            className={cn(
              'font-semibold text-sm',
              isPublishReady ? 'text-green-800' : needsWork ? 'text-red-800' : 'text-amber-800'
            )}
          >
            Overall Score: {result.overall_score}/100
          </p>
          <p
            className={cn(
              'text-sm mt-0.5',
              isPublishReady ? 'text-green-700' : needsWork ? 'text-red-700' : 'text-amber-700'
            )}
          >
            {result.verdict}
          </p>
        </div>
      </div>

      {/* Score breakdown */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-gray-800 mb-4">Score Breakdown</h4>
        <div className="flex items-center justify-around gap-2 flex-wrap">
          <CircleScore label="SEO" score={result.seo_score} />
          <CircleScore label="E-E-A-T" score={result.eeat_score} />
          <CircleScore label="AEO" score={result.aeo_score} />
          <CircleScore label="Human Quality" score={result.human_quality_score} />
          <CircleScore label="AI Risk" score={result.ai_detection_risk} invert />
        </div>
      </div>

      {/* Issues list */}
      {result.issues.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-800">
            Issues Found ({result.issues.length})
          </h4>
          {result.issues.map((issue, idx) => {
            const config = ISSUE_CONFIG[issue.type]
            const Icon = config.icon
            return (
              <div
                key={idx}
                className={cn('rounded-xl border p-4 space-y-2', config.bgColor)}
              >
                <div className="flex items-center gap-2">
                  <Icon className={cn('w-4 h-4 shrink-0', config.color)} />
                  <span className={cn('text-xs font-semibold uppercase tracking-wide', config.color)}>
                    {config.label}
                  </span>
                </div>
                <p className="text-sm text-gray-700 italic line-clamp-2">&ldquo;{issue.text}&rdquo;</p>
                <div className="bg-white/70 rounded-lg px-3 py-2">
                  <p className="text-xs text-gray-600">
                    <span className="font-medium text-gray-800">Fix: </span>
                    {issue.fix}
                  </p>
                </div>
                {onApplyFix && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7"
                    onClick={() => onApplyFix(issue)}
                  >
                    Apply Fix
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {result.issues.length === 0 && (
        <div className="text-center py-8 text-gray-400 text-sm">
          <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-400" />
          No issues found — content looks great!
        </div>
      )}
    </div>
  )
}
