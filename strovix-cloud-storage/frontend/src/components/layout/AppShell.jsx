import { NavLink, useNavigate } from 'react-router-dom';
import {
  Cloud,
  HardDrive,
  Share2,
  Star,
  Trash2,
  LayoutDashboard,
  Menu,
  X,
  User,
  LogOut,
  Search,
  Command,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { StorageIndicator } from '../common/ui.jsx';
import { ThemeToggle } from '../common/ThemeToggle.jsx';
import { LogoutConfirmationModal } from '../auth/LogoutConfirmationModal.jsx';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '../../services/publicLink.api.js';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/drive', label: 'My Drive', icon: HardDrive },
  { to: '/shared', label: 'Shared with me', icon: Share2 },
  { to: '/starred', label: 'Starred', icon: Star },
  { to: '/trash', label: 'Trash', icon: Trash2 },
];

export function AppShell({ children }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [q, setQ] = useState('');
  const navigate = useNavigate();
  const storageQuery = useQuery({
    queryKey: ['storage'],
    queryFn: () => userApi.storage().then((r) => r.data),
  });

  const onSearch = (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    navigate(`/search?q=${encodeURIComponent(q.trim())}`);
    setOpen(false);
  };

  const handleLogoutConfirm = async () => {
    await logout();
    setLogoutOpen(false);
    setOpen(false);
    navigate('/login', { replace: true });
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  const Sidebar = (
    <aside className="flex h-full w-64 flex-col border-r border-slate-200/80 bg-white/90 shadow-[4px_0_24px_rgba(15,23,42,0.03)] backdrop-blur-md transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900/95 dark:shadow-none">
      <div className="flex shrink-0 items-center gap-3 border-b border-slate-100 px-6 py-5 dark:border-slate-800">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-500 via-blue-600 to-indigo-500 text-white shadow-md shadow-blue-500/25">
          <Cloud size={22} className="animate-pulse" />
        </div>
        <div>
          <p className="font-[family-name:var(--font-display)] text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Strovix
          </p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Cloud Drive
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1.5 px-3.5 py-4">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={19}
                  className={
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'
                  }
                />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto space-y-3 border-t border-slate-100 bg-slate-50/40 p-4 dark:border-slate-800 dark:bg-slate-900/50">
        {storageQuery.data && (
          <StorageIndicator used={storageQuery.data.storageUsed} quota={storageQuery.data.storageQuota} />
        )}

        <button
          type="button"
          onClick={() => {
            navigate('/profile');
            setOpen(false);
          }}
          className="flex w-full items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-2.5 text-left text-xs font-medium transition hover:border-slate-300 hover:shadow-xs dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 font-bold text-white shadow-xs">
            {userInitial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold text-slate-800 dark:text-slate-100">{user?.name || 'User'}</p>
            <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">{user?.email}</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setLogoutOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
        >
          <LogOut size={15} />
          Logout
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-dvh max-h-dvh overflow-hidden bg-slate-50/50 transition-colors duration-300 dark:bg-slate-950">
      <div className="hidden h-full shrink-0 md:block">{Sidebar}</div>

      {open && (
        <div className="fixed inset-0 z-50 flex animate-fade-up md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 h-full">{Sidebar}</div>
        </div>
      )}

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="z-30 flex shrink-0 items-center gap-3 border-b border-slate-200/80 bg-white/80 px-4 py-3 shadow-xs backdrop-blur-md transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900/80 sm:px-5">
          <button
            type="button"
            className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 md:hidden dark:text-slate-300 dark:hover:bg-slate-800"
            onClick={() => setOpen(true)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>

          <form onSubmit={onSearch} className="relative min-w-0 flex-1 max-w-xl">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
              size={18}
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search files, folders and documents..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 py-2.5 pl-11 pr-12 text-xs font-medium text-slate-800 shadow-inner outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:bg-slate-800 sm:text-sm"
            />
            <div className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-bold text-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-500 sm:flex">
              <Command size={10} /> K
            </div>
          </form>

          <ThemeToggle className="ml-auto shrink-0" />
        </header>

        <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-4 transition-colors duration-300 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      <LogoutConfirmationModal
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={handleLogoutConfirm}
      />
    </div>
  );
}

export default AppShell;
