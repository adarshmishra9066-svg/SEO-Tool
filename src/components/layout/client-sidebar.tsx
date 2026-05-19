'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Lightbulb,
  CheckSquare,
  FileText,
  PenTool,
  Link2,
  Globe,
  BarChart2,
  Users,
  FileBarChart,
  CalendarDays,
  History,
  BookOpen,
  Wrench,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  segment: string
  label: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: React.ComponentType<any>
  exact?: boolean
}

const CLIENT_NAV_ITEMS: NavItem[] = [
  { segment: '', label: 'Overview', icon: LayoutDashboard, exact: true },
  { segment: 'opportunities', label: 'Opportunities', icon: Lightbulb },
  { segment: 'tasks', label: 'Tasks', icon: CheckSquare },
  { segment: 'content', label: 'Content QA', icon: FileText },
  { segment: 'blog', label: 'Blog', icon: PenTool },
  { segment: 'internal-links', label: 'Internal Links', icon: Link2 },
  { segment: 'backlinks', label: 'Backlinks', icon: Globe },
  { segment: 'technical', label: 'Technical SEO', icon: Wrench },
  { segment: 'competitors', label: 'Competitors', icon: BarChart2 },
  { segment: 'local-seo', label: 'Local SEO', icon: Users },
  { segment: 'reports', label: 'Reports', icon: FileBarChart },
  { segment: 'calendar', label: 'Calendar', icon: CalendarDays },
  { segment: 'history', label: 'History', icon: History },
  { segment: 'sops', label: 'SOPs', icon: BookOpen },
]

interface ClientSidebarProps {
  clientId: string
  clientName: string
}

export function ClientSidebar({ clientId, clientName }: ClientSidebarProps) {
  const pathname = usePathname()
  const basePath = `/clients/${clientId}`

  return (
    <aside className="w-52 shrink-0 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
      {/* Client name header */}
      <div className="px-4 py-4 border-b border-gray-200">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
          Workspace
        </p>
        <p className="text-sm font-semibold text-gray-900 truncate">{clientName}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {CLIENT_NAV_ITEMS.map(({ segment, label, icon: Icon, exact }) => {
          const href = segment ? `${basePath}/${segment}` : basePath
          const isActive = exact
            ? pathname === basePath
            : pathname.startsWith(`${basePath}/${segment}`)

          return (
            <Link
              key={segment}
              href={href}
              className={cn(
                'flex items-center gap-2.5 mx-2 px-3 py-2 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-indigo-50 text-indigo-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <Icon
                className={cn(
                  'w-3.5 h-3.5 shrink-0',
                  isActive ? 'text-indigo-600' : 'text-gray-400'
                )}
              />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
