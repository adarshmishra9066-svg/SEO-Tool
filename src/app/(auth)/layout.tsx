import type { Metadata } from 'next'
import { Zap } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Sign In',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center px-4">
      {/* Background gradient */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.12) 0%, transparent 60%)',
        }}
      />

      {/* Brand mark */}
      <div className="flex flex-col items-center gap-3 mb-8 relative z-10">
        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-500/30">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <div className="text-center">
          <h1 className="text-white text-xl font-bold tracking-tight">SEO Command Centre</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Premium agency SEO operations</p>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-sm">{children}</div>

      <p className="relative z-10 mt-8 text-xs text-zinc-600">
        &copy; {new Date().getFullYear()} SEO Command Centre
      </p>
    </div>
  )
}
