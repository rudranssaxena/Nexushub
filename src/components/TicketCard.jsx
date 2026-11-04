import { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { encodeTicket } from '../utils/ticket';
import { formatDate, formatTime } from '../utils/dates';
import { downloadTicketImage } from '../utils/ticketImage';
import { useEvents } from '../context/EventsContext';
import { useToast } from '../context/ToastContext';
import Icon from './Icon';

/**
 * A QR ticket. The QR encodes ticket id, event, date, venue and attendee name (see utils/ticket.js).
 * `actions` toggles the download / cancel buttons.
 */
export default function TicketCard({ ticket, actions = true }) {
  const qrWrap = useRef(null);
  const { isCheckedIn, cancelRegistration } = useEvents();
  const toast = useToast();
  const date = new Date(ticket.eventDateISO);
  const checkedIn = isCheckedIn(ticket.id);

  const download = () => {
    const canvas = qrWrap.current?.querySelector('canvas');
    downloadTicketImage(ticket, canvas);
    toast.success('Ticket image downloaded');
  };

  const cancel = () => {
    if (!window.confirm(`Cancel your registration for "${ticket.eventTitle}"?`)) return;
    if (cancelRegistration(ticket.id)) toast.info('Registration cancelled');
  };

  return (
    <article className="card overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        <div className="flex-1 bg-gradient-to-br from-brand-600 to-accent-600 p-5 text-white">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-white/70">Nexus Ticket</p>
          <h3 className="mt-1 text-lg font-bold leading-snug">{ticket.eventTitle}</h3>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Icon name="calendar" className="h-4 w-4 shrink-0 opacity-80" />
              <dd>{formatDate(date)} · {formatTime(date)}</dd>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="pin" className="h-4 w-4 shrink-0 opacity-80" />
              <dd>{ticket.venue}</dd>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="users" className="h-4 w-4 shrink-0 opacity-80" />
              <dd>{ticket.userName}</dd>
            </div>
          </dl>
          {checkedIn && (
            <span className="chip mt-4 bg-white/20 text-white">
              <Icon name="check" className="h-3.5 w-3.5" /> Checked in
            </span>
          )}
        </div>

        {/* Dashed "tear" divider */}
        <div className="flex flex-col items-center justify-center gap-2 border-t-2 border-dashed border-slate-200 bg-white p-5 dark:border-white/15 dark:bg-white/[0.03] sm:border-l-2 sm:border-t-0">
          <div ref={qrWrap} className="rounded-xl bg-white p-2 shadow-sm">
            <QRCodeCanvas value={encodeTicket(ticket)} size={150} level="M" marginSize={1} />
          </div>
          <p className="font-mono text-sm font-bold tracking-wider text-slate-800 dark:text-slate-100">{ticket.id}</p>
        </div>
      </div>

      {actions && (
        <div className="flex flex-wrap gap-2 border-t border-slate-100 p-3 dark:border-white/10">
          <button type="button" onClick={download} className="btn-secondary !py-2">
            <Icon name="download" className="h-4 w-4" /> Download
          </button>
          {!checkedIn && (
            <button type="button" onClick={cancel} className="btn-ghost !py-2 text-rose-600 dark:text-rose-400">
              <Icon name="trash" className="h-4 w-4" /> Cancel
            </button>
          )}
        </div>
      )}
    </article>
  );
}
