import { Navigate, Outlet, Route, Routes, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { LoadingSpinner } from '../components/common/ui.jsx';
import { AppShell } from '../components/layout/AppShell.jsx';
import Login from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import MyDrive from '../pages/MyDrive.jsx';
import SharedWithMe from '../pages/SharedWithMe.jsx';
import Starred from '../pages/Starred.jsx';
import Trash from '../pages/Trash.jsx';
import Search from '../pages/Search.jsx';
import Profile from '../pages/Profile.jsx';
import PublicShare from '../pages/PublicShare.jsx';

function ProtectedLayout() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingSpinner label="Loading session..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

function OAuthCallback() {
  const [params] = useSearchParams();
  const { setSessionFromOAuth } = useAuth();

  useEffect(() => {
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    if (accessToken && refreshToken) {
      setSessionFromOAuth(accessToken, refreshToken);
    }
  }, [params, setSessionFromOAuth]);

  return <Navigate to="/dashboard" replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/share/:token" element={<PublicShare />} />
      <Route path="/oauth/callback" element={<OAuthCallback />} />

      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/drive" element={<MyDrive />} />
        <Route path="/shared" element={<SharedWithMe />} />
        <Route path="/starred" element={<Starred />} />
        <Route path="/trash" element={<Trash />} />
        <Route path="/search" element={<Search />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
