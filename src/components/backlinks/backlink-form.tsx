'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function BacklinkForm({ clientId }: { clientId: string }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    website: '', niche: '', domain_authority: '', domain_rating: '',
    estimated_traffic: '', spam_score: '', contact_email: '',
    guest_post_page_url: '', target_page_url: '', anchor_text: '',
    notes: '', risk_level: 'low', price: '',
  })

  function set(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.website) return
    setSaving(true)

    await fetch('/api/backlinks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        website: form.website,
        niche: form.niche || null,
        domain_authority: form.domain_authority ? parseInt(form.domain_authority) : null,
        domain_rating: form.domain_rating ? parseInt(form.domain_rating) : null,
        estimated_traffic: form.estimated_traffic ? parseInt(form.estimated_traffic) : null,
        spam_score: form.spam_score ? parseInt(form.spam_score) : null,
        contact_email: form.contact_email || null,
        guest_post_page_url: form.guest_post_page_url || null,
        target_page_url: form.target_page_url || null,
        anchor_text: form.anchor_text || null,
        notes: form.notes || null,
        risk_level: form.risk_level,
        price: form.price ? parseFloat(form.price) : null,
      }),
    })

    setSaving(false)
    setForm({ website: '', niche: '', domain_authority: '', domain_rating: '', estimated_traffic: '', spam_score: '', contact_email: '', guest_post_page_url: '', target_page_url: '', anchor_text: '', notes: '', risk_level: 'low', price: '' })
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <Label htmlFor="website">Website *</Label>
        <Input id="website" placeholder="example.com" value={form.website} onChange={(e) => set('website', e.target.value)} className="mt-1" required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="niche">Niche</Label>
          <Input id="niche" placeholder="SaaS / Finance" value={form.niche} onChange={(e) => set('niche', e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="da">DA</Label>
          <Input id="da" type="number" placeholder="45" value={form.domain_authority} onChange={(e) => set('domain_authority', e.target.value)} className="mt-1" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="traffic">Est. Traffic</Label>
          <Input id="traffic" type="number" placeholder="5000" value={form.estimated_traffic} onChange={(e) => set('estimated_traffic', e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="spam">Spam Score %</Label>
          <Input id="spam" type="number" min="0" max="100" placeholder="3" value={form.spam_score} onChange={(e) => set('spam_score', e.target.value)} className="mt-1" />
        </div>
      </div>
      <div>
        <Label htmlFor="target">Target Page URL</Label>
        <Input id="target" placeholder="https://client.com/service/x" value={form.target_page_url} onChange={(e) => set('target_page_url', e.target.value)} className="mt-1" />
      </div>
      <div>
        <Label htmlFor="contact">Contact Email</Label>
        <Input id="contact" type="email" placeholder="editor@example.com" value={form.contact_email} onChange={(e) => set('contact_email', e.target.value)} className="mt-1" />
      </div>
      <div>
        <Label htmlFor="risk">Risk Level</Label>
        <select id="risk" value={form.risk_level} onChange={(e) => set('risk_level', e.target.value)} className="mt-1 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Input id="notes" placeholder="Any relevant notes" value={form.notes} onChange={(e) => set('notes', e.target.value)} className="mt-1" />
      </div>
      <Button type="submit" className="w-full" disabled={saving}>{saving ? 'Adding…' : 'Add Prospect'}</Button>
    </form>
  )
}
