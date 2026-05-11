import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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

  if (isLoading) return <div>Loading...</div>;
  if (!event) return <div>Event not found</div>;

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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-lg shadow">
        <h1 className="text-3xl font-bold text-gray-900">{event.name}</h1>
        <p className="mt-4 text-gray-600">{event.description}</p>

        <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-gray-500">
          <div>
            <span className="font-semibold">Location:</span> {event.location || 'Online'}
          </div>
          <div>
            <span className="font-semibold">Type:</span> {event.type}
          </div>
          <div>
            <span className="font-semibold">Starts:</span>{' '}
            {new Date(event.startTime).toLocaleString()}
          </div>
          <div>
            <span className="font-semibold">Ends:</span> {new Date(event.endTime).toLocaleString()}
          </div>
        </div>

        <div className="mt-8">
          {isJoined ? (
            <div className="bg-green-50 text-green-700 p-4 rounded-md font-medium">
              You are registered for this event!
              <div className="mt-2">
                <Link to="/my-qr" className="text-indigo-600 hover:underline">
                  Show my QR code
                </Link>
              </div>
            </div>
          ) : (
            <div>
              {event.type === 'open' ? (
                <button
                  onClick={handleJoin}
                  disabled={joinMutation.isPending}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {joinMutation.isPending ? 'Joining...' : 'Join Event'}
                </button>
              ) : (
                <form onSubmit={handleJoinPrivate} className="space-y-4">
                  <div className="max-w-xs">
                    <label className="block text-sm font-medium text-gray-700">
                      Enter Passcode
                    </label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={joinPrivateMutation.isPending}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {joinPrivateMutation.isPending ? 'Joining...' : 'Join Private Event'}
                  </button>
                </form>
              )}
            </div>
          )}
          {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}
        </div>
      </div>
    </div>
  );
}
