import { Link } from 'react-router-dom';
import { Logo } from './Navbar';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-white dark:border-white/10 dark:bg-[#0a0f1e]">
      <div className="container-page grid gap-10 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-4 max-w-sm text-sm text-slate-600 dark:text-slate-400">
            Nexus is the one place to discover campus clubs, find events you'll love, and grab a QR ticket in a single tap.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Explore</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li><Link className="hover:text-brand-600" to="/events">All events</Link></li>
            <li><Link className="hover:text-brand-600" to="/clubs">Clubs</Link></li>
            <li><Link className="hover:text-brand-600" to="/dashboard">My dashboard</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Organisers</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li><Link className="hover:text-brand-600" to="/scan">QR check-in</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-200 py-5 text-center text-xs text-slate-500 dark:border-white/10">
        © {new Date().getFullYear()} Nexus: Club &amp; Event Hub · Built for the campus hackathon (Problem Statement 2)
      </div>
    </footer>
  );
}
