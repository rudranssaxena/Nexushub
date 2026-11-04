import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import Icon from './Icon';
import { useAuth } from '../context/AuthContext';

const LINKS = [
  { to: '/events', label: 'Events' },
  { to: '/clubs', label: 'Clubs' },
  { to: '/scan', label: 'Check-in' },
];

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="Nexus home">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 font-display text-lg font-bold text-white shadow-glow">
        N
      </span>
      <span className="font-display text-lg font-bold text-slate-900 dark:text-white">
        Nexus<span className="hidden font-medium text-slate-500 sm:inline dark:text-slate-400"> Hub</span>
      </span>
    </Link>
  );
}

export default function Navbar() {
  const { user, isAuthenticated, signOut, openAuthModal } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

  // Close the avatar menu on outside click
  useEffect(() => {
    const onDoc = (e) => menuRef.current && !menuRef.current.contains(e.target) && setMenuOpen(false);
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const linkClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive
        ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/20 dark:text-brand-200'
        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10'
    }`;

  const handleSignOut = () => {
    signOut();
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/75 backdrop-blur-xl dark:border-white/10 dark:bg-[#0b1020]/75">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-[200] focus:rounded-lg focus:bg-brand-600 focus:px-3 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <nav className="container-page flex h-16 items-center justify-between gap-4" aria-label="Main">
        <Logo />

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
          {isAuthenticated && (
            <NavLink to="/dashboard" className={linkClass}>
              Dashboard
            </NavLink>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />

          {isAuthenticated ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="flex items-center gap-2 rounded-full p-0.5 pr-2 hover:bg-slate-100 dark:hover:bg-white/10"
              >
                <img src={user.avatar} alt={`${user.name}'s avatar`} className="h-9 w-9 rounded-full" />
                <span className="hidden text-sm font-semibold text-slate-700 dark:text-slate-200 sm:block">
                  {user.name.split(' ')[0]}
                </span>
              </button>
              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-white/10 dark:bg-[#121833]"
                >
                  <div className="px-3 py-2">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{user.name}</p>
                    <p className="truncate text-xs text-slate-500">{user.email}</p>
                  </div>
                  <Link role="menuitem" to="/dashboard" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-white/10">
                    <Icon name="home" className="h-4 w-4" /> Dashboard
                  </Link>
                  <button
                    role="menuitem"
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                  >
                    <Icon name="logout" className="h-4 w-4" /> Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button type="button" onClick={openAuthModal} className="btn-primary hidden sm:inline-flex">
              Sign in
            </button>
          )}

          {/* Mobile menu button */}
          <button
            type="button"
            className="rounded-xl p-2.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10 md:hidden"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((o) => !o)}
          >
            <Icon name={mobileOpen ? 'x' : 'menu'} />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="border-t border-slate-200/70 px-4 pb-4 pt-2 dark:border-white/10 md:hidden">
          <div className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} className={linkClass}>
                {l.label}
              </NavLink>
            ))}
            {isAuthenticated ? (
              <NavLink to="/dashboard" className={linkClass}>
                Dashboard
              </NavLink>
            ) : (
              <button type="button" onClick={openAuthModal} className="btn-primary mt-2">
                Sign in
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
