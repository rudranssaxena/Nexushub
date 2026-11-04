import { useState } from 'react';
import Modal from './Modal';
import { useAuth } from '../context/AuthContext';
import { INTERESTS } from '../utils/recommend';

/** First-login onboarding: pick interests that power the "Recommended for you" section. */
export default function InterestsModal() {
  const { user, needsOnboarding, saveInterests } = useAuth();
  const [picked, setPicked] = useState([]);

  const toggle = (id) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  return (
    <Modal open={needsOnboarding} onClose={() => saveInterests([])} title="Pick your interests" dismissible={false}>
      <h2 className="pr-2 text-2xl font-bold text-slate-900 dark:text-white">
        Hi {user?.name.split(' ')[0]}, what are you into?
      </h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Pick a few and we'll recommend events for you.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3" role="group" aria-label="Interests">
        {INTERESTS.map((i) => {
          const on = picked.includes(i.id);
          return (
            <button
              key={i.id}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(i.id)}
              className={`flex items-center gap-2 rounded-xl border px-3 py-3 text-left text-sm font-semibold transition ${
                on
                  ? 'border-brand-500 bg-brand-50 text-brand-700 ring-1 ring-brand-500 dark:bg-brand-500/20 dark:text-brand-200'
                  : 'border-slate-200 text-slate-700 hover:border-brand-300 dark:border-white/15 dark:text-slate-300'
              }`}
            >
              <span className="text-xl" aria-hidden="true">{i.emoji}</span>
              {i.label}
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex gap-3">
        <button type="button" className="btn-ghost flex-1" onClick={() => saveInterests([])}>
          Skip
        </button>
        <button
          type="button"
          className="btn-primary flex-1"
          disabled={picked.length === 0}
          onClick={() => saveInterests(picked)}
        >
          Save ({picked.length})
        </button>
      </div>
    </Modal>
  );
}
