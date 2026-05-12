import { Link, useNavigate } from 'react-router-dom';
import { CalendarDays, LayoutDashboard, LogOut, QrCode, Sparkles } from 'lucide-react';
import { trpc } from '../../lib/trpc';

export default function Navbar() {
  const navigate = useNavigate();
  const { data: me } = trpc.me.useQuery();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-20 border-b border-white/5 bg-[#080b11]/85 backdrop-blur-xl">
      <div className="page-shell !py-4">
        <div className="surface flex flex-col gap-4 rounded-[var(--radius-xl)] px-4 py-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[rgba(0,229,180,0.12)] text-[var(--color-primary)] shadow-[var(--shadow-glow-primary)]">
                <Sparkles size={18} />
              </div>
              <div>
                <p className="m-0 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">
                  Pulse
                </p>
                <p className="m-0 font-[Syne] text-lg tracking-[-0.03em] text-[var(--color-text-primary)]">
                  Event Platform
                </p>
              </div>
            </Link>

            {me && (
              <div className="flex flex-wrap items-center gap-2">
                <Link to="/" className="btn btn--ghost text-sm">
                  <LayoutDashboard size={16} />
                  Dashboard
                </Link>
                <Link to="/create-event" className="btn btn--ghost text-sm">
                  <CalendarDays size={16} />
                  Create Event
                </Link>
                <Link to="/my-qr" className="btn btn--ghost text-sm">
                  <QrCode size={16} />
                  My QR
                </Link>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {me ? (
              <>
                <div className="badge badge--primary">
                  <span className="h-2 w-2 rounded-full bg-[var(--color-primary)] shadow-[var(--shadow-glow-primary)]" />
                  {me.username}
                </div>
                <button onClick={handleLogout} className="btn btn--secondary text-sm" aria-label="Logout">
                  <LogOut size={16} />
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="btn btn--secondary text-sm">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
