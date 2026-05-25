import { cn } from '@/utils/cn';

/**
 * Cobalt wordmark + mark. The mark is two offset, rounded squares stacked at
 * an angle — a quiet geometric reference to a layered roadmap (one layer of
 * work overlapping the next). Pure SVG, scales with text size, recolors via
 * `currentColor`.
 */
export default function Logo({
  showWordmark = true,
  size = 'md',
  tone = 'gradient',
  className,
}) {
  const dims = {
    sm: { wrap: 'h-7',  text: 'text-[15px]' },
    md: { wrap: 'h-8',  text: 'text-[17px]' },
    lg: { wrap: 'h-10', text: 'text-[19px]' },
  }[size];

  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span
        aria-hidden="true"
        className={cn(
          'relative shrink-0 grid place-items-center rounded-[9px]',
          dims.wrap,
          tone === 'gradient'
            ? 'bg-gradient-to-br from-brand-500 to-brand-700 ring-1 ring-inset ring-white/15'
            : tone === 'solid'
            ? 'bg-brand-500 ring-1 ring-inset ring-white/15'
            : 'bg-white/[0.04] ring-1 ring-inset ring-white/10'
        )}
        style={{ aspectRatio: '1 / 1' }}
      >
        <Mark className="h-[58%] w-[58%] text-white" />
      </span>
      {showWordmark && (
        <span
          className={cn(
            'font-semibold tracking-tight text-slate-100 leading-none',
            dims.text
          )}
        >
          Cobalt
        </span>
      )}
    </span>
  );
}

const Mark = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    aria-hidden="true"
  >
    {/* Background layer, semi-transparent */}
    <rect
      x="3"
      y="7"
      width="14"
      height="14"
      rx="3"
      fill="currentColor"
      opacity="0.55"
    />
    {/* Foreground layer */}
    <rect
      x="7"
      y="3"
      width="14"
      height="14"
      rx="3"
      fill="currentColor"
    />
  </svg>
);

export { Mark as LogoMark };
