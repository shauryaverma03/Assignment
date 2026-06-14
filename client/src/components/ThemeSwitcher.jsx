import { useTheme } from '../context/ThemeContext';

export default function ThemeSwitcher() {
  const { mode, toggleMode } = useTheme();

  return (
    <button
      onClick={toggleMode}
      title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        position: 'fixed',
        bottom: '1.25rem',
        right: '1.25rem',
        zIndex: 50,
        width: '2.75rem',
        height: '2.75rem',
        borderRadius: '50%',
        background: 'var(--card)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        color: 'var(--text-2)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'scale(1.08)';
        e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
        e.currentTarget.style.color = 'var(--text)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.color = 'var(--text-2)';
      }}
    >
      {mode === 'dark' ? (
        /* Sun icon */
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4"/>
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
        </svg>
      ) : (
        /* Moon icon */
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      )}
    </button>
  );
}
