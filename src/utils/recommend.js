// "For You" ranking: score each upcoming event by how many of its tags match the user's interests.
import { hasEnded } from './dates';

export function scoreEvent(event, interests = []) {
  if (!interests.length) return 0;
  const set = new Set(interests);
  return event.tags.reduce((n, t) => n + (set.has(t) ? 1 : 0), 0);
}

export function recommendEvents(events, interests = [], limit = 4) {
  return events
    .filter((e) => !hasEnded(e))
    .map((e) => ({ event: e, score: scoreEvent(e, interests) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.event.dayOffset - b.event.dayOffset)
    .slice(0, limit)
    .map((x) => x.event);
}

export const INTERESTS = [
  { id: 'coding', label: 'Coding', emoji: '💻' },
  { id: 'robotics', label: 'Robotics', emoji: '🤖' },
  { id: 'music', label: 'Music', emoji: '🎵' },
  { id: 'sports', label: 'Sports', emoji: '🏅' },
  { id: 'art', label: 'Art', emoji: '🎨' },
  { id: 'entrepreneurship', label: 'Entrepreneurship', emoji: '🚀' },
];
