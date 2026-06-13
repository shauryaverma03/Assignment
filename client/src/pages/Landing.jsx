import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Check } from 'lucide-react';
import Logo from '../components/Logo';
import Reveal from '../components/Reveal';

const USE_CASES = ['Flatmates', 'Goa Trips', 'Roommates', 'Couples', 'Office Lunches', 'House Parties', 'Vacations', 'Hostels'];

export default function Landing() {
  const [intro, setIntro] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setIntro(false), 2200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-200 overflow-x-hidden">
      {/* ---------- INTRO CURTAIN ---------- */}
      {intro && (
        <div
          className="fixed inset-0 z-[60] bg-[#0a0a0a] flex items-center justify-center"
          style={{ animation: 'curtainUp .8s cubic-bezier(0.76,0,0.24,1) 1.6s forwards' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-400 flex items-center justify-center" style={{ animation: 'introMark 1.4s cubic-bezier(0.16,1,0.3,1) both' }}>
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="#0a0a0a" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 7h10M7 7l3-3M7 7l3 3" />
                <path d="M17 17H7M17 17l-3 3M17 17l-3-3" />
              </svg>
            </div>
            <span className="text-3xl font-bold tracking-tight text-white" style={{ animation: 'introWord 1s cubic-bezier(0.16,1,0.3,1) .5s both' }}>
              Split<span className="text-emerald-400">wise</span>
            </span>
          </div>
        </div>
      )}

      {/* ---------- NAV ---------- */}
      <nav className="sticky top-0 z-40 backdrop-blur-xl bg-[#0a0a0a]/80 border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo light />
          <div className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#how" className="hover:text-white transition">How it works</a>
            <a href="#why" className="hover:text-white transition">Why Splitwise</a>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login" className="text-sm text-zinc-300 hover:text-white px-4 py-2 transition">Sign in</Link>
            <Link to="/register" className="text-sm font-semibold text-[#0a0a0a] bg-emerald-400 hover:bg-emerald-300 px-4 py-2 rounded-lg transition">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ---------- HERO ---------- */}
      <section className="relative">
        {/* glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full glow-pulse pointer-events-none"></div>
        <div className="absolute inset-0 grid-texture opacity-60 pointer-events-none [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]"></div>

        <div className="relative max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 border border-zinc-800 bg-zinc-900/50 text-zinc-400 text-xs px-4 py-1.5 rounded-full mb-8 fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Shared expenses, settled fairly
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-[1.05] mb-7 rise">
            Splitting money is messy.<br />
            <span className="text-zinc-500">We handle the math.</span>
          </h1>

          <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-10 rise d2">
            Splitwise tracks shared spending, converts multi-currency trips, imports messy spreadsheets,
            and tells you exactly who owes whom — end to end, all in one place.
          </p>

          <div className="flex items-center justify-center gap-3 rise d3">
            <Link to="/register" className="group inline-flex items-center gap-2 bg-emerald-400 hover:bg-emerald-300 text-[#0a0a0a] font-semibold px-6 py-3 rounded-lg transition">
              Get Started
              <ArrowRight size={17} className="group-hover:translate-x-0.5 transition" />
            </Link>
            <a href="#features" className="inline-flex items-center gap-2 border border-zinc-800 hover:border-zinc-600 text-white font-medium px-6 py-3 rounded-lg transition">
              See how it works
            </a>
          </div>
        </div>

        {/* hero mockup */}
        <div className="relative max-w-4xl mx-auto px-6 pb-20 rise d4">
          <div className="rounded-2xl border border-zinc-800 bg-[#0f0f0f] shadow-2xl shadow-emerald-950/30 overflow-hidden">
            <div className="flex items-center gap-2 px-4 h-10 border-b border-zinc-800 bg-[#0c0c0c]">
              <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
              <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
              <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
              <span className="ml-3 text-xs text-zinc-500">Goa Trip 2024 · Balances</span>
            </div>
            <div className="grid md:grid-cols-2 gap-5 p-6">
              <div className="space-y-3">
                {[
                  { n: 'Aisha', amt: '+₹2,340', pos: true },
                  { n: 'Rohan', amt: '−₹1,180', pos: false },
                  { n: 'Priya', amt: '+₹890', pos: true },
                  { n: 'Dev', amt: '−₹2,050', pos: false },
                ].map(r => (
                  <div key={r.n} className="flex items-center justify-between bg-[#141414] border border-zinc-800 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center text-xs font-bold">{r.n[0]}</div>
                      <span className="text-sm text-zinc-300">{r.n}</span>
                    </div>
                    <span className={`text-sm font-semibold ${r.pos ? 'text-emerald-400' : 'text-red-400'}`}>{r.amt}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col justify-center gap-3">
                <p className="text-xs uppercase tracking-wider text-zinc-500">Suggested settlements</p>
                {[['Rohan → Aisha', '₹1,180'], ['Dev → Priya', '₹890'], ['Dev → Aisha', '₹1,160']].map(([t, a]) => (
                  <div key={t} className="flex items-center justify-between bg-emerald-400/5 border border-emerald-400/20 rounded-xl px-4 py-3">
                    <span className="text-sm text-zinc-300">{t}</span>
                    <span className="text-sm font-bold text-emerald-400">{a}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="border-t border-zinc-900">
          <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[['4', 'Split types supported'], ['2', 'Currencies, auto-converted'], ['12+', 'Data anomalies caught'], ['0', 'Awkward money talks']].map(([n, l], i) => (
              <Reveal key={l} delay={i * 0.08}>
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">{n}</div>
                <div className="text-sm text-zinc-500">{l}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- MARQUEE ---------- */}
      <section className="border-y border-zinc-900 py-7 overflow-hidden">
        <div className="flex">
          <div className="flex gap-10 animate-marquee whitespace-nowrap pr-10">
            {[...USE_CASES, ...USE_CASES].map((u, i) => (
              <span key={i} className="text-xl font-semibold text-zinc-700 flex items-center gap-10">
                {u}<span className="text-emerald-500/40">◆</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- FEATURES ---------- */}
      <section id="features" className="max-w-6xl mx-auto px-6 pt-28 pb-10">
        <Reveal>
          <p className="text-emerald-400 text-sm font-medium mb-3">Features</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight max-w-2xl leading-tight">
            Everything you need to settle up — nothing you don't.
          </h2>
        </Reveal>
      </section>

      <FeatureRow
        n="01" eyebrow="Smart Balances"
        title="One number per person. Done."
        desc="Our min-cash-flow engine collapses dozens of expenses into the fewest possible payments. No circular IOUs — just who pays whom, and how much."
        bullets={['Per-member net balances', 'Tap any member for a full breakdown', 'Minimized settlement transactions']}
        mockup={
          <div className="space-y-3">
            {[['Rohan → Aisha', '₹1,180'], ['Dev → Priya', '₹890'], ['Dev → Aisha', '₹1,160']].map(([t, a]) => (
              <div key={t} className="flex items-center justify-between bg-[#141414] border border-zinc-800 rounded-xl px-4 py-3.5">
                <span className="text-sm text-zinc-300">{t}</span>
                <span className="font-bold text-emerald-400">{a}</span>
              </div>
            ))}
          </div>
        }
      />
      <FeatureRow
        reverse n="02" eyebrow="Multi-currency"
        title="A dollar isn't a rupee."
        desc="Half your trip was in USD? Splitwise auto-converts every foreign expense to INR at the right rate, while preserving the original amount for a clean audit trail."
        bullets={['Automatic USD → INR conversion', 'Original + converted amounts stored', 'Per-expense exchange rate locked in']}
        mockup={
          <div className="bg-[#141414] border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-zinc-400">Beach dinner</span>
              <span className="text-xs bg-orange-400/10 text-orange-300 border border-orange-400/20 px-2 py-0.5 rounded-full">USD</span>
            </div>
            <div className="text-3xl font-bold text-white">₹4,175.00</div>
            <div className="text-sm text-zinc-500 mt-1">$50.00 × ₹83.50</div>
          </div>
        }
      />
      <FeatureRow
        n="03" eyebrow="CSV Import"
        title="Import the mess. We'll flag it."
        desc="Drop in a real-world spreadsheet and watch Splitwise detect duplicates, bad dates, refunds, settlements logged as expenses, and members who already moved out — every anomaly surfaced, never silently guessed."
        bullets={['12+ anomaly detectors', 'Fully reviewable audit log', 'Nothing changed without a record']}
        mockup={
          <div className="space-y-2.5">
            {[
              ['ERROR', 'Row 7 — invalid date', 'text-red-400 border-red-400/20 bg-red-400/5'],
              ['WARNING', 'Row 12 — duplicate dinner', 'text-amber-400 border-amber-400/20 bg-amber-400/5'],
              ['INFO', 'Row 15 — USD converted', 'text-blue-400 border-blue-400/20 bg-blue-400/5'],
            ].map(([sev, txt, cls]) => (
              <div key={txt} className={`flex items-center gap-3 border rounded-xl px-4 py-3 ${cls}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                <span className="text-sm text-zinc-300">{txt}</span>
                <span className="ml-auto text-[10px] font-bold tracking-wider opacity-70">{sev}</span>
              </div>
            ))}
          </div>
        }
      />

      {/* ---------- HOW IT WORKS ---------- */}
      <section id="how" className="border-y border-zinc-900 bg-[#0c0c0c] py-28 mt-16">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            <p className="text-emerald-400 text-sm font-medium mb-3 text-center">How it works</p>
            <h2 className="text-4xl font-bold text-white tracking-tight text-center mb-16">Settle up in three steps.</h2>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Create a group', desc: 'Add your flatmates or trip crew. Members join and leave with real dates.' },
              { step: '02', title: 'Add expenses', desc: 'Log spending with equal, exact, percentage, or share-based splits — any currency.' },
              { step: '03', title: 'Settle up', desc: 'See exactly who owes whom, record payments, and watch every balance hit zero.' },
            ].map((s, i) => (
              <Reveal key={s.step} delay={i * 0.1}>
                <div className="h-full bg-[#111] border border-zinc-800 rounded-2xl p-7 hover:border-emerald-400/30 transition">
                  <div className="text-emerald-400 font-bold text-sm mb-5">{s.step}</div>
                  <h3 className="text-white font-semibold text-lg mb-2">{s.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- WHY ---------- */}
      <section id="why" className="max-w-6xl mx-auto px-6 py-28 grid md:grid-cols-3 gap-6">
        {[
          { title: 'Auditable by design', desc: 'Every import decision is logged. Approve changes before anything is deleted.' },
          { title: 'Time-aware membership', desc: 'Moved out in March? You won\'t be charged for April\'s electricity bill.' },
          { title: 'Built on real data', desc: 'A relational Postgres schema designed to handle the messiest of spreadsheets.' },
        ].map((c, i) => (
          <Reveal key={c.title} delay={i * 0.08}>
            <div className="h-full bg-[#111] border border-zinc-800 rounded-2xl p-7 hover:border-zinc-700 transition">
              <div className="w-9 h-9 rounded-lg bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center mb-4">
                <Check size={16} className="text-emerald-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">{c.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{c.desc}</p>
            </div>
          </Reveal>
        ))}
      </section>

      {/* ---------- CTA ---------- */}
      <section className="max-w-5xl mx-auto px-6 pb-28">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-[#0c0c0c] px-8 py-20 text-center">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-emerald-500/15 blur-[100px] rounded-full"></div>
            <div className="relative">
              <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-5">
                Stop chasing friends for money.
              </h2>
              <p className="text-zinc-400 text-lg mb-9 max-w-lg mx-auto">Create your first group in 30 seconds. Free forever, no card required.</p>
              <Link to="/register" className="inline-flex items-center gap-2 bg-emerald-400 hover:bg-emerald-300 text-[#0a0a0a] font-semibold px-7 py-3.5 rounded-lg transition">
                Get Started <ArrowUpRight size={18} />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---------- FOOTER ---------- */}
      <footer className="border-t border-zinc-900 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo light />
          <p className="text-sm text-zinc-600">Built with Node.js · Express · React · PostgreSQL · Prisma</p>
          <div className="flex gap-4 text-sm">
            <Link to="/login" className="text-zinc-400 hover:text-white">Sign in</Link>
            <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-medium">Get started</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureRow({ n, eyebrow, title, desc, bullets, mockup, reverse }) {
  return (
    <section className="max-w-6xl mx-auto px-6 py-14">
      <div className={`grid md:grid-cols-2 gap-12 items-center ${reverse ? 'md:[direction:rtl]' : ''}`}>
        <Reveal className="[direction:ltr]">
          <div className="text-emerald-400 font-bold text-sm mb-3">{n}</div>
          <p className="text-zinc-500 text-sm font-medium mb-2">{eyebrow}</p>
          <h3 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">{title}</h3>
          <p className="text-zinc-400 leading-relaxed mb-6">{desc}</p>
          <ul className="space-y-3">
            {bullets.map(b => (
              <li key={b} className="flex items-center gap-3 text-zinc-300">
                <span className="w-5 h-5 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <Check size={12} />
                </span>
                <span className="text-sm">{b}</span>
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={0.1} className="[direction:ltr]">
          <div className="bg-[#0f0f0f] border border-zinc-800 rounded-3xl p-6">{mockup}</div>
        </Reveal>
      </div>
    </section>
  );
}
