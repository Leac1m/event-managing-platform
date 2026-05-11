import { Link, useNavigate } from 'react-router-dom';
import { trpc } from '../../lib/trpc';

export default function Navbar() {
  const navigate = useNavigate();
  const { data: me } = trpc.me.useQuery();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="bg-indigo-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold">
              EventPlatform
            </Link>
            {me && (
              <div className="hidden md:flex space-x-4">
                <Link to="/" className="hover:text-indigo-200">
                  Dashboard
                </Link>
                <Link to="/create-event" className="hover:text-indigo-200">
                  Create Event
                </Link>
                <Link to="/my-qr" className="hover:text-indigo-200">
                  My QR
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {me ? (
              <>
                <span className="text-sm font-medium">{me.username}</span>
                <button
                  onClick={handleLogout}
                  className="bg-indigo-700 hover:bg-indigo-800 px-3 py-1 rounded text-sm transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="hover:text-indigo-200">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
