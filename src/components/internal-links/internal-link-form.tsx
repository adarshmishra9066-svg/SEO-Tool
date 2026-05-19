'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function InternalLinkForm({ clientId }: { clientId: string }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    source_page_url: '',
    target_page_url: '',
    suggested_anchor_text: '',
    reason: '',
    priority: 'medium',
  })

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.source_page_url || !form.target_page_url) return
    setSaving(true)

    await fetch('/api/internal-links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: clientId, ...form }),
    })

    setSaving(false)
    setForm({ source_page_url: '', target_page_url: '', suggested_anchor_text: '', reason: '', priority: 'medium' })
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <Label htmlFor="source">Source Page URL</Label>
        <Input
          id="source"
          placeholder="https://site.com/blog/post"
          value={form.source_page_url}
          onChange={(e) => set('source_page_url', e.target.value)}
          className="mt-1"
          required
        />
      </div>
      <div>
        <Label htmlFor="target">Target Page URL</Label>
        <Input
          id="target"
          placeholder="https://site.com/service/x"
          value={form.target_page_url}
          onChange={(e) => set('target_page_url', e.target.value)}
          className="mt-1"
          required
        />
      </div>
      <div>
        <Label htmlFor="anchor">Suggested Anchor Text</Label>
        <Input
          id="anchor"
          placeholder='e.g. "accounting services London"'
          value={form.suggested_anchor_text}
          onChange={(e) => set('suggested_anchor_text', e.target.value)}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="reason">Reason</Label>
        <Input
          id="reason"
          placeholder="Why this link helps"
          value={form.reason}
          onChange={(e) => set('reason', e.target.value)}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="prio">Priority</Label>
        <select
          id="prio"
          value={form.priority}
          onChange={(e) => set('priority', e.target.value)}
          className="mt-1 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      <Button type="submit" className="w-full" disabled={saving}>
        {saving ? 'Adding…' : 'Add Suggestion'}
      </Button>
    </form>
  )
}
