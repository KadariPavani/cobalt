import { Outlet, Navigate } from 'react-router-dom';
import { Check } from 'lucide-react';

import { useAuthStore } from '@/store/authStore';
import Logo from '@/components/Logo';

const HIGHLIGHTS = [
  'Kanban boards with one-drag status changes',
  'Real-time priority, due-date, and overdue tracking',
  'Workspace-wide search across every project and task',
];

export default function AuthLayout() {
  const isAuthed = useAuthStore((s) => Boolean(s.accessToken && s.user));
  if (isAuthed) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.05fr_1fr]">
      {/* Marketing panel */}
      <aside className="hidden lg:flex flex-col justify-between p-10 xl:p-14 relative overflow-hidden border-r border-white/[0.05] bg-surface-925/40">
        <div
          className="absolute inset-0 -z-10 opacity-90"
          style={{
            backgroundImage:
              'radial-gradient(700px 380px at 80% 0%, rgba(59,107,247,0.18), transparent 70%), radial-gradient(500px 300px at 0% 100%, rgba(28,51,135,0.18), transparent 70%)',
          }}
        />
        <div
          className="absolute inset-0 -z-10 opacity-40"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.025) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        <Logo size="md" />

        <div className="space-y-7 max-w-md">
          <div className="space-y-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-brand-300 font-medium">
              Project & Task OS
            </p>
            <h1 className="font-display text-[44px] leading-[1.05] tracking-tightest text-balance text-slate-50">
              Plan, track, and ship — without the planning overhead.
            </h1>
            <p className="text-[14.5px] text-slate-400 leading-relaxed max-w-sm">
              Cobalt keeps your roadmap, sprints, and team in one focused workspace —
              built for teams who care about how their tools feel.
            </p>
          </div>
          <ul className="space-y-2">
            {HIGHLIGHTS.map((h) => (
              <li key={h} className="flex items-center gap-2.5 text-[13.5px] text-slate-300">
                <span className="h-4 w-4 rounded-full bg-brand-500/15 ring-1 ring-inset ring-brand-500/40 grid place-items-center">
                  <Check className="h-2.5 w-2.5 text-brand-300" strokeWidth={3} />
                </span>
                {h}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-between text-[11.5px] text-slate-500">
          <span>© {new Date().getFullYear()} Cobalt Labs.</span>
          <span className="font-mono">v1.0</span>
        </div>
      </aside>

      {/* Form panel */}
      <main className="flex flex-col p-6 sm:p-10">
        <div className="lg:hidden mb-10">
          <Logo size="md" />
        </div>
        <div className="flex-1 flex items-center">
          <div className="w-full max-w-[400px] mx-auto">
            <Outlet />
          </div>
        </div>
        <div className="hidden lg:flex justify-end text-[11.5px] text-slate-600">
          Need help? <a className="ml-1 text-slate-500 hover:text-slate-300" href="#">Contact support</a>
        </div>
      </main>
    </div>
  );
}
