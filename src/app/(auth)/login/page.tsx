'use client'

import * as React from 'react'
import { useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react'
import { loginAction, signUpAction } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const signUpSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>
type SignUpFormData = z.infer<typeof signUpSchema>

export default function LoginPage() {
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') ?? '/dashboard'
  const [mode, setMode] = React.useState<'login' | 'signup'>('login')
  const [showPassword, setShowPassword] = React.useState(false)
  const [serverError, setServerError] = React.useState<string | null>(null)
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null)

  const loginForm = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) })
  const signUpForm = useForm<SignUpFormData>({ resolver: zodResolver(signUpSchema) })

  const onLogin = async (data: LoginFormData) => {
    setServerError(null)
    const formData = new FormData()
    formData.append('email', data.email)
    formData.append('password', data.password)
    formData.append('redirectTo', redirectTo)
    const result = await loginAction(formData)
    if (result?.error) setServerError(result.error)
  }

  const onSignUp = async (data: SignUpFormData) => {
    setServerError(null)
    setSuccessMsg(null)
    const formData = new FormData()
    formData.append('email', data.email)
    formData.append('password', data.password)
    formData.append('fullName', data.fullName)
    const result = await signUpAction(formData)
    if (result?.error) setServerError(result.error)
    if (result?.success) setSuccessMsg(result.success)
  }

  const switchMode = (next: 'login' | 'signup') => {
    setMode(next)
    setServerError(null)
    setSuccessMsg(null)
  }

  return (
    <div className="bg-[#16161f] border border-[#2a2a3d] rounded-2xl p-8 shadow-2xl">
      {/* Tabs */}
      <div className="flex rounded-lg bg-[#0e0e17] border border-[#2a2a3d] p-1 mb-6">
        <button
          onClick={() => switchMode('login')}
          className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
            mode === 'login'
              ? 'bg-indigo-600 text-white'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Sign in
        </button>
        <button
          onClick={() => switchMode('signup')}
          className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
            mode === 'signup'
              ? 'bg-indigo-600 text-white'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Sign up
        </button>
      </div>

      <div className="mb-6">
        <h2 className="text-white text-xl font-semibold">
          {mode === 'login' ? 'Welcome back' : 'Create your account'}
        </h2>
        <p className="text-zinc-400 text-sm mt-1">
          {mode === 'login' ? 'Sign in to your agency dashboard' : 'Start managing your SEO clients'}
        </p>
      </div>

      {serverError && (
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-950/50 border border-red-800/50 mb-5">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">{serverError}</p>
        </div>
      )}

      {successMsg && (
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-green-950/50 border border-green-800/50 mb-5">
          <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
          <p className="text-sm text-green-300">{successMsg}</p>
        </div>
      )}

      {mode === 'login' ? (
        <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-zinc-300">Email address</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@agency.com"
              className="bg-[#0e0e17] border-[#2a2a3d] text-white placeholder:text-zinc-600 focus-visible:border-indigo-500"
              {...loginForm.register('email')}
            />
            {loginForm.formState.errors.email && (
              <p className="text-xs text-red-400">{loginForm.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-zinc-300">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                className="bg-[#0e0e17] border-[#2a2a3d] text-white placeholder:text-zinc-600 focus-visible:border-indigo-500 pr-10"
                {...loginForm.register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {loginForm.formState.errors.password && (
              <p className="text-xs text-red-400">{loginForm.formState.errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-medium mt-2"
            loading={loginForm.formState.isSubmitting}
          >
            {loginForm.formState.isSubmitting ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      ) : (
        <form onSubmit={signUpForm.handleSubmit(onSignUp)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="fullName" className="text-zinc-300">Full name</Label>
            <Input
              id="fullName"
              type="text"
              autoComplete="name"
              placeholder="Jane Smith"
              className="bg-[#0e0e17] border-[#2a2a3d] text-white placeholder:text-zinc-600 focus-visible:border-indigo-500"
              {...signUpForm.register('fullName')}
            />
            {signUpForm.formState.errors.fullName && (
              <p className="text-xs text-red-400">{signUpForm.formState.errors.fullName.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="signup-email" className="text-zinc-300">Email address</Label>
            <Input
              id="signup-email"
              type="email"
              autoComplete="email"
              placeholder="you@agency.com"
              className="bg-[#0e0e17] border-[#2a2a3d] text-white placeholder:text-zinc-600 focus-visible:border-indigo-500"
              {...signUpForm.register('email')}
            />
            {signUpForm.formState.errors.email && (
              <p className="text-xs text-red-400">{signUpForm.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="signup-password" className="text-zinc-300">Password</Label>
            <div className="relative">
              <Input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                className="bg-[#0e0e17] border-[#2a2a3d] text-white placeholder:text-zinc-600 focus-visible:border-indigo-500 pr-10"
                {...signUpForm.register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {signUpForm.formState.errors.password && (
              <p className="text-xs text-red-400">{signUpForm.formState.errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-medium mt-2"
            loading={signUpForm.formState.isSubmitting}
          >
            {signUpForm.formState.isSubmitting ? 'Creating account...' : 'Create account'}
          </Button>
        </form>
      )}
    </div>
  )
}
