import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <main className="min-h-screen grid place-items-center p-6">
      <div className="text-center max-w-md space-y-4 animate-slide-up">
        <div className="h-14 w-14 mx-auto rounded-lg bg-brand-500/10 grid place-items-center ring-1 ring-brand-500/25">
          <Compass className="h-6 w-6 text-brand-300" />
        </div>
        <h1 className="font-display text-4xl tracking-tightest text-slate-50">Page not found</h1>
        <p className="text-slate-400">
          We couldn't find what you were looking for. The link might be broken or the
          page may have moved.
        </p>
        <Link to="/dashboard" className="btn-primary inline-flex">
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}
