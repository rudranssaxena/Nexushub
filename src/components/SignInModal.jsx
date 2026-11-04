import { useNavigate } from 'react-router-dom';
import Modal from './Modal';
import GoogleButton from './GoogleButton';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

/** Global sign-in dialog. Opened from the navbar, protected routes and "Register" buttons. */
export default function SignInModal() {
  const { authModalOpen, closeAuthModal } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  return (
    <Modal open={authModalOpen} onClose={closeAuthModal} title="Sign in to Nexus">
      <div className="text-center">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 text-2xl font-bold text-white shadow-glow">
          N
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome to Nexus</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Sign in to register for events, save favourites and get your QR tickets.
        </p>
        <GoogleButton
          className="mt-6 w-full"
          onSuccess={(p) => {
            toast.success(`Welcome, ${p.name.split(' ')[0]}! 🎉`);
            navigate('/dashboard');
          }}
        />
        <p className="mt-4 text-xs text-slate-500 dark:text-slate-500">
          Demo mode: this uses a mock Google profile. No real account is accessed.
        </p>
      </div>
    </Modal>
  );
}
