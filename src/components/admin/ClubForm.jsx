import { useState } from 'react';
import { INTERESTS } from '../../utils/recommend';
import { CLUB_CATEGORIES, GRADIENTS } from './adminOptions';
import Field, { GradientPicker, TagPicker } from './Field';

/** Create / edit form for a club. Calls onSubmit(clubData) when valid. */
export default function ClubForm({ club, onSubmit, onCancel }) {
  const [form, setForm] = useState(() =>
    club
      ? { name: club.name, emoji: club.emoji, category: club.category, members: club.members, tags: club.tags, gradient: club.gradient, description: club.description }
      : { name: '', emoji: '🎯', category: 'Other', members: 0, tags: [], gradient: GRADIENTS[0], description: '' }
  );
  const [errors, setErrors] = useState({});
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const categories = [...new Set([...CLUB_CATEGORIES, form.category])];

  const submit = (e) => {
    e.preventDefault();
    const errs = {};
    const members = Number(form.members);
    if (!form.name.trim()) errs.name = 'Give the club a name.';
    if (!form.emoji.trim()) errs.emoji = 'Add an emoji.';
    if (!Number.isInteger(members) || members < 0) errs.members = 'Members must be 0 or more.';
    if (!form.description.trim()) errs.description = 'Add a short description.';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    onSubmit({
      name: form.name.trim(),
      emoji: form.emoji.trim(),
      category: form.category,
      members,
      tags: form.tags,
      gradient: form.gradient,
      description: form.description.trim(),
    });
  };

  return (
    <form onSubmit={submit} noValidate>
      <h2 className="pr-8 text-xl font-bold text-slate-900 dark:text-white">{club ? 'Edit club' : 'New club'}</h2>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Name" htmlFor="cl-name" error={errors.name} className="sm:col-span-2">
          <input id="cl-name" className="input" value={form.name} onChange={set('name')} />
        </Field>
        <Field label="Emoji" htmlFor="cl-emoji" error={errors.emoji}>
          <input id="cl-emoji" className="input" maxLength={4} value={form.emoji} onChange={set('emoji')} />
        </Field>
        <Field label="Category" htmlFor="cl-cat">
          <select id="cl-cat" className="input" value={form.category} onChange={set('category')}>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="Members" htmlFor="cl-members" error={errors.members}>
          <input id="cl-members" type="number" min="0" className="input" value={form.members} onChange={set('members')} />
        </Field>
        <Field label="Description" htmlFor="cl-desc" error={errors.description} className="sm:col-span-2">
          <textarea id="cl-desc" rows={3} className="input" value={form.description} onChange={set('description')} />
        </Field>
        <Field label="Interest tags" className="sm:col-span-2">
          <TagPicker options={INTERESTS} value={form.tags} onChange={(tags) => setForm((f) => ({ ...f, tags }))} />
        </Field>
        <Field label="Colour theme" className="sm:col-span-2">
          <GradientPicker options={GRADIENTS} value={form.gradient} onChange={(gradient) => setForm((f) => ({ ...f, gradient }))} />
        </Field>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary">{club ? 'Save changes' : 'Create club'}</button>
      </div>
    </form>
  );
}
