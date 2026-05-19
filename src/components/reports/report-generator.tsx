'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FileText, Loader2 } from 'lucide-react'

export default function ReportGenerator({
  clientId,
  clientName,
  buttonLabel = 'Generate Report',
}: {
  clientId: string
  clientName: string
  buttonLabel?: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    period_start: '',
    period_end: '',
    report_type: 'monthly',
  })

  function set(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })) }

  async function generate() {
    if (!form.period_start || !form.period_end) return
    setLoading(true)

    const res = await fetch('/api/reports/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: clientId, ...form }),
    })

    const data = await res.json()
    setLoading(false)
    setOpen(false)
    router.push(`/clients/${clientId}/reports/${data.report?.id}`)
    router.refresh()
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="flex items-center gap-2">
        <FileText className="w-4 h-4" />
        {buttonLabel}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Report — {clientName}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <p className="text-sm text-gray-500">
              This will pull GSC data, completed tasks, and backlinks for the period and generate a plain-English report using AI.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start">Period Start</Label>
                <input
                  id="start"
                  type="date"
                  value={form.period_start}
                  onChange={(e) => set('period_start', e.target.value)}
                  className="mt-1 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <Label htmlFor="end">Period End</Label>
                <input
                  id="end"
                  type="date"
                  value={form.period_end}
                  onChange={(e) => set('period_end', e.target.value)}
                  className="mt-1 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="type">Report Type</Label>
              <select
                id="type"
                value={form.report_type}
                onChange={(e) => set('report_type', e.target.value)}
                className="mt-1 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={generate} disabled={loading || !form.period_start || !form.period_end} className="flex-1">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating…
                  </span>
                ) : (
                  'Generate'
                )}
              </Button>
              <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
