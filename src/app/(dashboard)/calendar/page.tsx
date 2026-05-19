import { createClient } from '@/lib/supabase/server'
import CalendarView from '@/components/calendar/calendar-view'
import type { CalendarItem } from '@/lib/database.types'

export default async function CalendarPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: rawAgency } = await supabase
    .from('agencies')
    .select('id')
    .eq('owner_id', user?.id ?? '')
    .single()
  const agency = rawAgency as { id: string } | null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const [{ data: items }, { data: clients }] = await Promise.all([
    agency
      ? db
          .from('calendar_items')
          .select('*, clients(name)')
          .eq('agency_id', agency.id)
          .order('due_date', { ascending: true })
      : Promise.resolve({ data: [] }),
    agency
      ? db
          .from('clients')
          .select('id, name')
          .eq('agency_id', agency.id)
          .eq('client_status', 'active')
      : Promise.resolve({ data: [] }),
  ])

  const safeItems = (items ?? []) as CalendarItem[]
  const safeClients = (clients ?? []) as { id: string; name: string }[]

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">SEO Calendar</h1>
        <p className="text-sm text-gray-500 mt-1">
          Blogs, reports, backlink follow-ups, and recurring SEO tasks across all clients.
        </p>
      </div>
      <CalendarView
        items={safeItems}
        clients={safeClients}
        agencyId={agency?.id ?? ''}
      />
    </div>
  )
}
