import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

/**
 * Only renders children for signed-in users; otherwise sends them to the landing page and opens sign-in.
 * With `adminOnly`, signed-in students are bounced to their dashboard.
 */
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin, openAuthModal } = useAuth();
  const toast = useToast();
  const location = useLocation();
  const blocked = isAuthenticated && adminOnly && !isAdmin;

  useEffect(() => {
    if (!isAuthenticated) openAuthModal();
  }, [isAuthenticated, openAuthModal]);

  useEffect(() => {
    if (blocked) toast.error('That page is for admins only.');
  }, [blocked, toast]);

  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }
  if (blocked) return <Navigate to="/dashboard" replace />;
  return children;
}
