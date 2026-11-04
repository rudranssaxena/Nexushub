import { useMemo, useState } from 'react';
import { useEvents } from '../../context/EventsContext';
import { useToast } from '../../context/ToastContext';
import Icon from '../Icon';
import EmptyState from '../EmptyState';

// Quote a CSV cell and escape embedded quotes.
const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

/** Admin tab: everyone who registered, with manual check-in and CSV export. */
export default function RegistrationsManager() {
  const { events, allTickets, checkins, adminCheckIn, adminUndoCheckIn, adminRemoveTicket } = useEvents();
  const toast = useToast();
  const [eventId, setEventId] = useState('');
  const [q, setQ] = useState('');

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return allTickets.filter(
      (t) =>
        (!eventId || t.eventId === eventId) &&
        (!needle || `${t.userName} ${t.userEmail} ${t.id} ${t.eventTitle}`.toLowerCase().includes(needle))
    );
  }, [allTickets, eventId, q]);

  const checkedCount = rows.filter((t) => checkins[t.id]).length;

  const exportCsv = () => {
    const header = ['Ticket ID', 'Name', 'Email', 'Event', 'Event date', 'Venue', 'Registered at', 'Checked in at'];
    const lines = rows.map((t) =>
      [t.id, t.userName, t.userEmail, t.eventTitle, new Date(t.eventDateISO).toLocaleString('en-IN'), t.venue,
        new Date(t.issuedAt).toLocaleString('en-IN'), checkins[t.id] ? new Date(checkins[t.id]).toLocaleString('en-IN') : '']
        .map(csvCell).join(',')
    );
    // BOM so Excel opens UTF-8 correctly
    const blob = new Blob([`﻿${[header.map(csvCell).join(','), ...lines].join('\r\n')}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nexus-registrations.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${rows.length} registration${rows.length === 1 ? '' : 's'}`);
  };

  const remove = (t) => {
    if (!window.confirm(`Remove ${t.userName}'s registration for "${t.eventTitle}"? The seat will be released.`)) return;
    if (adminRemoveTicket(t.id)) toast.info('Registration removed');
  };

  return (
    <div>
      <p className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
        This demo has no server, so this list only contains registrations made in this browser.
      </p>

      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <div className="relative">
          <label htmlFor="reg-search" className="sr-only">Search registrations</label>
          <Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input id="reg-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, email or ticket ID…" className="input !pl-10" />
        </div>
        <div>
          <label htmlFor="reg-event" className="sr-only">Filter by event</label>
          <select id="reg-event" value={eventId} onChange={(e) => setEventId(e.target.value)} className="input">
            <option value="">All events</option>
            {events.map((e) => (
              <option key={e.id} value={e.id}>{e.title}</option>
            ))}
          </select>
        </div>
        <button type="button" className="btn-secondary" onClick={exportCsv} disabled={rows.length === 0}>
          <Icon name="download" className="h-4 w-4" /> Export CSV
        </button>
      </div>

      <p className="mt-4 text-sm text-slate-600 dark:text-slate-400" aria-live="polite">
        {rows.length} registration{rows.length === 1 ? '' : 's'} · {checkedCount} checked in
      </p>

      <div className="mt-3">
        {rows.length === 0 ? (
          <EmptyState icon="ticket" title="No registrations yet">
            When students register for events, they'll appear here.
          </EmptyState>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-white/10">
                <tr>
                  <th scope="col" className="px-4 py-3">Attendee</th>
                  <th scope="col" className="px-4 py-3">Event</th>
                  <th scope="col" className="px-4 py-3">Ticket</th>
                  <th scope="col" className="px-4 py-3">Status</th>
                  <th scope="col" className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {rows.map((t) => {
                  const done = checkins[t.id];
                  return (
                    <tr key={t.id}>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900 dark:text-white">{t.userName}</p>
                        <p className="text-xs text-slate-500">{t.userEmail}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{t.eventTitle}</td>
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-700 dark:text-slate-200">{t.id}</td>
                      <td className="px-4 py-3">
                        {done ? (
                          <span className="chip bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300">
                            <Icon name="check" className="h-3.5 w-3.5" /> Checked in
                          </span>
                        ) : (
                          <span className="chip bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300">Pending</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        {done ? (
                          <button type="button" className="btn-ghost !px-2.5 !py-1.5" onClick={() => adminUndoCheckIn(t.id) && toast.info('Check-in undone')}>
                            Undo
                          </button>
                        ) : (
                          <button type="button" className="btn-secondary !px-2.5 !py-1.5" onClick={() => adminCheckIn(t.id) && toast.success(`${t.userName} checked in`)}>
                            Check in
                          </button>
                        )}
                        <button type="button" className="btn-ghost !px-2.5 !py-1.5 text-rose-600 dark:text-rose-400" onClick={() => remove(t)} aria-label={`Remove ${t.userName}'s registration`}>
                          <Icon name="trash" className="h-4 w-4" />
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
    </div>
  );
}
