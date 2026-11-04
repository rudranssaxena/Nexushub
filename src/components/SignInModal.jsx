import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';
import GoogleButton from './GoogleButton';
import Icon from './Icon';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

/** Global sign-in dialog. Opened from the navbar, protected routes and "Register" buttons. */
export default function SignInModal() {
  const { authModalOpen, closeAuthModal, signIn } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [adminLoading, setAdminLoading] = useState(false);

  const adminSignIn = async () => {
    setAdminLoading(true);
    const p = await signIn('admin');
    setAdminLoading(false);
    toast.success(`Signed in as ${p.name}`);
    navigate('/admin');
  };

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

        <div className="my-4 flex items-center gap-3 text-xs text-slate-400" aria-hidden="true">
          <span className="h-px flex-1 bg-slate-200 dark:bg-white/10" /> or <span className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
        </div>

        <button type="button" onClick={adminSignIn} disabled={adminLoading} className="btn-secondary w-full">
          <Icon name="shield" className="h-4 w-4" />
          {adminLoading ? 'Signing in…' : 'Continue as Admin (demo)'}
        </button>

        <p className="mt-4 text-xs text-slate-500 dark:text-slate-500">
          Demo mode: these use mock profiles. No real account is accessed.
        </p>
      </div>
    </Modal>
  );
}
