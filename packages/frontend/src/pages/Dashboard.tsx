import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Globe,
  Lock,
  Plus,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { trpc } from '../lib/trpc';

type EventCardData = {
  id: string;
  name: string;
  description: string;
  location?: string | null;
  startTime: string | Date;
  endTime: string | Date;
  type: 'open' | 'private';
  status: 'draft' | 'published';
};

function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat('en', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

function statusBadge(status: EventCardData['status']) {
  return status === 'published' ? 'badge badge--success' : 'badge badge--warning';
}

function typeBadge(type: EventCardData['type']) {
  return type === 'open' ? 'badge badge--info' : 'badge badge--neutral';
}

function EventCard({ event }: { event: EventCardData }) {
  return (
    <article className="event-card">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <span className={statusBadge(event.status)}>{event.status}</span>
          <span className={typeBadge(event.type)}>
            {event.type === 'open' ? (
              <>
                <Globe size={12} />
                Open
              </>
            ) : (
              <>
                <Lock size={12} />
                Private
              </>
            )}
          </span>
        </div>
        <div className="badge badge--primary">
          <CalendarDays size={12} />
          Event
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="card-title">{event.name}</h3>
        <p className="card-description">{event.description}</p>
      </div>

      <div className="meta-grid">
        <div className="meta-item">
          <Clock3 size={16} className="mt-0.5 shrink-0 text-[var(--color-primary)]" />
          <div>
            <strong>Starts</strong>
            {formatDate(event.startTime)}
          </div>
        </div>
        <div className="meta-item">
          <Clock3 size={16} className="mt-0.5 shrink-0 text-[var(--color-text-secondary)]" />
          <div>
            <strong>Ends</strong>
            {formatDate(event.endTime)}
          </div>
        </div>
        <div className="meta-item">
          <ShieldCheck size={16} className="mt-0.5 shrink-0 text-[var(--color-primary)]" />
          <div>
            <strong>Location</strong>
            {event.location || 'Online'}
          </div>
        </div>
        <div className="meta-item">
          <Users size={16} className="mt-0.5 shrink-0 text-[var(--color-text-secondary)]" />
          <div>
            <strong>Visibility</strong>
            {event.status === 'published' ? 'Live on the dashboard' : 'Draft only'}
          </div>
        </div>
      </div>

      <div className="button-row mt-auto">
        <Link to={`/events/${event.id}`} className="btn btn--primary">
          View details
          <ArrowRight size={16} />
        </Link>
      </div>
    </article>
  );
}

export default function Dashboard() {
  const { data: me, isLoading: meLoading } = trpc.me.useQuery();
  const { data: events, isLoading: eventsLoading } = trpc.getEvents.useQuery();
  const { data: myEvents, isLoading: myEventsLoading } = trpc.getMyEvents.useQuery();

  if (meLoading || eventsLoading || myEventsLoading) {
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
        <div className="section-grid">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="event-card animate-pulse">
              <div className="h-4 w-32 rounded-full bg-white/10" />
              <div className="h-6 w-3/4 rounded-full bg-white/10" />
              <div className="h-4 w-full rounded-full bg-white/10" />
              <div className="h-24 rounded-xl bg-white/5" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const joinedCount = myEvents?.length ?? 0;
  const publishedCount = events?.length ?? 0;

  return (
    <div className="space-y-8">
      <section className="page-hero">
        <div>
          <div className="eyebrow">
            <Sparkles className="h-3.5 w-3.5" />
            Live overview
          </div>
          <h1 className="hero-title">Welcome back, {me?.firstName || me?.username}.</h1>
          <p className="hero-copy">
            Track your joined events, browse what is live now, and jump straight into hosting or
            scanning without leaving the dashboard.
          </p>

          <div className="button-row mt-6">
            <Link to="/create-event" className="btn btn--primary">
              <Plus size={16} />
              Create event
            </Link>
            <Link to="/my-qr" className="btn btn--secondary">
              <ScanLine size={16} />
              Open my QR
            </Link>
          </div>
        </div>

        <div className="panel panel-pad space-y-4">
          <div>
            <div className="eyebrow mb-2">
              <ShieldCheck className="h-3.5 w-3.5" />
              Account snapshot
            </div>
            <h2 className="panel-title">Everything you need at a glance</h2>
            <p className="panel-subtitle">A compact view of your event activity and current reach.</p>
          </div>

          <div className="stat-grid">
            <div className="stat-card">
              <span className="stat-label">Joined events</span>
              <span className="stat-value">{joinedCount}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Live events</span>
              <span className="stat-value">{publishedCount}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <div className="eyebrow">
            <Users className="h-3.5 w-3.5" />
            Your events
          </div>
          <h2 className="panel-title">Memberships and hosted events</h2>
        </div>

        {myEvents?.length === 0 ? (
          <div className="empty-state">You have not joined or created any events yet.</div>
        ) : (
          <div className="section-grid">
            {myEvents?.map((event) => (
              <EventCard key={event.id} event={event as EventCardData} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <div className="eyebrow">
            <Globe className="h-3.5 w-3.5" />
            Available now
          </div>
          <h2 className="panel-title">Published events on the platform</h2>
        </div>

        {events?.length === 0 ? (
          <div className="empty-state">No public events are available at the moment.</div>
        ) : (
          <div className="section-grid">
            {events?.map((event) => (
              <EventCard key={event.id} event={event as EventCardData} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
