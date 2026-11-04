# Nexus: Club & Event Hub

> One hub for campus life. Discover clubs, find events, register in a tap and walk in with a QR ticket.

Built for the college hackathon, **Problem Statement 2**. It is a fully client-side app: no backend, mock data in JSON files, and `localStorage` for persistence, so it runs anywhere and deploys as static files.

<!-- Add a banner / hero screenshot here -->
<!-- ![Nexus landing page](docs/screenshots/landing.png) -->

## Features

### Core
- **Landing page**: hero with CTA, upcoming events grid, clubs grid, navbar, footer; mobile-first.
- **Sign in with Google (mock)**: Google-styled button signs in a mock profile (name, email, avatar) through an `AuthContext`, persisted in `localStorage`, with logout.
- **Protected dashboard**: redirects guests to the landing page and opens the sign-in dialog. Shows name, avatar, registered events (**My Tickets**) and bookmarked events.
- **Event registration + QR ticket**: every event has a **Register** button that issues a ticket with a unique ID. The QR encodes ticket ID, event name, date, venue and attendee name. Tickets live under **My Tickets** and can be **downloaded as a PNG image**.

### Extras
- **QR check-in (`/scan`)**: scan with the device camera, upload a QR image, or paste the ticket text/ID. Shows **Checked in ✅** with attendee details and **blocks duplicate check-ins**.
- **For You recommendations**: after first login, pick interests (coding, robotics, music, sports, art, entrepreneurship). Events are ranked by tag match into **Recommended for you**.
- **Add to Google Calendar** on every event (pre-filled link).
- **Search and filters**: by text, club, category, date, and **This week** (state is kept in the URL, so filtered views are shareable).
- **Seats-left badge + live countdown**; registration is blocked when an event is full or has ended.
- **Bookmarks** (saved per user).
- **Dark / light mode**, remembered in `localStorage` (no flash on load).
- **Animations**: card hover, page transitions, scroll reveals, skeleton loaders.
- **PWA**: web manifest, icons, and a service worker for installability and an offline shell.
- **Accessibility**: semantic HTML, skip link, labelled controls, visible focus rings, `aria-live` toasts, reduced-motion support.

## Tech stack

| Area | Choice |
| --- | --- |
| Framework | React 18 + Vite |
| Styling | Tailwind CSS 3 (class-based dark mode) |
| Routing | React Router 6 |
| Animation | Framer Motion |
| QR generate / scan | `qrcode.react`, `html5-qrcode` |
| Data | Local JSON files + `localStorage` |

## Getting started

Requires **Node.js 18+**.

```bash
npm install
npm run dev       # http://localhost:5173
```

```bash
npm run build     # production build in /dist
npm run preview   # serve the production build locally
```

> The camera (`/scan`) and the PWA install prompt need **HTTPS or `localhost`**. Both are satisfied by `npm run dev` and by Vercel/Netlify.

## Demo flow

1. **Landing**: open `/` and click **Sign in with Google**.
2. **First login**: choose a few interests and save.
3. **Dashboard**: see your profile and **Recommended for you**.
4. **Browse/filter**: go to **Events**, search, filter by club/category/date or **This week**.
5. **Register**: click **Register** on an event. A QR ticket appears instantly.
6. **My Tickets**: open the dashboard to see the ticket and **Download** it as an image.
7. **Scan check-in**: open **Check-in** (`/scan`). Scan the QR with the camera, or on one device use **Paste the ticket → Use my latest ticket (demo)** and press **Check in**.
8. **Duplicate check**: check in the same ticket again to see "Already checked in".

## Project structure

```
src/
├── components/   Reusable UI: Navbar, EventCard, TicketCard, Modal, Countdown, ...
├── pages/        Landing, Events, EventDetails, Clubs, ClubDetails, Dashboard, Scan, NotFound
├── context/      AuthContext, ThemeContext, EventsContext (tickets, bookmarks, check-ins), ToastContext
├── data/         clubs.json (8 clubs), events.json (12 events)
├── hooks/        useCountdown, useDebounce, useFakeLoading
└── utils/        dates, calendar link, recommendations, ticket encode/decode, ticket image, storage
public/
├── manifest.webmanifest, sw.js, icons/   PWA assets
└── _redirects                            Netlify SPA fallback
vercel.json                               Vercel SPA fallback
```

## How it works

- **Mock dates**: events store `dayOffset` + `time`, so the demo always shows upcoming events no matter when it is opened (see `src/utils/dates.js`).
- **Tickets**: stored in `localStorage`; the QR payload is JSON, so check-in works offline. Check-ins are recorded by ticket ID to prevent duplicates.
- **Per-user data**: bookmarks and interests are keyed by the signed-in email.
- **Reset the demo**: clear site data in your browser (or run `localStorage.clear()` in the console).
- **Posters**: event posters use Unsplash URLs. If an image fails to load, the card automatically falls back to its gradient.

## Deploy

**Vercel**: import the repo, framework preset *Vite*, build `npm run build`, output `dist`. `vercel.json` handles SPA routing.

**Netlify**: build command `npm run build`, publish directory `dist`. `public/_redirects` handles SPA routing.

## Screenshots

| Landing | Events | Dashboard |
| --- | --- | --- |
| _placeholder_ | _placeholder_ | _placeholder_ |

| QR Ticket | Scan check-in | Dark mode |
| --- | --- | --- |
| _placeholder_ | _placeholder_ | _placeholder_ |

## Limitations

- Authentication and data are mocked and live only in the browser. A real deployment would add Google OAuth and an API/database.
- Check-in is validated against tickets on the same device, with a fallback to the QR payload for tickets from other devices.

## License

MIT
