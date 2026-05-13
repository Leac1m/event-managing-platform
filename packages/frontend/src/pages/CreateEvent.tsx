import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Lock, MapPin, PlusCircle, Sparkles, TimerReset } from 'lucide-react';
import { trpc } from '../lib/trpc';
import { useToast } from '../components/ui/toast';

export default function CreateEvent() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    startTime: '',
    endTime: '',
    type: 'open' as 'open' | 'private',
    passcode: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { pushToast } = useToast();

  const createEventMutation = trpc.createEvent.useMutation({
    onSuccess: (data) => {
      pushToast({
        title: 'Event created',
        description: 'Your event details are ready to share.',
        variant: 'success',
      });
      navigate(`/events/${data.id}`);
    },
    onError: (err) => {
      setError(err.message);
      pushToast({
        title: 'Could not create event',
        description: err.message,
        variant: 'error',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (
      formData.startTime &&
      formData.endTime &&
      new Date(formData.endTime) <= new Date(formData.startTime)
    ) {
      setError('End time must be later than start time.');
      return;
    }
    createEventMutation.mutate({
      ...formData,
      startTime: new Date(formData.startTime),
      endTime: new Date(formData.endTime),
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-6">
      <section className="page-hero">
        <div>
          <div className="eyebrow">
            <PlusCircle className="h-3.5 w-3.5" />
            Create event
          </div>
          <h1 className="hero-title">Build a new event flow.</h1>
          <p className="hero-copy">
            Set the title, timing, access mode, and passcode in one place. The layout is tuned for
            fast onsite creation on a dark screen.
          </p>
        </div>

        <div className="panel panel-pad space-y-4">
          <div className="auth-metric">
            <div>
              <strong>Open events</strong>
              <span>Instant join for attendees</span>
            </div>
            <GlobeBadge />
          </div>
          <div className="auth-metric">
            <div>
              <strong>Private events</strong>
              <span>Gate with a shared passcode</span>
            </div>
            <LockBadge />
          </div>
        </div>
      </section>

      <section className="auth-card mx-auto w-full max-w-4xl">
        <div className="auth-layout">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="field-grid field-grid--two">
              <div className="field-group">
                <label className="field-label" htmlFor="event-name">
                  Event name
                </label>
                <input
                  id="event-name"
                  name="name"
                  type="text"
                  required
                  className="field"
                  placeholder="Pulse Tech Meetup"
                  onChange={handleChange}
                />
              </div>
              <div className="field-group">
                <label className="field-label" htmlFor="event-location">
                  Location
                </label>
                <input
                  id="event-location"
                  name="location"
                  type="text"
                  className="field"
                  placeholder="Hall B, Onsite Campus"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="event-description">
                Description
              </label>
              <textarea
                id="event-description"
                name="description"
                required
                rows={5}
                className="field--area"
                placeholder="Describe what attendees should expect, who should come, and any important entry details."
                onChange={handleChange}
              />
            </div>

            <div className="field-grid field-grid--two">
              <div className="field-group">
                <label className="field-label" htmlFor="event-start-time">
                  Start time
                </label>
                <input
                  id="event-start-time"
                  name="startTime"
                  type="datetime-local"
                  required
                  className="field"
                  onChange={handleChange}
                />
              </div>
              <div className="field-group">
                <label className="field-label" htmlFor="event-end-time">
                  End time
                </label>
                <input
                  id="event-end-time"
                  name="endTime"
                  type="datetime-local"
                  required
                  className="field"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="field-grid field-grid--two">
              <div className="field-group">
                <label className="field-label" htmlFor="event-type">
                  Event type
                </label>
                <select
                  id="event-type"
                  name="type"
                  className="field--select"
                  onChange={handleChange}
                  value={formData.type}
                >
                  <option value="open">Open</option>
                  <option value="private">Private</option>
                </select>
              </div>
              {formData.type === 'private' ? (
                <div className="field-group">
                  <label className="field-label" htmlFor="event-passcode">
                    Passcode
                  </label>
                  <input
                    id="event-passcode"
                    name="passcode"
                    type="text"
                    required
                    className="field"
                    placeholder="VIP2026"
                    onChange={handleChange}
                  />
                  <p className="field-hint">
                    Share this only with the people who should be able to join.
                  </p>
                </div>
              ) : (
                <div className="field-group">
                  <label className="field-label">Access</label>
                  <div className="auth-aside h-full justify-center">
                    <p className="m-0 text-sm text-[var(--color-text-secondary)]">
                      Open events appear in the public feed and can be joined without a passcode.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <p className="text-sm text-[var(--color-accent)]" role="alert" aria-live="polite">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={createEventMutation.isPending}
              className="btn btn--primary w-full"
            >
              <Sparkles size={16} />
              {createEventMutation.isPending ? 'Creating...' : 'Create event'}
            </button>
          </form>

          <aside className="auth-aside">
            <div className="eyebrow mb-0">
              <CalendarDays className="h-3.5 w-3.5" />
              Quick notes
            </div>
            <div className="auth-metric">
              <div>
                <strong>Timing</strong>
                <span>Use the same timezone attendees will see</span>
              </div>
              <TimerReset size={18} className="text-[var(--color-primary)]" />
            </div>
            <div className="auth-metric">
              <div>
                <strong>Location</strong>
                <span>Leave blank for a fully online event</span>
              </div>
              <MapPin size={18} className="text-[var(--color-info)]" />
            </div>
            <div className="auth-metric">
              <div>
                <strong>Privacy</strong>
                <span>Private events require a shared passcode</span>
              </div>
              <Lock size={18} className="text-[var(--color-accent)]" />
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

function GlobeBadge() {
  return <span className="badge badge--info">Open</span>;
}

function LockBadge() {
  return <span className="badge badge--neutral">Private</span>;
}
