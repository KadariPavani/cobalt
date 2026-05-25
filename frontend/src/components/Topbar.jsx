import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, ChevronRight } from 'lucide-react';
import { useUiStore } from '@/store/uiStore';

export default function Topbar({ breadcrumbs = [], actions }) {
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const navigate = useNavigate();
  const [q, setQ] = useState('');

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('global-search')?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const submit = (e) => {
    e.preventDefault();
    const trimmed = q.trim();
    if (!trimmed) return;
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <header className="sticky top-0 z-20 h-14 px-4 sm:px-6 flex items-center gap-3 border-b border-white/[0.05] bg-surface-950/85 backdrop-blur-lg">
      <button
        type="button"
        className="btn-icon lg:hidden"
        onClick={toggleSidebar}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <nav
        aria-label="Breadcrumb"
        className="hidden md:flex items-center gap-1.5 text-[13px]"
      >
        {breadcrumbs.map((b, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="h-3 w-3 text-slate-700" />}
            {b.to ? (
              <a
                href={b.to}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(b.to);
                }}
                className="text-slate-500 hover:text-slate-200 transition-colors"
              >
                {b.label}
              </a>
            ) : (
              <span className="text-slate-100 font-medium">{b.label}</span>
            )}
          </span>
        ))}
      </nav>

      <div className="flex-1" />

      <form onSubmit={submit} className="relative hidden sm:block w-72">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
        <input
          id="global-search"
          type="search"
          placeholder="Search projects, tasks…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="input input-sm pl-8 pr-12"
        />
        <kbd className="hidden md:flex kbd absolute right-1.5 top-1/2 -translate-y-1/2">
          ⌘K
        </kbd>
      </form>

      {actions}
    </header>
  );
}
