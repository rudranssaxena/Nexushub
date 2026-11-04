import { useEvents } from '../context/EventsContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Icon from './Icon';

/** Heart-style save button. Prompts sign-in for guests. */
export default function BookmarkButton({ eventId, className = '' }) {
  const { isBookmarked, toggleBookmark } = useEvents();
  const { isAuthenticated, openAuthModal } = useAuth();
  const toast = useToast();
  const saved = isBookmarked(eventId);

  const onClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.info('Sign in to save events.');
      openAuthModal();
      return;
    }
    toggleBookmark(eventId);
    toast.success(saved ? 'Removed from saved events' : 'Saved to your dashboard');
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={saved}
      aria-label={saved ? 'Remove bookmark' : 'Bookmark event'}
      className={`grid h-9 w-9 place-items-center rounded-full bg-white/90 text-slate-700 shadow backdrop-blur transition hover:scale-110 dark:bg-slate-900/80 dark:text-white ${
        saved ? '!text-brand-600 dark:!text-brand-300' : ''
      } ${className}`}
    >
      <Icon name="bookmark" className="h-4 w-4" filled={saved} />
    </button>
  );
}
