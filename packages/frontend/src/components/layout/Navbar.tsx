import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarDays, LayoutDashboard, LogOut, QrCode, Sparkles, Menu, X } from 'lucide-react';
import { trpc } from '../../lib/trpc';
import { useToast } from '../../components/ui/toast';

export default function Navbar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { data: me } = trpc.me.useQuery();
  const { pushToast } = useToast();

  const handleLogout = () => {
    localStorage.removeItem('token');
    pushToast({
      title: 'Signed out',
      description: 'Your session has been cleared.',
      variant: 'info',
    });
    navigate('/login');
    setSidebarOpen(false);
  };

  const closeSidebar = () => setSidebarOpen(false);

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setSidebarOpen(false);
      }
    };

    if (sidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [sidebarOpen]);

  return (
    <nav className="sticky top-0 z-20 border-b border-white/5 bg-[#080b11]/85 backdrop-blur-xl">
      <div className="page-shell !py-4">
        <div className="surface flex flex-col gap-4 rounded-[var(--radius-xl)] px-4 py-3 md:flex-row md:items-center md:justify-between">
          {/* Logo */}
          <div className="flex items-center justify-between md:gap-4">
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

            {/* Hamburger Menu - Mobile Only */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-lg hover:bg-white/5 transition-colors"
              aria-label="Toggle menu"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex flex-wrap items-center gap-2">
            {me && (
              <>
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
              </>
            )}
          </div>

          {/* Desktop User Section */}
          <div className="hidden md:flex flex-wrap items-center gap-3">
            {me ? (
              <>
                <div className="badge badge--primary">
                  <span className="h-2 w-2 rounded-full bg-[var(--color-primary)] shadow-[var(--shadow-glow-primary)]" />
                  {me.username}
                </div>
                <button
                  onClick={handleLogout}
                  className="btn btn--secondary text-sm"
                  aria-label="Logout"
                >
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

        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
              onClick={closeSidebar}
            />

            {/* Sidebar Panel */}
            <div
              ref={sidebarRef}
              className="fixed left-0 top-[calc(var(--navbar-height,80px))] w-64 max-w-[80vw] border-r border-white/5 bg-[#080b11]/95 backdrop-blur-xl shadow-xl animate-in slide-in-from-left duration-300 md:hidden flex flex-col gap-2 p-4 max-h-[calc(100vh-80px)] overflow-y-auto"
            >
              {me && (
                <>
                  <Link
                    to="/"
                    onClick={closeSidebar}
                    className="btn btn--ghost text-sm justify-start"
                  >
                    <LayoutDashboard size={16} />
                    Dashboard
                  </Link>
                  <Link
                    to="/create-event"
                    onClick={closeSidebar}
                    className="btn btn--ghost text-sm justify-start"
                  >
                    <CalendarDays size={16} />
                    Create Event
                  </Link>
                  <Link
                    to="/my-qr"
                    onClick={closeSidebar}
                    className="btn btn--ghost text-sm justify-start"
                  >
                    <QrCode size={16} />
                    My QR
                  </Link>
                  <div className="border-t border-white/5 my-2" />
                  <div className="badge badge--primary justify-start">
                    <span className="h-2 w-2 rounded-full bg-[var(--color-primary)] shadow-[var(--shadow-glow-primary)]" />
                    {me.username}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="btn btn--secondary text-sm justify-start"
                    aria-label="Logout"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </>
              )}

              {!me && (
                <Link
                  to="/login"
                  onClick={closeSidebar}
                  className="btn btn--secondary text-sm justify-start"
                >
                  Sign in
                </Link>
              )}
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
