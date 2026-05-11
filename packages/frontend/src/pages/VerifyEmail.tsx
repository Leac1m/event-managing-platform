import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 text-center bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold">Email Verification</h1>

        {status === 'loading' && <p className="text-gray-600">Verifying your email...</p>}

        {status === 'success' && (
          <div className="space-y-4">
            <p className="text-green-600 font-medium">Your email has been successfully verified!</p>
            <Link
              to="/login"
              className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
            >
              Sign in
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <p className="text-red-600 font-medium">{error}</p>
            <p className="text-sm text-gray-500">The link may be invalid or has expired.</p>
            <Link to="/register" className="text-indigo-600 hover:underline">
              Try registering again
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
