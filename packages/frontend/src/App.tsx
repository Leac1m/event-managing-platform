import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import CreateEvent from './pages/CreateEvent';
import EventDetails from './pages/EventDetails';
import MyQR from './pages/MyQR';
import ScanEvent from './pages/ScanEvent';
import Navbar from './components/layout/Navbar';

import { trpc } from './lib/trpc';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: me, isLoading, isError } = trpc.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (isError || !me) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function Layout() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="page-shell">
        <Outlet />
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/create-event" element={<CreateEvent />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/events/:id/scan" element={<ScanEvent />} />
          <Route path="/my-qr" element={<MyQR />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
