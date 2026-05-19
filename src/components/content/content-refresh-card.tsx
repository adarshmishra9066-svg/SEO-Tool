import Link from 'next/link'
import { TrendingDown, TrendingUp, Minus, ExternalLink, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { formatDate, truncate } from '@/lib/utils'

export interface ContentRefreshItem {
  url: string
  title: string | null
  last_published: string | null
  current_position: number | null
  prev_position: number | null
  current_clicks: number
  prev_clicks: number
  current_impressions: number
  prev_impressions: number
  refresh_priority: 'high' | 'medium' | 'low'
  what_to_update: string[]
}

interface TrendIndicatorProps {
  current: number
  prev: number
  label: string
  isPosition?: boolean
}

function TrendIndicator({ current, prev, label, isPosition = false }: TrendIndicatorProps) {
  const diff = current - prev
  const improved = isPosition ? diff < 0 : diff > 0
  const declined = isPosition ? diff > 0 : diff < 0
  const pct = prev !== 0 ? Math.round((Math.abs(diff) / prev) * 100) : 0

  return (
    <div className="flex flex-col items-center">
      <span className="text-xs text-gray-400 mb-1">{label}</span>
      <span className="font-semibold text-sm text-gray-900">
        {isPosition ? current?.toFixed(1) : current?.toLocaleString()}
      </span>
      {diff !== 0 && (
        <div className="flex items-center gap-0.5 mt-0.5">
          {improved ? (
            <TrendingUp className="w-3 h-3 text-green-500" />
          ) : declined ? (
            <TrendingDown className="w-3 h-3 text-red-500" />
          ) : (
            <Minus className="w-3 h-3 text-gray-400" />
          )}
          <span
            className={`text-xs ${improved ? 'text-green-600' : declined ? 'text-red-600' : 'text-gray-400'}`}
          >
            {pct}%
          </span>
        </div>
      )}
    </div>
  )
}

interface ContentRefreshCardProps {
  item: ContentRefreshItem
  onCreateTask?: (item: ContentRefreshItem) => void
}

export function ContentRefreshCard({ item, onCreateTask }: ContentRefreshCardProps) {
  const priorityVariant =
    item.refresh_priority === 'high'
      ? 'danger'
      : item.refresh_priority === 'medium'
        ? 'warning'
        : 'secondary'

  return (
    <Card className="flex flex-col hover:shadow-md transition-shadow">
      <CardContent className="flex-1 pt-5 pb-3 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p
              className="text-xs text-indigo-600 font-mono truncate"
              title={item.url}
            >
              {truncate(item.url, 50)}
            </p>
            {item.title && (
              <p className="text-sm font-semibold text-gray-900 mt-0.5 line-clamp-2">
                {item.title}
              </p>
            )}
          </div>
          <Badge variant={priorityVariant} className="shrink-0">
            {item.refresh_priority.charAt(0).toUpperCase() + item.refresh_priority.slice(1)} Priority
          </Badge>
        </div>

        {/* Last published */}
        {item.last_published && (
          <p className="text-xs text-gray-400">
            Last published: {formatDate(item.last_published)}
          </p>
        )}

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-2 bg-gray-50 rounded-lg p-3">
          {item.current_position !== null && (
            <TrendIndicator
              current={item.current_position}
              prev={item.prev_position ?? item.current_position}
              label="Position"
              isPosition
            />
          )}
          <TrendIndicator
            current={item.current_clicks}
            prev={item.prev_clicks}
            label="Clicks"
          />
          <TrendIndicator
            current={item.current_impressions}
            prev={item.prev_impressions}
            label="Impressions"
          />
        </div>

        {/* What to update */}
        {item.what_to_update.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2">What to update:</p>
            <ul className="space-y-1">
              {item.what_to_update.map((item_text, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600">
                  <RefreshCw className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                  {item_text}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0 pb-4 flex gap-2">
        <Button
          size="sm"
          className="flex-1 bg-indigo-600 hover:bg-indigo-700"
          onClick={() => onCreateTask?.(item)}
        >
          Create Refresh Task
        </Button>
        <Button size="sm" variant="outline" asChild>
          <Link href={item.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
