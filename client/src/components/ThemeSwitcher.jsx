import { useState } from 'react';
import { Palette, Check } from 'lucide-react';
import { useTheme, THEMES } from '../context/ThemeContext';

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="absolute bottom-14 right-0 bg-white rounded-2xl shadow-2xl border border-zinc-100 p-4 w-56 animate-[fadeIn_.15s_ease]">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Color theme</p>
          <div className="grid grid-cols-3 gap-2">
            {THEMES.map(t => (
              <button key={t.id} onClick={() => setTheme(t.id)}
                className={`relative flex flex-col items-center gap-1.5 p-2 rounded-xl border transition ${theme === t.id ? 'border-zinc-300 bg-zinc-50' : 'border-transparent hover:bg-zinc-50'}`}>
                <span className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: t.rgb }}>
                  {theme === t.id && <Check size={15} className="text-white" />}
                </span>
                <span className="text-[11px] text-zinc-500">{t.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      <button onClick={() => setOpen(o => !o)}
        className="w-12 h-12 rounded-full bg-accent text-accent-fg shadow-lg shadow-black/20 flex items-center justify-center hover:bg-accent-hover transition"
        title="Change color theme">
        <Palette size={20} />
      </button>
    </div>
  );
}
