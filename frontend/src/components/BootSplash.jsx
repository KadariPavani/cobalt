import Logo from './Logo';

export default function BootSplash() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 animate-fade-in">
        <Logo showWordmark={false} size="lg" />
        <span className="text-slate-500 text-xs uppercase tracking-[0.18em]">
          Loading workspace
        </span>
      </div>
    </div>
  );
}
