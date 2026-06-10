import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, Navigate, NavLink, Route, Routes } from 'react-router-dom';
import { api } from './lib/api';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import Login from './pages/Login';

export default function App() {
  const queryClient = useQueryClient();
  const session = useQuery({ queryKey: ['me'], queryFn: api.me });
  const authenticated = session.data?.authenticated ?? false;

  // Set the session synchronously so the /jobs route guard doesn't redirect
  // off stale data while a refetch is in flight.
  const onLogin = () => queryClient.setQueryData(['me'], { authenticated: true });

  const logout = async () => {
    await api.logout();
    queryClient.removeQueries({ queryKey: ['jobs'] });
    queryClient.removeQueries({ queryKey: ['job-stats'] });
    queryClient.setQueryData(['me'], { authenticated: false });
  };

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-3 py-1.5 text-sm font-medium ${isActive ? 'bg-card text-ink' : 'text-ink-dim hover:text-ink'}`;

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16">
      <header className="flex items-center justify-between py-6">
        <Link to="/" className="text-lg font-bold">
          Dev Portfolio <span className="text-accent">Dashboard</span>
        </Link>
        <nav className="flex items-center gap-1">
          <NavLink to="/" end className={navClass}>
            Overview
          </NavLink>
          {/* Job tracker is fully private: the tab only exists once logged in. */}
          {authenticated && (
            <NavLink to="/jobs" className={navClass}>
              Job Tracker
            </NavLink>
          )}
          {authenticated ? (
            <button onClick={logout} className="ml-2 text-sm text-ink-dim hover:text-ink">
              Log out
            </button>
          ) : (
            <NavLink to="/login" className={navClass}>
              Admin
            </NavLink>
          )}
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login onLogin={onLogin} />} />
        <Route
          path="/jobs"
          element={
            session.isPending ? null : authenticated ? <Jobs /> : <Navigate to="/login" replace />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
