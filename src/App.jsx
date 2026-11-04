import { Suspense, lazy } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import PageTransition from './components/PageTransition';
import SignInModal from './components/SignInModal';
import InterestsModal from './components/InterestsModal';
import Landing from './pages/Landing';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import Clubs from './pages/Clubs';
import ClubDetails from './pages/ClubDetails';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';

// The scanner pulls in html5-qrcode (large), so load it only when /scan is opened.
const Scan = lazy(() => import('./pages/Scan'));

export default function App() {
  const location = useLocation();
  const page = (el) => <PageTransition>{el}</PageTransition>;

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Navbar />
      <main id="main" className="flex-1">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={page(<Landing />)} />
            <Route path="/events" element={page(<Events />)} />
            <Route path="/events/:id" element={page(<EventDetails />)} />
            <Route path="/clubs" element={page(<Clubs />)} />
            <Route path="/clubs/:id" element={page(<ClubDetails />)} />
            <Route
              path="/dashboard"
              element={page(
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/admin"
              element={page(
                <ProtectedRoute adminOnly>
                  <Admin />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/scan"
              element={page(
                <Suspense fallback={<div className="container-page py-20 text-center text-slate-500">Loading scanner…</div>}>
                  <Scan />
                </Suspense>
              )}
            />
            <Route path="*" element={page(<NotFound />)} />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
      <SignInModal />
      <InterestsModal />
    </div>
  );
}
