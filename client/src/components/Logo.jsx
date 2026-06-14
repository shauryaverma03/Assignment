export default function Logo({ size = 'md', light = false }) {
  const iconSize = size === 'lg' ? 32 : size === 'sm' ? 22 : 28;
  const textSize = size === 'lg' ? '1.375rem' : size === 'sm' ? '1rem' : '1.2rem';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
      {/* SVG: circle split vertically — left half filled with accent, right half outlined */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        {/* Left half — filled */}
        <path
          d="M14 1 A13 13 0 0 0 14 27 Z"
          fill="var(--accent)"
        />
        {/* Full circle outline */}
        <circle
          cx="14"
          cy="14"
          r="13"
          stroke="var(--accent)"
          strokeWidth="1.75"
          fill="none"
        />
        {/* Vertical dividing line */}
        <line
          x1="14"
          y1="1"
          x2="14"
          y2="27"
          stroke="var(--accent)"
          strokeWidth="1.75"
        />
      </svg>

      {/* Text: "Split" bold + "wise" regular */}
      <span style={{
        fontSize: textSize,
        lineHeight: 1,
        letterSpacing: '-0.02em',
        color: light ? '#ffffff' : 'var(--text)',
      }}>
        <span style={{ fontWeight: 700 }}>Split</span>
        <span style={{ fontWeight: 400, color: light ? 'rgba(255,255,255,0.65)' : 'var(--text-2)' }}>wise</span>
      </span>
    </div>
  );
}
