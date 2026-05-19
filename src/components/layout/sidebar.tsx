'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  Calendar,
  BookOpen,
  Settings,
  Zap,
  LogOut,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { createClient } from '@/lib/supabase/client'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/sops', label: 'SOPs', icon: BookOpen },
  { href: '/settings', label: 'Settings', icon: Settings },
] as const

interface SidebarProps {
  user?: {
    email?: string
    user_metadata?: { full_name?: string; avatar_url?: string }
  } | null
  clientCount?: number
}

export function Sidebar({ user, clientCount = 0 }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const displayName =
    user?.user_metadata?.full_name ??
    user?.email?.split('@')[0] ??
    'User'

  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <aside className="flex flex-col h-full w-64 bg-[#111118] border-r border-[#1f1f2e] select-none">
      {/* Logo / Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-[#1f1f2e]">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 shadow-lg shadow-indigo-500/30">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-white text-sm font-semibold leading-tight tracking-tight">
            SEO Command
          </span>
          <span className="text-indigo-400 text-xs font-medium">Centre</span>
        </div>
      </div>

      {/* Client count pill */}
      {clientCount > 0 && (
        <div className="px-5 pt-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1a1a2e] border border-[#2d2d4e]">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-zinc-400">
              {clientCount} active client{clientCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto sidebar-scroll">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(href)

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-indigo-600/15 text-white border-l-[3px] border-indigo-500 pl-[9px]'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5 border-l-[3px] border-transparent pl-[9px]'
              )}
            >
              <Icon
                className={cn(
                  'w-4 h-4 shrink-0',
                  isActive ? 'text-indigo-400' : 'text-zinc-500'
                )}
              />
              <span className="flex-1">{label}</span>
              {isActive && (
                <ChevronRight className="w-3 h-3 text-indigo-400 opacity-60" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="px-3 pb-4 border-t border-[#1f1f2e] pt-4">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
          <Avatar className="w-8 h-8 shrink-0">
            {user?.user_metadata?.avatar_url && (
              <AvatarImage src={user.user_metadata.avatar_url} alt={displayName} />
            )}
            <AvatarFallback className="text-xs bg-indigo-600">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{displayName}</p>
            <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-colors"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  )
}
