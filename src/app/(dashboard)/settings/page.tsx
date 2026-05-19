'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Settings, Key, Users, Building2, BookOpen } from 'lucide-react'

export default function SettingsPage() {
  const [agencyName, setAgencyName] = useState('')
  const [anthropicKey, setAnthropicKey] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setSaving(true)
    // In production this would update agency settings via API
    await new Promise((r) => setTimeout(r, 800))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="p-6 space-y-8 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your agency profile and integrations.</p>
      </div>

      {/* Agency Profile */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div className="flex items-center gap-3">
          <Building2 className="w-5 h-5 text-indigo-600" />
          <h2 className="font-semibold text-gray-900">Agency Profile</h2>
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="agency-name">Agency Name</Label>
            <Input
              id="agency-name"
              value={agencyName}
              onChange={(e) => setAgencyName(e.target.value)}
              placeholder="Your Agency Name"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="logo-url">Logo URL</Label>
            <Input id="logo-url" placeholder="https://yoursite.com/logo.png" className="mt-1" />
          </div>
        </div>
      </section>

      {/* API Keys */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div className="flex items-center gap-3">
          <Key className="w-5 h-5 text-indigo-600" />
          <h2 className="font-semibold text-gray-900">API Keys</h2>
        </div>
        <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          API keys are stored as environment variables on your server. Never expose them in client-side code.
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="anthropic-key">Anthropic API Key</Label>
            <p className="text-xs text-gray-500 mt-0.5 mb-1">
              Used for blog generation, QA checking, and opportunity analysis. Set{' '}
              <code className="bg-gray-100 px-1 rounded">ANTHROPIC_API_KEY</code> in your .env file.
            </p>
            <Input
              id="anthropic-key"
              type="password"
              value={anthropicKey}
              onChange={(e) => setAnthropicKey(e.target.value)}
              placeholder="sk-ant-..."
              className="mt-1 font-mono text-sm"
            />
          </div>
          <div>
            <Label htmlFor="supabase-url">Supabase URL</Label>
            <p className="text-xs text-gray-500 mt-0.5 mb-1">
              Set <code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code> in your .env file.
            </p>
            <Input id="supabase-url" placeholder="https://xxx.supabase.co" className="mt-1 font-mono text-sm" disabled />
          </div>
        </div>
      </section>

      {/* Team (placeholder) */}
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-5 h-5 text-indigo-600" />
          <h2 className="font-semibold text-gray-900">Team</h2>
          <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Coming soon</span>
        </div>
        <p className="text-sm text-gray-500">
          Invite team members, assign tasks, and control access per client. Multi-user support is planned for the next release.
        </p>
      </section>

      {/* SOP Library */}
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          <h2 className="font-semibold text-gray-900">SOP Library</h2>
        </div>
        <p className="text-sm text-gray-500 mb-3">
          View and manage your Standard Operating Procedures. Built-in SOPs cover the most common SEO workflows.
        </p>
        <a
          href="/sops"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          Open SOP Library →
        </a>
      </section>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save Changes'}
        </Button>
        {saved && <span className="text-sm text-green-600 font-medium">Saved successfully</span>}
      </div>
    </div>
  )
}
