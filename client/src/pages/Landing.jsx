import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, LayoutDashboard, LogOut, Zap, Shield, Globe, TrendingUp, Upload, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/* ── Scroll reveal ── */
function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); obs.disconnect(); } }, { threshold: 0.12 });
    obs.observe(el); return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={className} style={{
      opacity: v ? 1 : 0,
      transform: v ? 'translateY(0)' : 'translateY(40px)',
      transition: `opacity .9s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform .9s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
    }}>{children}</div>
  );
}

/* ── 3D tilt card on mouse move ── */
function TiltCard({ children, className = '', intensity = 12 }) {
  const ref = useRef(null);
  const handleMove = (e) => {
    const el = ref.current; if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${-y * intensity}deg) rotateY(${x * intensity}deg) scale(1.02)`;
    el.style.boxShadow = `${-x * 30}px ${-y * 20}px 60px rgba(0,0,0,0.4), 0 0 50px rgb(var(--accent)/0.25)`;
  };
  const handleLeave = (e) => {
    const el = ref.current; if (!el) return;
    el.style.transform = 'perspective(900px) rotateX(0) rotateY(0) scale(1)';
    el.style.boxShadow = '';
  };
  return (
    <div ref={ref} className={className}
      style={{ transition: 'transform .5s cubic-bezier(0.16,1,0.3,1), box-shadow .5s ease', transformStyle: 'preserve-3d' }}
      onMouseMove={handleMove} onMouseLeave={handleLeave}>
      {children}
    </div>
  );
}

const MARQUEE_ITEMS = ['Flatmates','Trips','Road Trips','Dinner Splits','Office Lunches','Hostels','Vacations','House Parties','Roommates','Couples'];

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
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="min-h-screen bg-[#06060a] text-white overflow-x-hidden">

      {/* ── INTRO ── */}
      {intro && (
        <div className="fixed inset-0 z-[99] bg-[#06060a] flex items-center justify-center"
          style={{ animation: 'curtainUp .75s cubic-bezier(0.76,0,0.24,1) 1.5s forwards' }}>
          <div style={{ animation: 'introMark 1.3s cubic-bezier(0.16,1,0.3,1) both' }}
            className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-3xl bg-accent-grad flex items-center justify-center shadow-accent-glow">
              <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 7h10M7 7l3-3M7 7l3 3"/><path d="M17 17H7M17 17l-3 3M17 17l-3-3"/>
              </svg>
            </div>
            <span className="text-4xl font-bold tracking-tight" style={{ animation: 'introWord .9s cubic-bezier(0.16,1,0.3,1) .5s both' }}>
              Split<span className="shimmer-text">wise</span>
            </span>
          </div>
        </div>
      )}

      {/* ── NAV ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'glass border-b border-white/8 shadow-2xl' : ''}`}>
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-accent-grad flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 7h10M7 7l3-3M7 7l3 3"/><path d="M17 17H7M17 17l-3 3M17 17l-3-3"/>
              </svg>
            </div>
            <span className="font-bold text-lg tracking-tight">Split<span className="text-accent-grad">wise</span></span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-white/50">
            {['#features','#how','#tiles'].map((h,i) => (
              <a key={h} href={h} className="hover:text-white transition">{['Features','How it works','Why us'][i]}</a>
            ))}
          </div>
          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 glass rounded-full px-3 py-1.5 text-sm text-white/70">
                <div className="w-5 h-5 rounded-full bg-accent-grad flex items-center justify-center text-white text-[10px] font-bold">
                  {user.username?.[0]?.toUpperCase()}
                </div>
                {user.username}
              </div>
              <Link to="/dashboard" className="flex items-center gap-1.5 text-sm font-semibold text-white bg-accent-grad px-4 py-1.5 rounded-full hover:opacity-90 transition shadow-accent-glow">
                <LayoutDashboard size={13}/> Dashboard
              </Link>
              <button onClick={handleLogout} className="p-2 text-white/40 hover:text-red-400 transition">
                <LogOut size={15}/>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-sm text-white/60 hover:text-white px-3 py-1.5 transition">Sign in</Link>
              <Link to="/register" className="text-sm font-semibold text-white bg-accent-grad px-4 py-1.5 rounded-full hover:opacity-90 transition shadow-accent-glow">
                Get started
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center mesh-bg dot-grid grain overflow-hidden pt-14">
        {/* animated orbs */}
        <div className="orb   absolute top-[15%] left-[10%]  w-72 h-72 rounded-full blur-[80px] opacity-40 pointer-events-none" style={{ background: 'rgb(var(--accent))' }}/>
        <div className="orb-2 absolute bottom-[20%] right-[8%]  w-80 h-80 rounded-full blur-[90px] opacity-30 pointer-events-none" style={{ background: 'rgb(var(--accent-2))' }}/>
        <div className="orb-3 absolute top-[50%] left-[45%] w-64 h-64 rounded-full blur-[100px] opacity-20 pointer-events-none" style={{ background: 'rgb(var(--accent))' }}/>

        <div className="relative z-10 max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          {/* LEFT */}
          <div>
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-xs text-white/70 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"/>
              Shared expenses · Settled fairly
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.02] mb-6">
              Splitting money<br/>
              <span className="shimmer-text">is messy.</span><br/>
              <span className="text-white/30">We fix that.</span>
            </h1>
            <p className="text-lg text-white/50 leading-relaxed max-w-md mb-10">
              Track shared spending, convert currencies, import chaotic spreadsheets, and settle debts — all from one beautiful interface.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to={user ? '/dashboard' : '/register'}
                className="inline-flex items-center gap-2 bg-accent-grad text-white font-semibold px-7 py-3.5 rounded-2xl shadow-accent-glow hover:opacity-90 hover:scale-105 transition-all duration-300 text-sm">
                {user ? 'Open Dashboard' : 'Get started free'} <ArrowRight size={16}/>
              </Link>
              <a href="#features"
                className="inline-flex items-center gap-2 glass text-white/70 hover:text-white font-medium px-7 py-3.5 rounded-2xl transition text-sm hover:bg-white/10">
                See features
              </a>
            </div>
            {/* mini stats */}
            <div className="flex gap-8 mt-12">
              {[['4+','Split types'],['12+','Anomalies detected'],['30d','Session length']].map(([n,l]) => (
                <div key={l}>
                  <div className="text-2xl font-bold text-white">{n}</div>
                  <div className="text-xs text-white/40 mt-0.5">{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — 3D floating card */}
          <div className="relative flex items-center justify-center">
            <TiltCard className="w-full max-w-md" intensity={8}>
              <div className="glass rounded-3xl overflow-hidden shadow-2xl">
                {/* window bar */}
                <div className="flex items-center gap-1.5 px-5 py-3 border-b border-white/8 bg-white/3">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"/>
                  <div className="w-3 h-3 rounded-full bg-yellow-400/80"/>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"/>
                  <span className="ml-3 text-[11px] text-white/30">Goa Trip 2024 · Balances</span>
                </div>
                <div className="p-5 space-y-2.5">
                  {[['A','Aisha','+₹4,250',true,'from-violet-500 to-purple-600'],
                    ['R','Rohan','−₹1,180',false,'from-blue-500 to-cyan-500'],
                    ['P','Priya','+₹890',true,'from-emerald-500 to-teal-500'],
                    ['D','Dev','−₹3,960',false,'from-orange-500 to-rose-500']
                  ].map(([l,n,a,p,g]) => (
                    <div key={n} className="flex items-center justify-between bg-white/5 hover:bg-white/8 rounded-2xl px-4 py-3 transition">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${g} flex items-center justify-center text-white text-xs font-bold`}>{l}</div>
                        <span className="text-sm text-white/80 font-medium">{n}</span>
                      </div>
                      <span className={`text-sm font-bold ${p ? 'text-emerald-400' : 'text-red-400'}`}>{a}</span>
                    </div>
                  ))}
                </div>
                <div className="px-5 pb-5">
                  <div className="bg-accent/10 border border-accent/20 rounded-2xl p-4">
                    <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2">Settle up in 2 payments</p>
                    {[['Rohan → Aisha','₹1,180'],['Dev → Aisha','₹3,070']].map(([t,a]) => (
                      <div key={t} className="flex justify-between py-1.5">
                        <span className="text-xs text-white/60">{t}</span>
                        <span className="text-xs font-bold text-accent-grad">{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TiltCard>
            {/* floating badge */}
            <div className="floating absolute -top-6 -right-4 glass rounded-2xl px-4 py-3 shadow-xl">
              <div className="text-xs text-white/50 mb-1">USD → INR</div>
              <div className="text-base font-bold text-white">$50 = <span className="text-accent-grad">₹4,755</span></div>
            </div>
            <div className="floating-slow absolute -bottom-4 -left-6 glass rounded-2xl px-4 py-3 shadow-xl">
              <div className="text-[10px] text-white/40 mb-1">12 anomalies caught</div>
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-400"/>
                <span className="w-2 h-2 rounded-full bg-amber-400"/>
                <span className="w-2 h-2 rounded-full bg-blue-400"/>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div className="border-y border-white/8 bg-white/3 py-4 overflow-hidden">
        <div className="flex gap-8 animate-marquee whitespace-nowrap">
          {[...MARQUEE_ITEMS,...MARQUEE_ITEMS].map((t,i) => (
            <span key={i} className="text-sm font-medium text-white/30 flex items-center gap-8">
              {t} <span className="text-accent-grad text-lg">◆</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── FEATURES GRID ── */}
      <section id="features" className="py-28 px-6 max-w-6xl mx-auto">
        <Reveal>
          <div className="text-center mb-20">
            <p className="text-xs font-semibold tracking-widest uppercase text-accent mb-4">Features</p>
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
              Everything in one place.<br/><span className="text-white/25">Nothing missing.</span>
            </h2>
          </div>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-4">
          {/* tall card */}
          <Reveal delay={0} className="md:col-span-1 md:row-span-2">
            <TiltCard className="h-full" intensity={6}>
              <div className="glass rounded-3xl p-8 h-full flex flex-col min-h-[480px] hover:border-accent/30 transition-colors duration-300">
                <div className="w-12 h-12 rounded-2xl bg-accent-grad flex items-center justify-center mb-6 shadow-accent-glow">
                  <TrendingUp size={22} className="text-white"/>
                </div>
                <h3 className="text-2xl font-bold mb-3">Smart Balances</h3>
                <p className="text-white/50 text-sm leading-relaxed mb-8">Min-cash-flow algorithm collapses dozens of expenses into the fewest possible payments. Click any member for a full expense breakdown.</p>
                <div className="flex-1 flex flex-col justify-end gap-2">
                  {[['Rohan → Aisha','₹1,180'],['Dev → Aisha','₹3,070']].map(([t,a]) => (
                    <div key={t} className="flex justify-between items-center bg-white/5 rounded-xl px-4 py-3">
                      <span className="text-xs text-white/60">{t}</span>
                      <span className="text-sm font-bold text-accent-grad">{a}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TiltCard>
          </Reveal>

          <Reveal delay={0.05}>
            <TiltCard intensity={6}>
              <div className="glass rounded-3xl p-7 min-h-[220px]">
                <div className="w-11 h-11 rounded-2xl bg-orange-500/20 flex items-center justify-center mb-5 border border-orange-400/20">
                  <Globe size={20} className="text-orange-400"/>
                </div>
                <h3 className="text-xl font-bold mb-2">Multi-currency</h3>
                <p className="text-white/50 text-sm leading-relaxed">USD, INR — auto-converted at the real exchange rate. Original + converted stored for full audit trail.</p>
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <span className="text-white/30">$50</span>
                  <ArrowRight size={13} className="text-accent"/>
                  <span className="font-bold text-accent-grad">₹4,755.50</span>
                </div>
              </div>
            </TiltCard>
          </Reveal>

          <Reveal delay={0.1}>
            <TiltCard intensity={6}>
              <div className="glass rounded-3xl p-7 min-h-[220px]">
                <div className="w-11 h-11 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-5 border border-blue-400/20">
                  <Users size={20} className="text-blue-400"/>
                </div>
                <h3 className="text-xl font-bold mb-2">Time-aware Members</h3>
                <p className="text-white/50 text-sm leading-relaxed">Meera left March 31? April's electricity won't touch her balance. Join/leave dates on every membership.</p>
                <div className="mt-4 flex gap-2">
                  {[['M','left','bg-zinc-700'],['S','active','bg-gradient-to-br from-emerald-500 to-teal-500']].map(([l,s,g]) => (
                    <div key={l} className="flex items-center gap-1.5 text-xs text-white/50">
                      <div className={`w-5 h-5 rounded-full ${g} flex items-center justify-center text-white text-[9px] font-bold`}>{l}</div>
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            </TiltCard>
          </Reveal>

          <Reveal delay={0.15}>
            <TiltCard intensity={6}>
              <div className="glass rounded-3xl p-7 min-h-[220px]">
                <div className="w-11 h-11 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-5 border border-purple-400/20">
                  <Upload size={20} className="text-purple-400"/>
                </div>
                <h3 className="text-xl font-bold mb-2">CSV Import</h3>
                <p className="text-white/50 text-sm leading-relaxed">Import messy spreadsheets. 12 anomaly detectors catch duplicates, bad dates, refunds — all surfaced for review.</p>
                <div className="mt-4 space-y-1.5">
                  {[['error','Invalid date'],['warning','Duplicate row'],['info','USD converted']].map(([sev,t]) => (
                    <div key={t} className={`flex items-center gap-2 text-[11px] rounded-lg px-2.5 py-1.5 ${sev==='error'?'bg-red-500/10 text-red-400':sev==='warning'?'bg-amber-400/10 text-amber-300':'bg-blue-400/10 text-blue-300'}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current"/>
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            </TiltCard>
          </Reveal>

          <Reveal delay={0.2}>
            <TiltCard intensity={6}>
              <div className="glass rounded-3xl p-7 min-h-[220px]">
                <div className="w-11 h-11 rounded-2xl bg-rose-500/20 flex items-center justify-center mb-5 border border-rose-400/20">
                  <Zap size={20} className="text-rose-400"/>
                </div>
                <h3 className="text-xl font-bold mb-2">All Split Types</h3>
                <p className="text-white/50 text-sm leading-relaxed">Equal, exact amounts, percentage, or shares — pick the right split for every expense.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {['Equal','Exact','%','Shares'].map(t => (
                    <span key={t} className="text-xs glass rounded-full px-3 py-1 text-white/60">{t}</span>
                  ))}
                </div>
              </div>
            </TiltCard>
          </Reveal>

          <Reveal delay={0.25}>
            <TiltCard intensity={6}>
              <div className="glass rounded-3xl p-7 min-h-[220px]">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-5 border border-emerald-400/20">
                  <Shield size={20} className="text-emerald-400"/>
                </div>
                <h3 className="text-xl font-bold mb-2">Full Audit Trail</h3>
                <p className="text-white/50 text-sm leading-relaxed">Every import decision logged. Every anomaly surfaced. Nothing changes without a record you can review.</p>
                <div className="mt-4 h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full w-[78%] bg-accent-grad rounded-full" style={{ animation: 'introWord 2s ease 0.5s both' }}/>
                </div>
                <p className="text-[10px] text-white/30 mt-2">78% of CSV rows imported cleanly</p>
              </div>
            </TiltCard>
          </Reveal>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="py-24 px-6 border-t border-white/6">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="text-center mb-16">
              <p className="text-xs font-semibold tracking-widest uppercase text-accent mb-4">How it works</p>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">Three steps.<br/><span className="text-white/25">Zero confusion.</span></h2>
            </div>
          </Reveal>
          <div className="relative">
            {/* connecting line */}
            <div className="hidden md:block absolute top-12 left-[16.6%] right-[16.6%] h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent"/>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { n: '01', Icon: Users, c: 'from-violet-500 to-purple-600', t: 'Create a group', d: 'Add members with real join and leave dates. Time-aware from day one.' },
                { n: '02', Icon: Zap, c: 'from-orange-500 to-rose-500', t: 'Log expenses', d: 'Any split type, any currency. INR or USD — auto-converted at the right rate.' },
                { n: '03', Icon: TrendingUp, c: 'from-emerald-500 to-teal-500', t: 'Settle up', d: 'Min-cash-flow gives you the fewest payments. Record them and you\'re done.' },
              ].map(({ n, Icon, c, t, d }, i) => (
                <Reveal key={n} delay={i * 0.1}>
                  <TiltCard intensity={5}>
                    <div className="glass rounded-3xl p-8 text-center">
                      <div className={`w-16 h-16 rounded-3xl bg-gradient-to-br ${c} flex items-center justify-center mx-auto mb-5 shadow-lg`}>
                        <Icon size={26} className="text-white"/>
                      </div>
                      <div className="text-xs text-white/20 font-bold mb-2">{n}</div>
                      <h3 className="text-xl font-bold mb-3">{t}</h3>
                      <p className="text-sm text-white/50 leading-relaxed">{d}</p>
                    </div>
                  </TiltCard>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section id="tiles" className="py-28 px-6">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <TiltCard intensity={4}>
              <div className="relative rounded-3xl overflow-hidden mesh-bg grain text-center py-20 px-8">
                <div className="orb absolute top-0 left-1/4 w-64 h-64 rounded-full blur-[80px] opacity-40" style={{ background: 'rgb(var(--accent))' }}/>
                <div className="orb-2 absolute bottom-0 right-1/4 w-56 h-56 rounded-full blur-[70px] opacity-30" style={{ background: 'rgb(var(--accent-2))' }}/>
                <div className="relative z-10">
                  <p className="text-xs font-semibold tracking-widest uppercase text-accent/80 mb-4">Stop chasing people</p>
                  <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight mb-6">
                    Money sorted.<br/>
                    <span className="shimmer-text">Friendships saved.</span>
                  </h2>
                  <p className="text-white/50 text-lg mb-10 max-w-lg mx-auto">Free forever. No card. 30-second setup.</p>
                  <Link to={user ? '/dashboard' : '/register'}
                    className="inline-flex items-center gap-2 bg-white text-[#1d1d1f] font-bold px-8 py-4 rounded-2xl hover:bg-white/90 hover:scale-105 transition-all duration-300 text-base shadow-2xl">
                    {user ? 'Go to Dashboard' : 'Start for free'} <ArrowRight size={18}/>
                  </Link>
                </div>
              </div>
            </TiltCard>
          </Reveal>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/8 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/30">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-lg bg-accent-grad flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 7h10M7 7l3-3M7 7l3 3"/><path d="M17 17H7M17 17l-3 3M17 17l-3-3"/>
              </svg>
            </div>
            <span>Copyright © 2024 Splitwise</span>
          </div>
          <p className="text-white/20">Node.js · Express · React · PostgreSQL (Neon) · Prisma</p>
          <div className="flex gap-5">
            <Link to="/login" className="hover:text-white transition">Sign in</Link>
            <Link to="/register" className="text-accent hover:opacity-80 transition font-medium">Get started</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
