import { useState } from 'react';
import { useEvents } from '../../context/EventsContext';
import { useToast } from '../../context/ToastContext';
import { formatDate, formatTime, getEventStart, hasEnded } from '../../utils/dates';
import Modal from '../Modal';
import Icon from '../Icon';
import EmptyState from '../EmptyState';
import EventForm from './EventForm';

/** Admin tab: list, create, edit and delete events. */
export default function EventManager() {
  const { events, clubs, allTickets, addEvent, updateEvent, deleteEvent } = useEvents();
  const toast = useToast();
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState(null); // null | 'new' | event object

  const clubName = (id) => clubs.find((c) => c.id === id)?.name || 'Unknown club';
  const rows = events
    .filter((e) => `${e.title} ${clubName(e.club)} ${e.venue} ${e.category}`.toLowerCase().includes(q.trim().toLowerCase()))
    .sort((a, b) => getEventStart(a) - getEventStart(b));

  const save = (data) => {
    const res = editing === 'new' ? addEvent(data) : updateEvent(editing.id, data);
    if (!res.ok) return toast.error(res.error);
    toast.success(editing === 'new' ? 'Event created' : 'Event updated');
    setEditing(null);
    return undefined;
  };

  const remove = (event) => {
    const n = allTickets.filter((t) => t.eventId === event.id).length;
    const extra = n ? ` This also removes ${n} registration${n > 1 ? 's' : ''}.` : '';
    if (!window.confirm(`Delete "${event.title}"?${extra}`)) return;
    const res = deleteEvent(event.id);
    if (!res.ok) toast.error(res.error);
    else toast.info('Event deleted');
  };

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:w-80">
          <label htmlFor="admin-event-search" className="sr-only">Search events</label>
          <Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input id="admin-event-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search events…" className="input !pl-10" />
        </div>
        <button type="button" className="btn-primary" onClick={() => setEditing('new')}>
          <Icon name="plus" className="h-4 w-4" /> New event
        </button>
      </div>

      <div className="mt-5">
        {rows.length === 0 ? (
          <EmptyState icon="calendar" title="No events found">Create an event or change your search.</EmptyState>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-white/10">
                <tr>
                  <th scope="col" className="px-4 py-3">Event</th>
                  <th scope="col" className="px-4 py-3">When</th>
                  <th scope="col" className="px-4 py-3">Seats</th>
                  <th scope="col" className="px-4 py-3">Status</th>
                  <th scope="col" className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {rows.map((e) => {
                  const start = getEventStart(e);
                  const ended = hasEnded(e);
                  const filled = e.capacity - e.seatsLeft;
                  return (
                    <tr key={e.id}>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900 dark:text-white">{e.title}</p>
                        <p className="text-xs text-slate-500">{clubName(e.club)} · {e.venue}</p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600 dark:text-slate-300">
                        {formatDate(start, { day: 'numeric', month: 'short', year: 'numeric' })}
                        <span className="block text-xs text-slate-500">{formatTime(start)}</span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600 dark:text-slate-300">
                        {filled}/{e.capacity}
                        {e.seatsLeft === 0 && <span className="chip ml-2 bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300">Full</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`chip ${ended ? 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'}`}>
                          {ended ? 'Ended' : 'Upcoming'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <button type="button" className="btn-ghost !px-2.5 !py-1.5" onClick={() => setEditing(e)} aria-label={`Edit ${e.title}`}>
                          <Icon name="edit" className="h-4 w-4" /> Edit
                        </button>
                        <button type="button" className="btn-ghost !px-2.5 !py-1.5 text-rose-600 dark:text-rose-400" onClick={() => remove(e)} aria-label={`Delete ${e.title}`}>
                          <Icon name="trash" className="h-4 w-4" /> Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Event form" wide>
        {editing && <EventForm key={editing === 'new' ? 'new' : editing.id} event={editing === 'new' ? null : editing} onSubmit={save} onCancel={() => setEditing(null)} />}
      </Modal>
    </div>
  );
}
