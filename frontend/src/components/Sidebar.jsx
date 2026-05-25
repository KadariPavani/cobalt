import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  ListTodo,
  Search,
  LogOut,
  X,
  Shield,
  User as UserIcon,
} from 'lucide-react';

import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';
import { useLogout } from '@/hooks/useAuth';
import Avatar from './Avatar';
import Logo from './Logo';
import { cn } from '@/utils/cn';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects',  label: 'Projects',  icon: FolderKanban   },
  { to: '/tasks',     label: 'Tasks',     icon: ListTodo       },
  { to: '/search',    label: 'Search',    icon: Search         },
];

const RoleBadge = ({ role }) => {
  if (!role) return null;
  const isAdmin = role === 'admin';
  return (
    <span
      title={isAdmin ? 'Workspace admin — can manage every resource' : 'Member — can manage what you create or are assigned to'}
      className={cn(
        'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ring-1 ring-inset shrink-0',
        isAdmin
          ? 'bg-brand-500/10 text-brand-200 ring-brand-500/30'
          : 'bg-white/[0.04] text-slate-400 ring-white/10'
      )}
    >
      {isAdmin ? <Shield className="h-2.5 w-2.5" /> : <UserIcon className="h-2.5 w-2.5" />}
      {isAdmin ? 'Admin' : 'Member'}
    </span>
  );
};

export default function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen);
  const logout = useLogout();

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-surface-950/70 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={cn(
          'fixed lg:sticky top-0 z-40 h-screen w-[248px] shrink-0',
          'border-r border-white/[0.05] bg-surface-925/85 backdrop-blur',
          'flex flex-col transition-transform duration-200',
          'lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="h-14 px-4 flex items-center justify-between border-b border-white/[0.04]">
          <NavLink to="/dashboard" className="group">
            <Logo size="sm" />
          </NavLink>
          <button
            type="button"
            className="lg:hidden btn-icon"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-0.5">
          <p className="label px-3 pb-2">Workspace</p>
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  'group relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors',
                  isActive
                    ? 'bg-white/[0.06] text-slate-50'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.03]'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[2px] rounded-r-full bg-brand-500" />
                  )}
                  <Icon
                    className={cn(
                      'h-[15px] w-[15px] shrink-0',
                      isActive ? 'text-brand-400' : 'text-slate-500 group-hover:text-slate-300'
                    )}
                  />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="m-2 p-2.5 rounded-lg bg-surface-900/70 border border-white/[0.05] flex items-center gap-2.5">
          <Avatar name={user?.name} email={user?.email} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-[13px] font-medium truncate leading-tight">{user?.name}</p>
              <RoleBadge role={user?.role} />
            </div>
            <p className="text-[11.5px] text-slate-500 truncate">{user?.email}</p>
          </div>
          <button
            type="button"
            className="btn-icon"
            title="Sign out"
            onClick={() => logout.mutate()}
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>
    </>
  );
}
