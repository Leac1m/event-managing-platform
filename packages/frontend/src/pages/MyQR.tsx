import { QRCodeSVG } from 'qrcode.react';
import { BadgeCheck, QrCode, ShieldCheck } from 'lucide-react';
import { trpc } from '../lib/trpc';

export default function MyQR() {
  const { data: qrData, isLoading } = trpc.getQRToken.useQuery();
  const { data: me } = trpc.me.useQuery();

  if (isLoading) {
    return (
      <div className="auth-shell">
        <div className="auth-card max-w-2xl text-center">
          <div className="panel panel-pad space-y-4">
            <div className="h-4 w-32 rounded-full bg-white/10" />
            <div className="mx-auto h-64 w-64 rounded-2xl bg-white/5" />
            <div className="h-4 w-3/4 rounded-full bg-white/10" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-shell">
      <div className="auth-card max-w-3xl">
        <div className="space-y-6 text-center">
          <div>
            <div className="eyebrow justify-center">
              <QrCode className="h-3.5 w-3.5" />
              Identity pass
            </div>
            <h1 className="hero-title text-[clamp(2rem,4vw,3.2rem)]">Your personal QR code.</h1>
            <p className="hero-copy mx-auto max-w-2xl">
              Present this code to an organizer so your attendance can be checked against event
              membership before your details are shown.
            </p>
          </div>

          <div className="auth-layout items-center">
            <div className="qr-frame">
              {qrData?.token && (
                <QRCodeSVG value={qrData.token} size={260} bgColor="#080b11" fgColor="#f0f2f8" />
              )}
            </div>

            <aside className="auth-aside text-left">
              <div className="auth-metric">
                <div>
                  <strong>Name</strong>
                  <span>
                    {me?.firstName} {me?.lastName}
                  </span>
                </div>
                <BadgeCheck size={18} className="text-[var(--color-success)]" />
              </div>
              <div className="auth-metric">
                <div>
                  <strong>Username</strong>
                  <span>{me?.username}</span>
                </div>
                <ShieldCheck size={18} className="text-[var(--color-primary)]" />
              </div>
              <p className="m-0 text-sm leading-6 text-[var(--color-text-secondary)]">
                Present this QR code at the event entrance. It only reveals your details when you
                are registered for that specific event.
              </p>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
