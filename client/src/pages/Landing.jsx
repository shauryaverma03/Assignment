import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/* ---------- tiny scroll-reveal hook ---------- */
function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function Reveal({ children, delay = 0, up = true, className = '' }) {
  const [ref, visible] = useReveal();
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'none' : up ? 'translateY(32px)' : 'scale(0.97)',
      transition: `opacity .8s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform .8s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
    }}>{children}</div>
  );
}

/* ---------- feature tile ---------- */
function Tile({ eyebrow, title, sub, dark, accent, children, tall }) {
  const bg = dark ? 'section-dark' : 'section-gray';
  const titleClr = dark ? 'text-white' : 'text-[#1d1d1f]';
  const subClr = dark ? 'text-[#86868b]' : 'text-[#6e6e73]';
  const eyeClr = accent ? 'text-accent-grad' : dark ? 'text-[#86868b]' : 'text-[#6e6e73]';
  return (
    <Reveal up={false}>
      <div className={`${bg} rounded-3xl overflow-hidden flex flex-col justify-between ${tall ? 'min-h-[520px]' : 'min-h-[360px]'} p-9`}>
        <div>
          <p className={`apple-eyebrow mb-2 ${eyeClr}`}>{eyebrow}</p>
          <h3 className={`text-3xl md:text-4xl font-bold tracking-tight leading-tight mb-2 ${titleClr}`}>{title}</h3>
          <p className={`text-base leading-relaxed max-w-xs ${subClr}`}>{sub}</p>
        </div>
        {children && <div className="mt-6">{children}</div>}
      </div>
    </Reveal>
  );
}

export default function Landing() {
  const [intro, setIntro] = useState(() => !sessionStorage.getItem('introPlayed'));
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!intro) return;
    sessionStorage.setItem('introPlayed', '1');
    const t = setTimeout(() => setIntro(false), 2000);
    return () => clearTimeout(t);
  }, [intro]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="min-h-screen bg-white text-[#1d1d1f] overflow-x-hidden">

      {/* ── INTRO ── */}
      {intro && (
        <div className="fixed inset-0 z-[99] bg-white flex items-center justify-center"
          style={{ animation: 'curtainUp .7s cubic-bezier(0.76,0,0.24,1) 1.5s forwards' }}>
          <div className="flex items-center gap-3" style={{ animation: 'introMark 1.3s cubic-bezier(0.16,1,0.3,1) both' }}>
            <div className="w-11 h-11 rounded-2xl bg-accent-grad flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 7h10M7 7l3-3M7 7l3 3"/><path d="M17 17H7M17 17l-3 3M17 17l-3-3"/>
              </svg>
            </div>
            <span className="text-3xl font-bold tracking-tight text-[#1d1d1f]"
              style={{ animation: 'introWord .9s cubic-bezier(0.16,1,0.3,1) .45s both' }}>
              Split<span className="text-accent-grad">wise</span>
            </span>
          </div>
        </div>
      )}

      {/* ── NAV (Apple-style sticky blur) ── */}
      <nav className={`sticky top-0 z-50 border-b transition-all duration-300 ${scrolled ? 'apple-nav-blur border-black/10 shadow-sm' : 'bg-white border-transparent'}`}>
        <div className="max-w-[980px] mx-auto px-5 h-12 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-semibold text-lg text-[#1d1d1f]">
            <div className="w-6 h-6 rounded-lg bg-accent-grad flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 7h10M7 7l3-3M7 7l3 3"/><path d="M17 17H7M17 17l-3 3M17 17l-3-3"/>
              </svg>
            </div>
            Splitwise
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm text-[#1d1d1f]/70">
            <a href="#features" className="hover:text-[#1d1d1f] transition">Features</a>
            <a href="#how" className="hover:text-[#1d1d1f] transition">How it works</a>
            <a href="#tiles" className="hover:text-[#1d1d1f] transition">Why us</a>
          </div>

          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 text-sm text-[#1d1d1f]/60 mr-1">
                <div className="w-6 h-6 rounded-full bg-accent-grad flex items-center justify-center text-white text-xs font-bold">
                  {user.username?.[0]?.toUpperCase()}
                </div>
                <span>{user.username}</span>
              </div>
              <Link to="/dashboard" className="flex items-center gap-1.5 text-sm font-medium text-white bg-accent-grad hover:opacity-90 px-3.5 py-1.5 rounded-full transition">
                <LayoutDashboard size={13} /> Dashboard
              </Link>
              <button onClick={handleLogout} className="text-sm text-[#1d1d1f]/50 hover:text-red-500 px-2 transition">
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm text-[#1d1d1f]/70 hover:text-[#1d1d1f] transition">Sign in</Link>
              <Link to="/register" className="text-sm font-medium text-white bg-accent-grad hover:opacity-90 px-4 py-1.5 rounded-full transition">
                Get started
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* ── HERO — black full-bleed ── */}
      <section className="section-black text-center py-28 px-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40 pointer-events-none" />
        {/* subtle glow orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-[120px] opacity-30 pointer-events-none"
          style={{ background: 'linear-gradient(135deg, rgb(var(--accent)), rgb(var(--accent-2)))' }} />
        <div className="relative max-w-4xl mx-auto">
          <Reveal>
            <p className="apple-eyebrow text-[#86868b] mb-5 tracking-widest">Shared expenses, made simple</p>
            <h1 className="apple-title text-white mb-6">
              Splitting money<br />
              <span className="text-accent-grad">is complex.<br />We handle it.</span>
            </h1>
            <p className="apple-subtitle text-[#86868b] max-w-xl mx-auto mb-10">
              Track shared spending, convert currencies, import messy spreadsheets, and settle debts — all in one clean place.
            </p>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link to={user ? '/dashboard' : '/register'}
                className="inline-flex items-center gap-2 text-white bg-accent-grad hover:opacity-90 font-semibold px-7 py-3.5 rounded-full shadow-accent-glow transition text-sm">
                {user ? 'Go to Dashboard' : 'Get started free'} <ArrowRight size={16} />
              </Link>
              <a href="#features" className="inline-flex items-center gap-1 text-sm text-[#f5f5f7] bg-white/10 hover:bg-white/20 px-7 py-3.5 rounded-full transition font-medium">
                Learn more
              </a>
            </div>
          </Reveal>
        </div>

        {/* Hero app mockup */}
        <Reveal delay={0.2}>
          <div className="mt-20 max-w-3xl mx-auto">
            <div className="bg-[#111] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
              <div className="flex items-center gap-1.5 px-5 h-10 bg-[#0c0c0c] border-b border-white/5">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
                <span className="ml-3 text-[11px] text-white/30 font-medium">Splitwise — Goa Trip 2024</span>
              </div>
              <div className="grid md:grid-cols-2 gap-4 p-6">
                <div className="space-y-2.5">
                  {[['Aisha','+₹4,250',true],['Rohan','−₹1,180',false],['Priya','+₹890',true],['Dev','−₹3,960',false]].map(([n,a,p]) => (
                    <div key={n} className="flex items-center justify-between bg-white/5 rounded-2xl px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent-grad flex items-center justify-center text-white text-xs font-bold">{n[0]}</div>
                        <span className="text-sm text-white/80">{n}</span>
                      </div>
                      <span className={`text-sm font-semibold ${p ? 'text-green-400' : 'text-red-400'}`}>{a}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col justify-center gap-3">
                  <p className="text-[10px] uppercase tracking-widest text-white/30">Suggested settlements</p>
                  {[['Rohan → Aisha','₹1,180'],['Dev → Priya','₹890'],['Dev → Aisha','₹3,070']].map(([t,a]) => (
                    <div key={t} className="flex items-center justify-between bg-accent/10 border border-accent/20 rounded-2xl px-4 py-3">
                      <span className="text-xs text-white/70">{t}</span>
                      <span className="text-sm font-bold text-accent-grad">{a}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── STATS — white ── */}
      <section className="section-white border-b border-[#d2d2d7] py-20 px-5">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-1 divide-x divide-[#d2d2d7]">
          {[['4','Split types'],['2','Currencies'],['12+','Anomalies caught'],['30d','Session length']].map(([n,l],i) => (
            <Reveal key={l} delay={i*0.07}>
              <div className="text-center px-8 py-4">
                <div className="text-4xl md:text-5xl font-bold text-[#1d1d1f] mb-1">{n}</div>
                <div className="text-sm text-[#6e6e73]">{l}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── FEATURE A — gray, text left, mockup right ── */}
      <section id="features" className="section-gray py-24 px-5">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <Reveal>
            <p className="apple-eyebrow text-accent mb-3">Smart Balances</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-5 text-[#1d1d1f]">
              One number.<br />No arguments.
            </h2>
            <p className="text-lg text-[#6e6e73] leading-relaxed mb-6">
              Our min-cash-flow engine collapses dozens of expenses into the fewest possible payments. Click any member to see exactly which expenses make up their balance — down to the rupee.
            </p>
            <Link to={user ? '/dashboard' : '/register'} className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent-hover transition">
              Start tracking <ArrowRight size={15} />
            </Link>
          </Reveal>
          <Reveal delay={0.1} up={false}>
            <div className="bg-white rounded-3xl shadow-xl p-6 border border-[#d2d2d7]">
              <p className="text-xs font-semibold tracking-widest text-[#6e6e73] uppercase mb-4">Suggested Settlements</p>
              {[['Rohan','Aisha','₹1,180'],['Dev','Priya','₹890'],['Dev','Aisha','₹3,070']].map(([f,t,a]) => (
                <div key={a} className="flex items-center justify-between py-3 border-b border-[#f5f5f7] last:border-0">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-red-500">{f}</span>
                    <span className="text-[#6e6e73]">pays</span>
                    <span className="font-medium text-green-600">{t}</span>
                  </div>
                  <span className="font-bold text-[#1d1d1f]">{a}</span>
                </div>
              ))}
              <div className="mt-4 p-3 rounded-2xl text-center text-xs text-accent font-medium" style={{ background: 'rgb(var(--accent)/0.08)' }}>
                3 transactions settle everything ✓
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FEATURE B — dark, reversed ── */}
      <section className="section-dark py-24 px-5">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center md:[direction:rtl]">
          <Reveal className="[direction:ltr]">
            <p className="apple-eyebrow text-accent mb-3">Multi-currency</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-5 text-white">
              A dollar isn't<br />a rupee.
            </h2>
            <p className="text-lg text-[#86868b] leading-relaxed mb-6">
              Half your trip was in USD? Splitwise auto-converts every foreign expense to INR at the right exchange rate, storing both the original and converted amounts for a clean audit trail.
            </p>
            <Link to={user ? '/dashboard' : '/register'} className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:opacity-80 transition">
              Add a multi-currency expense <ArrowRight size={15} />
            </Link>
          </Reveal>
          <Reveal delay={0.1} up={false} className="[direction:ltr]">
            <div className="bg-[#111] rounded-3xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-white/60">Beach dinner</span>
                <span className="text-xs bg-orange-400/20 text-orange-300 border border-orange-400/20 px-2.5 py-0.5 rounded-full">USD</span>
              </div>
              <div className="text-4xl font-bold text-white mb-1">₹4,755.50</div>
              <div className="text-sm text-white/40 mb-6">$50.00 × ₹95.11</div>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[['Aisha','₹1,585'],['Dev','₹1,585'],['Priya','₹1,585']].map(([n,a]) => (
                  <div key={n} className="bg-white/5 rounded-2xl py-3">
                    <div className="w-7 h-7 rounded-full bg-accent-grad mx-auto mb-1.5 flex items-center justify-center text-white text-xs font-bold">{n[0]}</div>
                    <div className="text-xs text-white/50">{n}</div>
                    <div className="text-sm font-semibold text-white">{a}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── TILES GRID — white — Apple-style 2-col grid ── */}
      <section id="tiles" className="section-white py-8 px-5">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="text-center mb-12">
              <p className="apple-eyebrow text-[#6e6e73] mb-3">Why Splitwise</p>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[#1d1d1f]">Built for real life.</h2>
            </div>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-3">
            <Tile dark eyebrow="CSV Import" accent
              title="Import the mess. We flag it."
              sub="12 anomaly detectors catch duplicates, bad dates, refunds, and departed members — all surfaced for your review."
              tall>
              <div className="space-y-2">
                {[['error','Row 7 — invalid date'],['warning','Row 12 — duplicate'],['info','Row 15 — USD converted']].map(([sev,txt]) => (
                  <div key={txt} className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs border ${sev==='error'?'bg-red-500/10 border-red-500/20 text-red-400':sev==='warning'?'bg-amber-400/10 border-amber-400/20 text-amber-300':'bg-blue-400/10 border-blue-400/20 text-blue-300'}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
                    {txt}
                  </div>
                ))}
              </div>
            </Tile>

            <div className="grid grid-rows-2 gap-3">
              <Tile eyebrow="Time-aware" title="Members join & leave." sub="Meera left in March? Her balance won't include April's electricity." />
              <Tile dark eyebrow="All split types" title="Equal. Exact. Percentage. Shares." sub="Pick the right split for every expense — not just one-size-fits-all." />
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-3 mt-3">
            <Tile eyebrow="Audit trail" title="Full transparency." sub="Every import decision is logged. Nothing changes silently." />
            <Tile dark eyebrow="Settlements" title="Settle in one tap." sub="Record payments, track history, watch every balance hit zero." />
            <Tile eyebrow="Themes" title="6 colour themes." sub="Switch accents instantly — Indigo, Emerald, Ocean, Sunset, Violet or Rose." />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS — gray ── */}
      <section id="how" className="section-gray py-24 px-5">
        <div className="max-w-3xl mx-auto text-center">
          <Reveal>
            <p className="apple-eyebrow text-[#6e6e73] mb-3">How it works</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-16 text-[#1d1d1f]">Three steps to settled.</h2>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              ['01','Create a group','Add your flatmates or trip crew. Members have real join and leave dates.'],
              ['02','Add expenses','Log any split — equal, exact, %, or shares — in INR or USD.'],
              ['03','Settle up','See who owes whom, record payments, done.'],
            ].map(([n,t,d],i) => (
              <Reveal key={n} delay={i*0.1}>
                <div className="text-center">
                  <div className="text-5xl font-bold text-accent-grad mb-4">{n}</div>
                  <h3 className="text-xl font-semibold text-[#1d1d1f] mb-2">{t}</h3>
                  <p className="text-sm text-[#6e6e73] leading-relaxed">{d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA — black ── */}
      <section className="section-black py-32 px-5 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[100px] opacity-25 pointer-events-none"
          style={{ background: 'linear-gradient(135deg, rgb(var(--accent)), rgb(var(--accent-2)))' }} />
        <div className="relative max-w-3xl mx-auto">
          <Reveal>
            <p className="apple-eyebrow text-[#86868b] mb-5">Splitwise</p>
            <h2 className="apple-title text-white mb-6">
              Stop chasing friends<br />for money.
            </h2>
            <p className="apple-subtitle text-[#86868b] mb-10 max-w-lg mx-auto">
              Create your first group in 30 seconds. Free forever. No card required.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <Link to={user ? '/dashboard' : '/register'}
              className="inline-flex items-center gap-2 bg-accent-grad hover:opacity-90 text-white font-semibold px-8 py-4 rounded-full shadow-accent-glow transition text-base">
              {user ? 'Open Dashboard' : 'Get started free'} <ArrowRight size={18} />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="section-black border-t border-white/10 py-8 px-5">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[#6e6e73]">
          <p>Copyright © 2024 Splitwise. All rights reserved.</p>
          <p>Node.js · Express · React · PostgreSQL · Prisma</p>
          <div className="flex gap-5">
            <Link to="/login" className="hover:text-white transition">Sign in</Link>
            <Link to="/register" className="text-accent hover:opacity-80 transition">Get started</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
