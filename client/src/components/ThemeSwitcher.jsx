import { useState } from 'react';
import { Palette, Check, X } from 'lucide-react';
import { useTheme, THEMES } from '../context/ThemeContext';

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="absolute bottom-16 right-0 w-72 bg-white rounded-2xl shadow-2xl border border-zinc-100 overflow-hidden animate-[rise_.2s_cubic-bezier(0.16,1,0.3,1)]">
          <div className="flex items-center gap-3 px-4 py-4 border-b border-zinc-100">
            <div className="w-9 h-9 rounded-xl bg-accent-grad flex items-center justify-center">
              <Palette size={17} className="text-white" />
            </div>
            <div>
              <p className="font-semibold text-zinc-900 text-sm leading-tight">Choose Theme</p>
              <p className="text-xs text-zinc-400">Customize your experience</p>
            </div>
          </div>
          <div className="p-2 max-h-80 overflow-y-auto">
            {THEMES.map(t => {
              const active = theme === t.id;
              return (
                <button key={t.id} onClick={() => setTheme(t.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition ${active ? 'bg-zinc-50' : 'hover:bg-zinc-50'}`}>
                  <span className="w-9 h-9 rounded-full flex-shrink-0 shadow-inner" style={{ background: t.grad }}></span>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-800">{t.name}</p>
                    <p className="text-xs text-zinc-400">{active ? 'Current theme' : t.desc}</p>
                  </div>
                  {active && (
                    <span className="w-5 h-5 rounded-full bg-accent-grad flex items-center justify-center flex-shrink-0">
                      <Check size={12} className="text-white" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
      <button onClick={() => setOpen(o => !o)}
        className="w-12 h-12 rounded-full bg-accent-grad shadow-accent-glow flex items-center justify-center hover:scale-105 active:scale-95 transition"
        title="Change color theme">
        {open ? <X size={20} className="text-white" /> : <Palette size={20} className="text-white" />}
      </button>
    </div>
  );
}
