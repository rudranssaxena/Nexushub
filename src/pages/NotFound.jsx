import { Link } from 'react-router-dom';
import Icon from '../components/Icon';

export default function NotFound({ message = "The page you're looking for doesn't exist." }) {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="gradient-text font-display text-8xl font-extrabold">404</p>
      <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">Lost in the hub?</h1>
      <p className="mt-2 max-w-md text-slate-600 dark:text-slate-400">{message}</p>
      <div className="mt-6 flex gap-3">
        <Link to="/" className="btn-primary"><Icon name="home" className="h-4 w-4" /> Back home</Link>
        <Link to="/events" className="btn-secondary">Browse events</Link>
      </div>
    </div>
  );
}
