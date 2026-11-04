import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Icon from './Icon';

/** Club tile with gradient header, member count and tags. */
export default function ClubCard({ club, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35, delay: Math.min(index, 6) * 0.05 }}
      whileHover={{ y: -6 }}
    >
      <Link
        to={`/clubs/${club.id}`}
        className="card group block h-full overflow-hidden transition-shadow hover:shadow-soft"
        aria-label={`${club.name}, ${club.members} members`}
      >
        <div className={`relative h-24 bg-gradient-to-br ${club.gradient}`}>
          <div className="absolute -bottom-7 left-5 grid h-14 w-14 place-items-center rounded-2xl border-4 border-white bg-white text-3xl shadow-md dark:border-[#141a33] dark:bg-[#141a33]">
            <span aria-hidden="true">{club.emoji}</span>
          </div>
        </div>
        <div className="p-5 pt-10">
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-300">
            {club.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">{club.description}</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300">
              <Icon name="users" className="h-4 w-4" /> {club.members} members
            </span>
            <div className="flex gap-1">
              {club.tags.slice(0, 2).map((t) => (
                <span key={t} className="chip bg-slate-100 capitalize text-slate-600 dark:bg-white/10 dark:text-slate-300">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
