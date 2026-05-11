import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { trpc } from '../lib/trpc';

export default function ScanEvent() {
  const { id } = useParams<{ id: string }>();
  const [scanResult, setScanResult] = useState<{
    user: {
      username: string;
      firstName: string;
      lastName: string;
      department: string;
      matricNumber?: string | null;
      profileUrl?: string | null;
    };
  } | null>(null);
  const [error, setError] = useState('');

  const scanMutation = trpc.scanQR.useMutation({
    onSuccess: (data) => {
      setScanResult(data);
      setError('');
    },
    onError: (err) => {
      setError(err.message);
      setScanResult(null);
    },
  });

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'reader',
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false,
    );

    scanner.render(
      (decodedText) => {
        scanMutation.mutate({ eventId: id as string, token: decodedText });
      },
      (_err) => {
        // Silently ignore scan errors (no QR found in frame)
      },
    );

    return () => {
      scanner.clear().catch((error) => console.error('Failed to clear scanner', error));
    };
  }, [id]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">Scan Attendee QR</h1>
        <div id="reader" className="w-full"></div>

        {scanMutation.isPending && (
          <p className="mt-4 text-indigo-600 animate-pulse text-center">Verifying QR...</p>
        )}

        {error && <div className="mt-4 bg-red-50 text-red-700 p-4 rounded-md">{error}</div>}

        {scanResult && (
          <div className="mt-4 bg-green-50 text-green-700 p-6 rounded-md border border-green-200">
            <h2 className="text-xl font-bold mb-2">Access Granted!</h2>
            <div className="space-y-1">
              <p>
                <span className="font-semibold">Name:</span> {scanResult.user.firstName}{' '}
                {scanResult.user.lastName}
              </p>
              <p>
                <span className="font-semibold">Username:</span> {scanResult.user.username}
              </p>
              <p>
                <span className="font-semibold">Department:</span> {scanResult.user.department}
              </p>
              <p>
                <span className="font-semibold">Matric Number:</span>{' '}
                {scanResult.user.matricNumber || 'N/A'}
              </p>
            </div>
            <button
              onClick={() => setScanResult(null)}
              className="mt-4 text-sm underline hover:text-green-800"
            >
              Clear and scan next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
