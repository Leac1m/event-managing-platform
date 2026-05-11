import { Link } from 'react-router-dom';
import { trpc } from '../lib/trpc';

export default function Dashboard() {
  const { data: me, isLoading: meLoading } = trpc.me.useQuery();
  const { data: events, isLoading: eventsLoading } = trpc.getEvents.useQuery();
  const { data: myEvents, isLoading: myEventsLoading } = trpc.getMyEvents.useQuery();

  if (meLoading || eventsLoading || myEventsLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {me?.username}!</h1>
        <p className="mt-2 text-gray-600">Explore events or manage yours.</p>
      </div>

      <section>
        <h2 className="text-2xl font-semibold mb-4">My Events</h2>
        {myEvents?.length === 0 ? (
          <p className="text-gray-500 italic">You haven't joined or created any events yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {myEvents?.map((event) => (
              <div
                key={event.id}
                className="bg-white p-6 rounded-lg shadow hover:shadow-md transition border-l-4 border-indigo-500"
              >
                <h3 className="text-lg font-bold">{event.name}</h3>
                <p className="text-sm text-gray-500 line-clamp-2">{event.description}</p>
                <div className="mt-4 flex justify-between items-center">
                  <Link
                    to={`/events/${event.id}`}
                    className="text-indigo-600 hover:underline text-sm font-medium"
                  >
                    View Details
                  </Link>
                  <Link
                    to={`/events/${event.id}/scan`}
                    className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded text-xs"
                  >
                    Organizer View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Available Events</h2>
        {events?.length === 0 ? (
          <p className="text-gray-500 italic">No public events available at the moment.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events?.map((event) => (
              <div
                key={event.id}
                className="bg-white p-6 rounded-lg shadow hover:shadow-md transition"
              >
                <h3 className="text-lg font-bold">{event.name}</h3>
                <p className="text-sm text-gray-500 line-clamp-2">{event.description}</p>
                <div className="mt-4">
                  <Link
                    to={`/events/${event.id}`}
                    className="text-indigo-600 hover:underline text-sm font-medium"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
