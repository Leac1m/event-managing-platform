import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, LockKeyhole, Sparkles, UserCircle2 } from 'lucide-react';
import { trpc } from '../lib/trpc';
import { useToast } from '../components/ui/toast';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { pushToast } = useToast();

  const loginMutation = trpc.login.useMutation({
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      pushToast({
        title: 'Signed in',
        description: `Welcome back, ${data.user.username}.`,
        variant: 'success',
      });
      navigate('/');
    },
    onError: (err) => {
      setError(err.message);
      pushToast({
        title: 'Sign in failed',
        description: err.message,
        variant: 'error',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    loginMutation.mutate({ username, password });
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-layout">
          <div className="space-y-6">
            <div>
              <div className="eyebrow">
                <Sparkles className="h-3.5 w-3.5" />
                Sign in
              </div>
              <h1 className="hero-title text-[clamp(2rem,4vw,3.2rem)]">Welcome back.</h1>
              <p className="hero-copy max-w-2xl">
                Sign in to view your dashboard, access your QR pass, and manage the events you own
                or joined.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="field-group">
                <label className="field-label" htmlFor="login-username">
                  Username
                </label>
                <div className="relative">
                  <UserCircle2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
                  <input
                    id="login-username"
                    type="text"
                    required
                    className="field pl-10"
                    placeholder="organizer1"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="login-password">
                  Password
                </label>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
                  <input
                    id="login-password"
                    type="password"
                    required
                    className="field pl-10"
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <p className="field-hint">
                  Use the account password you created during registration.
                </p>
              </div>

              {error && (
                <p className="text-sm text-[var(--color-accent)]" role="alert" aria-live="polite">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="btn btn--primary w-full"
              >
                {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
                <ArrowRight size={16} />
              </button>
            </form>

            <div className="text-sm text-[var(--color-text-secondary)]">
              <span>Need an account?</span>{' '}
              <Link
                to="/register"
                className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]"
              >
                Register instead
              </Link>
            </div>
          </div>

          <aside className="auth-aside">
            <div className="eyebrow mb-0">Platform access</div>
            <div className="auth-metric">
              <div>
                <strong>Protected routes</strong>
                <span>JWT-backed session handling</span>
              </div>
              <LockKeyhole size={18} className="text-[var(--color-primary)]" />
            </div>
            <div className="auth-metric">
              <div>
                <strong>Attendance QR</strong>
                <span>Scan and verify in real time</span>
              </div>
              <Sparkles size={18} className="text-[var(--color-info)]" />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
