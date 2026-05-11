import { trpc } from '../lib/trpc';

export default function Dashboard() {
  const { data: me, isLoading } = trpc.me.useQuery();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Welcome, {me?.username || 'Guest'}</h1>
      <p className="mt-2 text-gray-600">You are logged in to the Event Management Platform.</p>
    </div>
  );
}
