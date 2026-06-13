export default function Logo({ light = false, size = 'md' }) {
  const text = size === 'lg' ? 'text-2xl' : 'text-xl';
  const box = size === 'lg' ? 'w-9 h-9' : 'w-7 h-7';
  return (
    <div className="flex items-center gap-2.5">
      <div className={`${box} rounded-lg bg-accent flex items-center justify-center flex-shrink-0`}>
        <svg viewBox="0 0 24 24" className="w-[60%] h-[60%]" fill="none" stroke="rgb(var(--accent-fg))" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 7h10M7 7l3-3M7 7l3 3" />
          <path d="M17 17H7M17 17l-3 3M17 17l-3-3" />
        </svg>
      </div>
      <span className={`${text} font-bold tracking-tight ${light ? 'text-white' : 'text-zinc-900'}`}>
        Split<span className="text-accent">wise</span>
      </span>
    </div>
  );
}
