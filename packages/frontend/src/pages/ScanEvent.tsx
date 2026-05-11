import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { AlertTriangle, BadgeCheck, QrCode, ScanLine } from 'lucide-react';
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
    <div className="space-y-6">
      <section className="page-hero">
        <div>
          <div className="eyebrow">
            <ScanLine className="h-3.5 w-3.5" />
            Scanner mode
          </div>
          <h1 className="hero-title">Scan attendee QR codes.</h1>
          <p className="hero-copy max-w-2xl">
            This view is for organizers. It checks membership first, then reveals the allowed
            profile details and records attendance.
          </p>
        </div>

        <div className="panel panel-pad space-y-3">
          <div className="auth-metric">
            <div>
              <strong>Security</strong>
              <span>Details show only for registered users</span>
            </div>
            <BadgeCheck size={18} className="text-[var(--color-success)]" />
          </div>
          <div className="auth-metric">
            <div>
              <strong>Feedback</strong>
              <span>Success and error states are surfaced immediately</span>
            </div>
            <AlertTriangle size={18} className="text-[var(--color-warning)]" />
          </div>
        </div>
      </section>

      <section className="auth-card mx-auto max-w-5xl">
        <div className="space-y-5">
          <div className="scan-frame">
            <div id="reader" className="w-full" />
          </div>

          {scanMutation.isPending && (
            <div className="panel panel-pad flex items-center justify-center gap-3 text-[var(--color-primary)]">
              <QrCode size={18} className="animate-pulse" />
              <p className="m-0">Verifying QR...</p>
            </div>
          )}

          {error && (
            <div className="panel panel-pad flex items-start gap-3 border-[rgba(255,77,109,0.25)] bg-[rgba(255,77,109,0.08)] text-[var(--color-accent)]">
              <AlertTriangle size={18} className="mt-0.5 shrink-0" />
              <p className="m-0">{error}</p>
            </div>
          )}

          {scanResult && (
            <div className="panel panel-pad space-y-4 border-[rgba(34,217,138,0.25)] bg-[rgba(34,217,138,0.06)]">
              <div className="flex items-center gap-3 text-[var(--color-success)]">
                <BadgeCheck size={22} />
                <h2 className="panel-title text-[var(--color-success)]">Access granted</h2>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <Detail label="Name" value={`${scanResult.user.firstName} ${scanResult.user.lastName}`} />
                <Detail label="Username" value={scanResult.user.username} />
                <Detail label="Department" value={scanResult.user.department} />
                <Detail label="Matric number" value={scanResult.user.matricNumber || 'N/A'} />
              </div>

              <button onClick={() => setScanResult(null)} className="btn btn--secondary w-fit">
                Clear and scan next
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="auth-metric items-start">
      <div>
        <strong>{label}</strong>
        <span>{value}</span>
      </div>
    </div>
  );
}
