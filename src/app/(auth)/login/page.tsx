'use client'

import * as React from 'react'
import { useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import { loginAction } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') ?? '/dashboard'
  const [showPassword, setShowPassword] = React.useState(false)
  const [serverError, setServerError] = React.useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null)
    const formData = new FormData()
    formData.append('email', data.email)
    formData.append('password', data.password)
    formData.append('redirectTo', redirectTo)

    const result = await loginAction(formData)
    if (result?.error) {
      setServerError(result.error)
    }
  }

  return (
    <div className="bg-[#16161f] border border-[#2a2a3d] rounded-2xl p-8 shadow-2xl">
      <div className="mb-6">
        <h2 className="text-white text-xl font-semibold">Welcome back</h2>
        <p className="text-zinc-400 text-sm mt-1">Sign in to your agency dashboard</p>
      </div>

      {serverError && (
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-950/50 border border-red-800/50 mb-5">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-zinc-300">
            Email address
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@agency.com"
            error={!!errors.email}
            className="bg-[#0e0e17] border-[#2a2a3d] text-white placeholder:text-zinc-600 focus-visible:border-indigo-500"
            {...register('email')}
          />
          {errors.email && (
            <p className="text-xs text-red-400">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-zinc-300">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              error={!!errors.password}
              className="bg-[#0e0e17] border-[#2a2a3d] text-white placeholder:text-zinc-600 focus-visible:border-indigo-500 pr-10"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-400">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-medium mt-2"
          loading={isSubmitting}
        >
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>

      <div className="mt-6 pt-5 border-t border-[#2a2a3d]">
        <p className="text-center text-xs text-zinc-500">
          Don&apos;t have an account?{' '}
          <a
            href="mailto:hello@seocommandcentre.com"
            className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            Contact us
          </a>
        </p>
      </div>
    </div>
  )
}
