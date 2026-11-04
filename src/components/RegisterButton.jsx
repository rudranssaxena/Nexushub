import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../context/EventsContext';
import { useToast } from '../context/ToastContext';
import { hasEnded } from '../utils/dates';
import Modal from './Modal';
import TicketCard from './TicketCard';
import Icon from './Icon';

/**
 * Register button with every state handled: guest, available, already registered, full, ended.
 * On success it shows the freshly created QR ticket in a dialog.
 */
export default function RegisterButton({ event, className = '', full = false }) {
  const { isAuthenticated, openAuthModal } = useAuth();
  const { registerForEvent, getMyTicketForEvent } = useEvents();
  const toast = useToast();
  const [ticket, setTicket] = useState(null);

  const existing = getMyTicketForEvent(event.id);
  const width = full ? 'w-full' : '';

  const handle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.info('Please sign in to register.');
      openAuthModal();
      return;
    }
    const res = registerForEvent(event.id);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success("You're in! Your QR ticket is ready 🎟️");
    setTicket(res.ticket);
  };

  let button;
  if (existing) {
    button = (
      <Link to="/dashboard#tickets" onClick={(e) => e.stopPropagation()} className={`btn-secondary ${width} ${className}`}>
        <Icon name="ticket" className="h-4 w-4" /> View ticket
      </Link>
    );
  } else if (hasEnded(event)) {
    button = <button type="button" disabled className={`btn-secondary ${width} ${className}`}>Event ended</button>;
  } else if (event.seatsLeft <= 0) {
    button = <button type="button" disabled className={`btn-secondary ${width} ${className}`}>Sold out</button>;
  } else {
    button = (
      <button type="button" onClick={handle} className={`btn-primary ${width} ${className}`}>
        <Icon name="ticket" className="h-4 w-4" /> Register
      </button>
    );
  }

  return (
    <>
      {button}
      <Modal open={!!ticket} onClose={() => setTicket(null)} title="Your ticket">
        <h2 className="pr-8 text-xl font-bold text-slate-900 dark:text-white">Registration confirmed 🎉</h2>
        <p className="mb-4 mt-1 text-sm text-slate-600 dark:text-slate-400">
          Save this ticket. You can always find it under <strong>My Tickets</strong> on your dashboard.
        </p>
        {ticket && <TicketCard ticket={ticket} />}
        <Link to="/dashboard#tickets" onClick={() => setTicket(null)} className="btn-primary mt-4 w-full">
          Go to My Tickets <Icon name="arrow" className="h-4 w-4" />
        </Link>
      </Modal>
    </>
  );
}
