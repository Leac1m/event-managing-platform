import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowRight,
  Clock3,
  Globe,
  Lock,
  MapPin,
  ScanLine,
  Settings2,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserPlus,
} from 'lucide-react';
import { trpc } from '../lib/trpc';
import { useToast } from '../components/ui/toast';

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [organizerForm, setOrganizerForm] = useState({ username: '', email: '' });

  const eventId = id as string;
  const { data: event, isLoading, refetch } = trpc.getEventDetails.useQuery(eventId);
  const { data: myEvents } = trpc.getMyEvents.useQuery();
  const { data: role } = trpc.getMyEventRole.useQuery(eventId, { enabled: Boolean(eventId) });
  const { data: attendance, refetch: refetchAttendance } = trpc.getAttendance.useQuery(eventId, {
    enabled: role?.role === 'creator' || role?.role === 'organizer',
  });

  const joinMutation = trpc.joinEvent.useMutation({
    onSuccess: () => {
      pushToast({ title: 'Joined event', description: 'Your membership has been recorded.', variant: 'success' });
      refetch();
    },
    onError: (err) => {
      setError(err.message);
      pushToast({ title: 'Could not join event', description: err.message, variant: 'error' });
    },
  });

  const joinPrivateMutation = trpc.joinPrivateEvent.useMutation({
    onSuccess: () => {
      pushToast({
        title: 'Joined private event',
        description: 'You can now access the event QR pass.',
        variant: 'success',
      });
      refetch();
    },
    onError: (err) => {
      setError(err.message);
      pushToast({ title: 'Could not join event', description: err.message, variant: 'error' });
    },
  });

  const publishEventMutation = trpc.publishEvent.useMutation({
    onSuccess: () => {
      pushToast({
        title: 'Event published',
        description: 'The event is now visible on the dashboard.',
        variant: 'success',
      });
      refetch();
    },
    onError: (err) => {
      pushToast({ title: 'Publish failed', description: err.message, variant: 'error' });
    },
  });

  const deleteEventMutation = trpc.deleteEvent.useMutation({
    onSuccess: () => {
      pushToast({ title: 'Event deleted', description: 'The event has been removed.', variant: 'info' });
      navigate('/');
    },
    onError: (err) => {
      pushToast({ title: 'Delete failed', description: err.message, variant: 'error' });
    },
  });

  const addOrganizerMutation = trpc.addOrganizer.useMutation({
    onSuccess: () => {
      pushToast({
        title: 'Organizer added',
        description: 'The new organizer can now manage this event.',
        variant: 'success',
      });
      setOrganizerForm({ username: '', email: '' });
      refetch();
    },
    onError: (err) => {
      pushToast({ title: 'Could not add organizer', description: err.message, variant: 'error' });
    },
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
  const isOrganizer = role?.role === 'organizer' || role?.role === 'creator';
  const isCreator = role?.role === 'creator';

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

  const handleAddOrganizer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCreator) {
      return;
    }
    addOrganizerMutation.mutate({
      eventId: event.id,
      username: organizerForm.username,
      email: organizerForm.email,
    });
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

        {isOrganizer && (
          <div className="panel panel-pad space-y-5 border-[rgba(0,229,180,0.18)] bg-[rgba(255,255,255,0.03)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="eyebrow mb-2">
                  <Settings2 className="h-3.5 w-3.5" />
                  Admin tools
                </div>
                <h2 className="panel-title">Manage this event</h2>
                <p className="panel-subtitle">Publish the event, review attendance, and add another organizer.</p>
              </div>
              <span className="badge badge--primary">{role?.role}</span>
            </div>

            <div className="button-row">
              {event.status === 'draft' && (
                <button
                  type="button"
                  onClick={() => publishEventMutation.mutate(event.id)}
                  disabled={publishEventMutation.isPending}
                  className="btn btn--primary"
                >
                  <Sparkles size={16} />
                  {publishEventMutation.isPending ? 'Publishing...' : 'Publish event'}
                </button>
              )}
              <button
                type="button"
                onClick={() => deleteEventMutation.mutate(event.id)}
                disabled={deleteEventMutation.isPending}
                className="btn btn--danger"
              >
                <Trash2 size={16} />
                {deleteEventMutation.isPending ? 'Deleting...' : 'Delete event'}
              </button>
            </div>

            {isCreator && (
              <form onSubmit={handleAddOrganizer} className="space-y-4">
                <div className="eyebrow mb-0">
                  <UserPlus className="h-3.5 w-3.5" />
                  Add organizer
                </div>
                <div className="field-grid field-grid--two">
                  <div className="field-group">
                    <label className="field-label" htmlFor="organizer-username">
                      Username
                    </label>
                    <input
                      id="organizer-username"
                      type="text"
                      className="field"
                      value={organizerForm.username}
                      onChange={(e) => setOrganizerForm((current) => ({ ...current, username: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="field-group">
                    <label className="field-label" htmlFor="organizer-email">
                      Email
                    </label>
                    <input
                      id="organizer-email"
                      type="email"
                      className="field"
                      value={organizerForm.email}
                      onChange={(e) => setOrganizerForm((current) => ({ ...current, email: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn--secondary" disabled={addOrganizerMutation.isPending}>
                  <UserPlus size={16} />
                  {addOrganizerMutation.isPending ? 'Adding...' : 'Add organizer'}
                </button>
              </form>
            )}

            <div className="space-y-3">
              <div className="eyebrow mb-0">
                <ShieldCheck className="h-3.5 w-3.5" />
                Attendance
              </div>
              {attendance?.length ? (
                <div className="grid gap-3">
                  {attendance.map((record) => (
                    <div key={record.id} className="auth-metric items-start">
                      <div>
                        <strong>
                          {record.user.firstName} {record.user.lastName}
                        </strong>
                        <span>
                          @{record.user.username} · {record.user.department}
                          {record.user.matricNumber ? ` · ${record.user.matricNumber}` : ''}
                        </span>
                        <span>
                          Scanned {new Date(record.scannedAt).toLocaleString()} by {record.scanner?.username || 'organizer'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">No attendance has been recorded yet.</div>
              )}
              <button type="button" onClick={() => refetchAttendance()} className="btn btn--secondary w-fit">
                Refresh attendance
              </button>
            </div>
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
