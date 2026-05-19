'use client'

import { useState } from 'react'
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  startOfWeek, endOfWeek, isSameMonth, isToday, isSameDay, parseISO,
} from 'date-fns'
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react'
import { cn, truncate } from '@/lib/utils'
import CalendarEvent from './calendar-event'
import { Button } from '@/components/ui/button'

type CalendarItem = {
  id: string
  title: string
  due_date: string
  item_type: string | null
  description: string | null
  status: string
  client_id: string | null
  clients?: { name: string } | null
}

type Client = { id: string; name: string }

export default function CalendarView({
  items,
  clients,
  agencyId,
}: {
  items: CalendarItem[]
  clients: Client[]
  agencyId: string
}) {
  const [current, setCurrent] = useState(new Date())
  const [selected, setSelected] = useState<CalendarItem | null>(null)
  const [adding, setAdding] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: '', item_type: 'blog', due_date: '', client_id: '', description: '',
  })

  const monthStart = startOfMonth(current)
  const monthEnd = endOfMonth(current)
  const calStart = startOfWeek(monthStart)
  const calEnd = endOfWeek(monthEnd)
  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  function prevMonth() { setCurrent((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1)) }
  function nextMonth() { setCurrent((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1)) }

  function getEventsForDay(day: Date) {
    return items.filter((item) => isSameDay(parseISO(item.due_date), day))
  }

  async function addEvent() {
    if (!newEvent.title || !newEvent.due_date) return
    await fetch('/api/calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newEvent.title,
        item_type: newEvent.item_type,
        due_date: newEvent.due_date,
        client_id: newEvent.client_id || null,
        description: newEvent.description || null,
      }),
    })
    window.location.reload()
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">
            {format(current, 'MMMM yyyy')}
          </h2>
          <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        <Button size="sm" onClick={() => setAdding(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Event
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar grid */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-gray-200">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="py-2 text-center text-xs font-medium text-gray-500">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7">
            {days.map((day, i) => {
              const events = getEventsForDay(day)
              const inMonth = isSameMonth(day, current)
              const today = isToday(day)
              return (
                <div
                  key={i}
                  className={cn(
                    'min-h-[80px] p-1.5 border-b border-r border-gray-100',
                    !inMonth && 'bg-gray-50',
                    today && 'bg-indigo-50'
                  )}
                >
                  <div className={cn(
                    'text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full',
                    today ? 'bg-indigo-600 text-white' : inMonth ? 'text-gray-700' : 'text-gray-300'
                  )}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-0.5">
                    {events.slice(0, 3).map((ev) => (
                      <CalendarEvent
                        key={ev.id}
                        title={ev.title}
                        type={ev.item_type}
                        clientName={ev.clients?.name}
                        onClick={() => setSelected(ev)}
                      />
                    ))}
                    {events.length > 3 && (
                      <div className="text-xs text-gray-400 px-1">+{events.length - 3} more</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Sidebar: upcoming events */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 text-sm">Upcoming</h3>
          <div className="space-y-2">
            {items
              .filter((item) => parseISO(item.due_date) >= new Date())
              .slice(0, 10)
              .map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelected(item)}
                  className="w-full text-left bg-white rounded-lg border border-gray-200 p-3 hover:shadow-sm transition-shadow"
                >
                  <div className="text-xs font-medium text-gray-900">{truncate(item.title, 40)}</div>
                  {item.clients?.name && (
                    <div className="text-xs text-gray-400 mt-0.5">{item.clients.name}</div>
                  )}
                  <div className="text-xs text-indigo-600 mt-1">
                    {format(parseISO(item.due_date), 'MMM d')}
                  </div>
                </button>
              ))}
            {items.filter((i) => parseISO(i.due_date) >= new Date()).length === 0 && (
              <p className="text-xs text-gray-400">No upcoming events. Add one to get started.</p>
            )}
          </div>
        </div>
      </div>

      {/* Event detail panel */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-gray-900">{selected.title}</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            {selected.clients?.name && (
              <div className="text-sm text-gray-500 mb-1">Client: {selected.clients.name}</div>
            )}
            <div className="text-sm text-gray-500 mb-1">
              Due: {format(parseISO(selected.due_date), 'MMMM d, yyyy')}
            </div>
            {selected.item_type && (
              <div className="text-sm text-gray-500 mb-2">Type: {selected.item_type}</div>
            )}
            {selected.description && (
              <p className="text-sm text-gray-700 mt-2">{selected.description}</p>
            )}
          </div>
        </div>
      )}

      {/* Add event dialog */}
      {adding && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Add Calendar Event</h3>
              <button onClick={() => setAdding(false)}><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <input
                placeholder="Event title *"
                value={newEvent.title}
                onChange={(e) => setNewEvent((f) => ({ ...f, title: e.target.value }))}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="date"
                value={newEvent.due_date}
                onChange={(e) => setNewEvent((f) => ({ ...f, due_date: e.target.value }))}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <select
                value={newEvent.item_type}
                onChange={(e) => setNewEvent((f) => ({ ...f, item_type: e.target.value }))}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {['blog', 'report', 'backlink', 'technical', 'audit', 'outreach'].map((t) => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
              <select
                value={newEvent.client_id}
                onChange={(e) => setNewEvent((f) => ({ ...f, client_id: e.target.value }))}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All clients</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <div className="flex gap-2 pt-1">
                <Button onClick={addEvent} className="flex-1" disabled={!newEvent.title || !newEvent.due_date}>
                  Add Event
                </Button>
                <Button variant="outline" onClick={() => setAdding(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
