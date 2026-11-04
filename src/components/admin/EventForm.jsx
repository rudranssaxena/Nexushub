import { useState } from 'react';
import { useEvents } from '../../context/EventsContext';
import { getEventStart } from '../../utils/dates';
import { INTERESTS } from '../../utils/recommend';
import { EVENT_CATEGORIES, GRADIENTS } from './adminOptions';
import Field, { GradientPicker, TagPicker } from './Field';

const pad = (n) => String(n).padStart(2, '0');
// <input type="datetime-local"> wants local time as YYYY-MM-DDTHH:mm
const toLocalInput = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

function blankForm(clubs) {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(10, 0, 0, 0);
  return {
    title: '', club: clubs[0]?.id || '', start: toLocalInput(d), durationHours: 2, venue: '',
    category: 'Workshop', tags: [], capacity: 100, seatsLeft: 100, poster: '',
    gradient: GRADIENTS[0], description: '',
  };
}

/** Create / edit form for an event. Calls onSubmit(eventData) when valid. */
export default function EventForm({ event, onSubmit, onCancel }) {
  const { clubs } = useEvents();
  const [form, setForm] = useState(() =>
    event
      ? {
          title: event.title, club: event.club, start: toLocalInput(getEventStart(event)),
          durationHours: event.durationHours, venue: event.venue, category: event.category,
          tags: event.tags, capacity: event.capacity, seatsLeft: event.seatsLeft,
          poster: event.poster || '', gradient: event.gradient || GRADIENTS[0], description: event.description,
        }
      : blankForm(clubs)
  );
  const [errors, setErrors] = useState({});

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const categories = [...new Set([...EVENT_CATEGORIES, form.category])];

  const submit = (e) => {
    e.preventDefault();
    const errs = {};
    const capacity = Number(form.capacity);
    const seatsLeft = Number(form.seatsLeft);
    const hours = Number(form.durationHours);
    if (!form.title.trim()) errs.title = 'Give the event a title.';
    if (!form.club) errs.club = 'Pick the organising club.';
    if (!form.venue.trim()) errs.venue = 'Add a venue.';
    if (!form.start || Number.isNaN(new Date(form.start).getTime())) errs.start = 'Pick a valid date and time.';
    if (!(hours > 0)) errs.durationHours = 'Duration must be more than 0.';
    if (!Number.isInteger(capacity) || capacity < 1) errs.capacity = 'Capacity must be at least 1.';
    if (!Number.isInteger(seatsLeft) || seatsLeft < 0 || seatsLeft > capacity)
      errs.seatsLeft = 'Must be between 0 and the capacity.';
    if (!form.description.trim()) errs.description = 'Add a short description.';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    onSubmit({
      title: form.title.trim(),
      club: form.club,
      startISO: new Date(form.start).toISOString(),
      durationHours: hours,
      venue: form.venue.trim(),
      category: form.category,
      tags: form.tags,
      capacity,
      seatsLeft,
      poster: form.poster.trim(),
      gradient: form.gradient,
      description: form.description.trim(),
    });
  };

  return (
    <form onSubmit={submit} noValidate>
      <h2 className="pr-8 text-xl font-bold text-slate-900 dark:text-white">{event ? 'Edit event' : 'New event'}</h2>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Title" htmlFor="ev-title" error={errors.title} className="sm:col-span-2">
          <input id="ev-title" className="input" value={form.title} onChange={set('title')} />
        </Field>
        <Field label="Club" htmlFor="ev-club" error={errors.club}>
          <select id="ev-club" className="input" value={form.club} onChange={set('club')}>
            {clubs.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Category" htmlFor="ev-cat">
          <select id="ev-cat" className="input" value={form.category} onChange={set('category')}>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="Starts" htmlFor="ev-start" error={errors.start}>
          <input id="ev-start" type="datetime-local" className="input" value={form.start} onChange={set('start')} />
        </Field>
        <Field label="Duration (hours)" htmlFor="ev-dur" error={errors.durationHours}>
          <input id="ev-dur" type="number" min="0.5" step="0.5" className="input" value={form.durationHours} onChange={set('durationHours')} />
        </Field>
        <Field label="Venue" htmlFor="ev-venue" error={errors.venue} className="sm:col-span-2">
          <input id="ev-venue" className="input" value={form.venue} onChange={set('venue')} />
        </Field>
        <Field label="Capacity" htmlFor="ev-cap" error={errors.capacity}>
          <input id="ev-cap" type="number" min="1" className="input" value={form.capacity} onChange={set('capacity')} />
        </Field>
        <Field label="Seats open now" htmlFor="ev-seats" error={errors.seatsLeft} hint="What attendees see as seats left.">
          <input id="ev-seats" type="number" min="0" className="input" value={form.seatsLeft} onChange={set('seatsLeft')} />
        </Field>
        <Field label="Description" htmlFor="ev-desc" error={errors.description} className="sm:col-span-2">
          <textarea id="ev-desc" rows={3} className="input" value={form.description} onChange={set('description')} />
        </Field>
        <Field label="Poster image URL (optional)" htmlFor="ev-poster" hint="Leave empty to use the colour theme below." className="sm:col-span-2">
          <input id="ev-poster" type="url" placeholder="https://…" className="input" value={form.poster} onChange={set('poster')} />
        </Field>
        <Field label="Interest tags (used for recommendations)" className="sm:col-span-2">
          <TagPicker options={INTERESTS} value={form.tags} onChange={(tags) => setForm((f) => ({ ...f, tags }))} />
        </Field>
        <Field label="Colour theme" className="sm:col-span-2">
          <GradientPicker options={GRADIENTS} value={form.gradient} onChange={(gradient) => setForm((f) => ({ ...f, gradient }))} />
        </Field>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary">{event ? 'Save changes' : 'Create event'}</button>
      </div>
    </form>
  );
}
