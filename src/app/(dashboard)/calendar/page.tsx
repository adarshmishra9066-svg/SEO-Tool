import { createClient } from '@/lib/supabase/server'
import CalendarView from '@/components/calendar/calendar-view'

export default async function CalendarPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: agency } = await supabase
    .from('agencies')
    .select('id')
    .eq('owner_id', user?.id ?? '')
    .single()

  const [{ data: items }, { data: clients }] = await Promise.all([
    agency
      ? supabase
          .from('calendar_items')
          .select('*, clients(name)')
          .eq('agency_id', agency.id)
          .order('due_date', { ascending: true })
      : Promise.resolve({ data: [] }),
    agency
      ? supabase
          .from('clients')
          .select('id, name')
          .eq('agency_id', agency.id)
          .eq('client_status', 'active')
      : Promise.resolve({ data: [] }),
  ])

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">SEO Calendar</h1>
        <p className="text-sm text-gray-500 mt-1">
          Blogs, reports, backlink follow-ups, and recurring SEO tasks across all clients.
        </p>
      </div>
      <CalendarView
        items={items ?? []}
        clients={clients ?? []}
        agencyId={agency?.id ?? ''}
      />
    </div>
  )
}
