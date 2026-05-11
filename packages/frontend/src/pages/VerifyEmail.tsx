import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, MailWarning, Sparkles } from 'lucide-react';
import { trpc } from '../lib/trpc';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');

  const verifyMutation = trpc.verifyEmail.useMutation({
    onSuccess: () => {
      setStatus('success');
    },
    onError: (err) => {
      setStatus('error');
      setError(err.message);
    },
  });

  useEffect(() => {
    if (token) {
      verifyMutation.mutate({ token });
    } else {
      setStatus('error');
      setError('No verification token provided');
    }
  }, [token]);

  return (
    <div className="auth-shell">
      <div className="auth-card max-w-xl text-center">
        <div className="eyebrow justify-center">
          <Sparkles className="h-3.5 w-3.5" />
          Email verification
        </div>

        <h1 className="hero-title text-[clamp(2rem,4vw,3rem)]">Confirm your inbox.</h1>
        <p className="hero-copy mx-auto max-w-2xl">
          We are checking the verification link and activating your account for platform access.
        </p>

        <div className="mt-8 space-y-4">
          {status === 'loading' && (
            <div className="panel panel-pad flex items-center justify-center gap-3">
              <div className="h-3 w-3 animate-pulse rounded-full bg-[var(--color-primary)] shadow-[var(--shadow-glow-primary)]" />
              <p className="m-0 text-[var(--color-text-secondary)]">Verifying your email...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="panel panel-pad space-y-4">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[var(--color-success-muted)] text-[var(--color-success)]">
                <CheckCircle2 size={28} />
              </div>
              <p className="m-0 text-[var(--color-success)]">Your email has been successfully verified.</p>
              <Link to="/login" className="btn btn--primary">
                Sign in
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="panel panel-pad space-y-4">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[var(--color-accent-muted)] text-[var(--color-accent)]">
                <MailWarning size={28} />
              </div>
              <p className="m-0 text-[var(--color-accent)]">{error}</p>
              <p className="m-0 text-sm text-[var(--color-text-secondary)]">
                The link may be invalid or has expired.
              </p>
              <Link to="/register" className="btn btn--secondary">
                Try registering again
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
