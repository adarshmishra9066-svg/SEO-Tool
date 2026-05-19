import * as React from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface HeaderProps {
  title: string
  breadcrumbs?: BreadcrumbItem[]
  actions?: React.ReactNode
  description?: string
  className?: string
}

export function Header({ title, breadcrumbs, actions, description, className }: HeaderProps) {
  return (
    <header
      className={cn(
        'flex items-start justify-between gap-4 px-6 py-5 bg-white border-b border-gray-200',
        className
      )}
    >
      <div className="flex flex-col gap-1 min-w-0">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1 text-xs text-gray-500 mb-0.5">
            {breadcrumbs.map((crumb, i) => (
              <React.Fragment key={i}>
                {i > 0 && <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="hover:text-indigo-600 transition-colors truncate"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-gray-400 truncate">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
        {/* Title */}
        <h1 className="text-xl font-semibold text-gray-900 tracking-tight truncate">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-gray-500 mt-0.5">{description}</p>
        )}
      </div>

      {/* Actions slot */}
      {actions && (
        <div className="flex items-center gap-2 shrink-0 pt-0.5">{actions}</div>
      )}
    </header>
  )
}
