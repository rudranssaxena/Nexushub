import { useState } from 'react';
import { useEvents } from '../../context/EventsContext';
import { useToast } from '../../context/ToastContext';
import Modal from '../Modal';
import Icon from '../Icon';
import EmptyState from '../EmptyState';
import ClubForm from './ClubForm';

/** Admin tab: list, create, edit and delete clubs. */
export default function ClubManager() {
  const { clubs, events, addClub, updateClub, deleteClub } = useEvents();
  const toast = useToast();
  const [editing, setEditing] = useState(null); // null | 'new' | club object

  const save = (data) => {
    const res = editing === 'new' ? addClub(data) : updateClub(editing.id, data);
    if (!res.ok) return toast.error(res.error);
    toast.success(editing === 'new' ? 'Club created' : 'Club updated');
    setEditing(null);
    return undefined;
  };

  const remove = (club) => {
    if (!window.confirm(`Delete "${club.name}"?`)) return;
    const res = deleteClub(club.id);
    if (!res.ok) toast.error(res.error);
    else toast.info('Club deleted');
  };

  return (
    <div>
      <div className="flex justify-end">
        <button type="button" className="btn-primary" onClick={() => setEditing('new')}>
          <Icon name="plus" className="h-4 w-4" /> New club
        </button>
      </div>

      <div className="mt-5">
        {clubs.length === 0 ? (
          <EmptyState icon="users" title="No clubs yet">Create the first club.</EmptyState>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {clubs.map((c) => {
              const count = events.filter((e) => e.club === c.id).length;
              return (
                <div key={c.id} className="card overflow-hidden">
                  <div className={`flex items-center gap-3 bg-gradient-to-br ${c.gradient} p-4 text-white`}>
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-2xl" aria-hidden="true">{c.emoji}</span>
                    <div className="min-w-0">
                      <p className="truncate font-bold">{c.name}</p>
                      <p className="text-xs text-white/85">{c.category}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="line-clamp-2 text-sm text-slate-600 dark:text-slate-400">{c.description}</p>
                    <p className="mt-3 text-xs text-slate-500">{c.members} members · {count} event{count === 1 ? '' : 's'}</p>
                    <div className="mt-3 flex gap-2">
                      <button type="button" className="btn-secondary !px-3 !py-1.5" onClick={() => setEditing(c)} aria-label={`Edit ${c.name}`}>
                        <Icon name="edit" className="h-4 w-4" /> Edit
                      </button>
                      <button type="button" className="btn-ghost !px-3 !py-1.5 text-rose-600 dark:text-rose-400" onClick={() => remove(c)} aria-label={`Delete ${c.name}`}>
                        <Icon name="trash" className="h-4 w-4" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Club form" wide>
        {editing && <ClubForm key={editing === 'new' ? 'new' : editing.id} club={editing === 'new' ? null : editing} onSubmit={save} onCancel={() => setEditing(null)} />}
      </Modal>
    </div>
  );
}
