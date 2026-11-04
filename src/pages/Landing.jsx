import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEvents } from '../context/EventsContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import useFakeLoading from '../hooks/useFakeLoading';
import { getEventStart, hasEnded } from '../utils/dates';
import EventCard from '../components/EventCard';
import ClubCard from '../components/ClubCard';
import SectionHeading from '../components/SectionHeading';
import GoogleButton from '../components/GoogleButton';
import Icon from '../components/Icon';
import { SkeletonGrid, ClubCardSkeleton } from '../components/Skeletons';

const STEPS = [
  { icon: 'search', title: 'Discover', text: 'Browse clubs and events filtered by what you love.' },
  { icon: 'ticket', title: 'Register', text: 'One tap to grab a seat and get a unique QR ticket.' },
  { icon: 'scan', title: 'Check in', text: 'Show your QR at the door. Organisers scan it in a second.' },
];

export default function Landing() {
  const { events, clubs } = useEvents();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const loading = useFakeLoading(600);

  const upcoming = events
    .filter((e) => !hasEnded(e))
    .sort((a, b) => getEventStart(a) - getEventStart(b))
    .slice(0, 6);

  const totalMembers = clubs.reduce((n, c) => n + c.members, 0);

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -left-24 -top-24 h-96 w-96 animate-float rounded-full bg-brand-500/25 blur-3xl" />
          <div className="absolute -right-24 top-20 h-96 w-96 animate-float rounded-full bg-accent-500/20 blur-3xl [animation-delay:2s]" />
        </div>

        <div className="container-page relative grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold text-brand-700 dark:text-brand-200">
              <Icon name="sparkles" className="h-3.5 w-3.5" /> Your campus, one hub
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
              Find your people.
              <br />
              <span className="gradient-text">Never miss an event.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-600 dark:text-slate-400">
              Discover campus clubs, register for events in one tap and walk in with a QR ticket. Everything student life,
              in one place.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/events" className="btn-primary !px-6 !py-3 text-base">
                Explore events <Icon name="arrow" className="h-4 w-4" />
              </Link>
              {isAuthenticated ? (
                <Link to="/dashboard" className="btn-secondary !px-6 !py-3 text-base">
                  Go to dashboard
                </Link>
              ) : (
                <GoogleButton
                  onSuccess={(p) => {
                    toast.success(`Welcome, ${p.name.split(' ')[0]}! 🎉`);
                    navigate('/dashboard');
                  }}
                />
              )}
            </div>

            <dl className="mt-10 grid max-w-md grid-cols-3 gap-4">
              {[
                [clubs.length, 'Clubs'],
                [events.length, 'Events'],
                [`${totalMembers}+`, 'Members'],
              ].map(([v, l]) => (
                <div key={l}>
                  <dt className="sr-only">{l}</dt>
                  <dd className="font-display text-3xl font-bold text-slate-900 dark:text-white">{v}</dd>
                  <dd className="text-sm text-slate-500">{l}</dd>
                </div>
              ))}
            </dl>
          </motion.div>

          {/* Hero visual: floating sample ticket */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative mx-auto w-full max-w-md"
            aria-hidden="true"
          >
            <div className="glass animate-float rounded-3xl p-5 shadow-glow">
              <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-accent-600 p-5 text-white">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-white/70">Nexus Ticket</p>
                <p className="mt-1 text-xl font-bold">Hack the Campus 24h</p>
                <p className="mt-3 text-sm text-white/85">Innovation Lab, Block C</p>
              </div>
              <div className="mt-4 flex items-center gap-4">
                <div className="grid h-24 w-24 grid-cols-5 gap-0.5 rounded-xl bg-white p-2">
                  {Array.from({ length: 25 }, (_, i) => (
                    <span key={i} className={`rounded-[2px] ${[0, 1, 2, 4, 5, 6, 8, 10, 12, 14, 16, 18, 19, 20, 22, 23, 24].includes(i) ? 'bg-slate-900' : 'bg-slate-200'}`} />
                  ))}
                </div>
                <div>
                  <p className="font-mono text-sm font-bold text-slate-800 dark:text-white">NXS-K3F9-82QD</p>
                  <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-emerald-600">
                    <Icon name="check-circle" className="h-4 w-4" /> Checked in
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ---------- How it works ---------- */}
      <section className="container-page py-10">
        <div className="grid gap-4 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="card flex items-start gap-4 p-5"
            >
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
                <Icon name={s.icon} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">
                  {i + 1}. {s.title}
                </h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{s.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ---------- Upcoming events ---------- */}
      <section className="container-page py-12" aria-labelledby="upcoming-heading">
        <SectionHeading
          eyebrow="What's on"
          title={<span id="upcoming-heading">Upcoming events</span>}
          subtitle="Grab your seat before they fill up."
          action={
            <Link to="/events" className="btn-secondary">
              View all <Icon name="arrow" className="h-4 w-4" />
            </Link>
          }
        />
        {loading ? (
          <SkeletonGrid count={6} />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((e, i) => (
              <EventCard key={e.id} event={e} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* ---------- Clubs ---------- */}
      <section className="container-page py-12" aria-labelledby="clubs-heading">
        <SectionHeading
          eyebrow="Communities"
          title={<span id="clubs-heading">Campus clubs</span>}
          subtitle="Find a club that fits your passion and join the community."
          action={
            <Link to="/clubs" className="btn-secondary">
              All clubs <Icon name="arrow" className="h-4 w-4" />
            </Link>
          }
        />
        {loading ? (
          <SkeletonGrid count={4} Item={ClubCardSkeleton} />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {clubs.map((c, i) => (
              <ClubCard key={c.id} club={c} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* ---------- CTA ---------- */}
      <section className="container-page py-12">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-accent-600 px-6 py-12 text-center text-white sm:px-12">
          <h2 className="text-3xl font-bold sm:text-4xl">Ready to dive in?</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/85">
            Sign in, tell us what you like, and we'll line up events made for you.
          </p>
          <div className="mt-6 flex justify-center">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn bg-white !px-6 !py-3 text-brand-700 hover:bg-slate-100">
                Open my dashboard
              </Link>
            ) : (
              <GoogleButton
                onSuccess={(p) => {
                  toast.success(`Welcome, ${p.name.split(' ')[0]}! 🎉`);
                  navigate('/dashboard');
                }}
              />
            )}
          </div>
        </div>
      </section>
    </>
  );
}
