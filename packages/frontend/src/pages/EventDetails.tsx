import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, Clock3, Globe, Lock, MapPin, ScanLine, ShieldCheck } from 'lucide-react';
import { trpc } from '../lib/trpc';

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  const { data: event, isLoading, refetch } = trpc.getEventDetails.useQuery(id as string);
  const { data: myEvents } = trpc.getMyEvents.useQuery();

  const joinMutation = trpc.joinEvent.useMutation({
    onSuccess: () => refetch(),
    onError: (err) => setError(err.message),
  });

  const joinPrivateMutation = trpc.joinPrivateEvent.useMutation({
    onSuccess: () => refetch(),
    onError: (err) => setError(err.message),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="page-hero">
          <div className="space-y-4">
            <div className="h-4 w-36 rounded-full bg-white/10" />
            <div className="h-12 w-4/5 rounded-2xl bg-white/10" />
            <div className="h-5 w-full max-w-2xl rounded-full bg-white/10" />
          </div>
          <div className="panel panel-pad space-y-3">
            <div className="h-4 w-28 rounded-full bg-white/10" />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="h-20 rounded-xl bg-white/5" />
              <div className="h-20 rounded-xl bg-white/5" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (!event)
    return <div className="empty-state">Event not found. It may have been deleted or is not public yet.</div>;

  const isJoined = myEvents?.some((e) => e.id === event.id);

  const handleJoin = () => {
    setError('');
    if (event.type === 'open') {
      joinMutation.mutate({ eventId: event.id });
    }
  };

  const handleJoinPrivate = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    joinPrivateMutation.mutate({ eventId: event.id, passcode });
  };

  return (
    <div className="space-y-6">
      <section className="page-hero">
        <div>
          <div className="eyebrow">
            {event.type === 'open' ? <Globe className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
            Event details
          </div>
          <h1 className="hero-title">{event.name}</h1>
          <p className="hero-copy">{event.description}</p>
        </div>

        <div className="panel panel-pad space-y-3">
          <div className="auth-metric">
            <div>
              <strong>Location</strong>
              <span>{event.location || 'Online'}</span>
            </div>
            <MapPin size={18} className="text-[var(--color-primary)]" />
          </div>
          <div className="auth-metric">
            <div>
              <strong>Schedule</strong>
              <span>
                {new Date(event.startTime).toLocaleString()} - {new Date(event.endTime).toLocaleString()}
              </span>
            </div>
            <Clock3 size={18} className="text-[var(--color-info)]" />
          </div>
          <div className="auth-metric">
            <div>
              <strong>Status</strong>
              <span>{event.type === 'open' ? 'Open to all members' : 'Passcode required'}</span>
            </div>
            <ShieldCheck size={18} className="text-[var(--color-success)]" />
          </div>
        </div>
      </section>

      <section className="panel panel-pad space-y-5 max-w-4xl">
        {isJoined ? (
          <div className="panel panel-pad border-[rgba(34,217,138,0.22)] bg-[rgba(34,217,138,0.06)]">
            <div className="flex items-center gap-3 text-[var(--color-success)]">
              <ShieldCheck size={20} />
              <h2 className="panel-title text-[var(--color-success)]">You are registered for this event</h2>
            </div>
            <p className="panel-subtitle mt-2">Open your QR pass when you arrive so organizers can verify attendance quickly.</p>
            <div className="button-row mt-4">
              <Link to="/my-qr" className="btn btn--primary">
                <ScanLine size={16} />
                Show my QR code
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {event.type === 'open' ? (
              <button onClick={handleJoin} disabled={joinMutation.isPending} className="btn btn--primary">
                {joinMutation.isPending ? 'Joining...' : 'Join event'}
                <ArrowRight size={16} />
              </button>
            ) : (
              <form onSubmit={handleJoinPrivate} className="space-y-4 max-w-md">
                <div className="field-group">
                  <label className="field-label" htmlFor="event-passcode-input">
                    Enter passcode
                  </label>
                  <input
                    id="event-passcode-input"
                    type="text"
                    className="field"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    required
                  />
                  <p className="field-hint">Ask the organizer for the private access code.</p>
                </div>
                <button type="submit" disabled={joinPrivateMutation.isPending} className="btn btn--primary">
                  {joinPrivateMutation.isPending ? 'Joining...' : 'Join private event'}
                  <ArrowRight size={16} />
                </button>
              </form>
            )}
          </div>
        )}

        {error && (
          <p className="text-sm text-[var(--color-accent)]" role="alert" aria-live="polite">
            {error}
          </p>
        )}
      </section>
    </div>
  );
}
