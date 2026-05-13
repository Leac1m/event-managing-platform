import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { AlertTriangle, BadgeCheck, QrCode, ScanLine, Search } from 'lucide-react';
import { trpc } from '../lib/trpc';
import { useToast } from '../components/ui/toast';

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
  const [manualToken, setManualToken] = useState('');
  const { pushToast } = useToast();

  const scanMutation = trpc.scanQR.useMutation({
    onSuccess: (data) => {
      setScanResult(data);
      setError('');
      pushToast({
        title: 'Access granted',
        description: `${data.user.firstName} ${data.user.lastName} checked in successfully.`,
        variant: 'success',
      });
    },
    onError: (err) => {
      setError(err.message);
      setScanResult(null);
      pushToast({
        title: 'Scan failed',
        description: err.message,
        variant: 'error',
      });
    },
  });

  useEffect(() => {
    if (!id) return;

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
  }, [id, scanMutation]);

  const handleManualScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !manualToken.trim()) return;
    setError('');
    scanMutation.mutate({ eventId: id, token: manualToken.trim() });
  };

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

          <form onSubmit={handleManualScan} className="panel panel-pad space-y-4">
            <div className="field-group">
              <label className="field-label" htmlFor="manual-qr-token">
                Manual QR token
              </label>
              <input
                id="manual-qr-token"
                type="text"
                className="field"
                placeholder="Paste the decoded QR token here"
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
              />
              <p className="field-hint">
                Use this if the camera is unavailable or the attendee shared a token directly.
              </p>
            </div>
            <button
              type="submit"
              disabled={scanMutation.isPending}
              className="btn btn--secondary w-full sm:w-auto"
            >
              <Search size={16} />
              Verify manually
            </button>
          </form>

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

              {scanResult.user.profileUrl && (
                <div className="flex justify-center">
                  <img
                    src={scanResult.user.profileUrl}
                    alt={`${scanResult.user.firstName} ${scanResult.user.lastName}`}
                    className="h-32 w-32 rounded-full object-cover ring-2 ring-[var(--color-success)] ring-opacity-50"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22%23ccc%22%3E%3Cpath d=%22M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z%22/%3E%3C/svg%3E';
                    }}
                  />
                </div>
              )}

              <div className="grid gap-3 md:grid-cols-2">
                <Detail
                  label="Name"
                  value={`${scanResult.user.firstName} ${scanResult.user.lastName}`}
                />
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

      <div className="live-region" aria-live="polite" aria-atomic="true">
        {scanResult
          ? 'Access granted. Attendee details loaded.'
          : error
            ? `Scan error: ${error}`
            : ''}
      </div>
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
