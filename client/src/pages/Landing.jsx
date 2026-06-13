import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Users, Wallet, Upload, PieChart, ShieldCheck,
  Sparkles, Check, TrendingUp, Receipt, Globe
} from 'lucide-react';

const USE_CASES = ['Flatmates', 'Goa Trips', 'Roommates', 'Couples', 'Office Lunches', 'House Parties', 'Vacations', 'Hostels'];

export default function Landing() {
  const [splash, setSplash] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setSplash(false), 1900);
    return () => clearTimeout(t);
  }, []);

  if (splash) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950">
        <div style={{ animation: 'splashLogo 1.9s ease forwards' }} className="flex items-center gap-3 text-5xl font-extrabold text-white">
          <span className="text-6xl">💸</span>
          <span className="gradient-text">SplitWise</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* NAV */}
      <nav className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xl font-extrabold">
            <span className="text-2xl">💸</span>
            <span className="gradient-text">SplitWise</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-indigo-600 transition">Features</a>
            <a href="#how" className="hover:text-indigo-600 transition">How it works</a>
            <a href="#why" className="hover:text-indigo-600 transition">Why us</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-indigo-600 px-4 py-2 transition">Sign in</Link>
            <Link to="/register" className="text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 rounded-full hover:shadow-lg hover:shadow-indigo-200 transition">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative max-w-7xl mx-auto px-6 pt-16 pb-24 grid lg:grid-cols-2 gap-12 items-center">
        {/* blobs */}
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-indigo-200 rounded-full blur-3xl opacity-40 animate-blob"></div>
        <div className="absolute top-40 right-0 w-96 h-96 bg-purple-200 rounded-full blur-3xl opacity-40 animate-blob" style={{ animationDelay: '4s' }}></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-pink-200 rounded-full blur-3xl opacity-30 animate-blob" style={{ animationDelay: '8s' }}></div>

        {/* Left */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-semibold px-4 py-1.5 rounded-full mb-7 animate-fade-up">
            <Sparkles size={13} /> Smart expense splitting, reinvented
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold leading-[1.05] tracking-tight text-slate-900 mb-6 animate-fade-up delay-1">
            Split expenses,<br />
            <span className="gradient-text">not friendships.</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-md mb-9 animate-fade-up delay-2">
            Track shared spending, handle multi-currency trips, import messy spreadsheets, and settle up — all without the awkward "who owes what" conversation.
          </p>
          <div className="flex items-center gap-4 mb-12 animate-fade-up delay-3">
            <Link to="/register" className="group inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold px-7 py-3.5 rounded-full hover:shadow-xl hover:shadow-indigo-200 transition">
              Start free
              <ArrowRight size={18} className="group-hover:translate-x-1 transition" />
            </Link>
            <a href="#features" className="font-semibold text-slate-700 hover:text-indigo-600 px-4 py-3.5 transition">Learn more</a>
          </div>
          <div className="flex items-center gap-8 animate-fade-up delay-4">
            {[['4', 'Split types'], ['2', 'Currencies'], ['12+', 'Anomaly checks']].map(([n, l]) => (
              <div key={l}>
                <div className="text-3xl font-extrabold text-slate-900">{n}</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — app mockup */}
        <div className="relative z-10 animate-fade-up delay-3">
          <div className="relative bg-white rounded-3xl shadow-2xl shadow-indigo-100 border border-slate-100 p-6 animate-float">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-3 h-3 rounded-full bg-red-300"></div>
              <div className="w-3 h-3 rounded-full bg-amber-300"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-300"></div>
              <span className="ml-2 text-xs text-slate-400 font-medium">Goa Trip 2024</span>
            </div>

            {/* balance rows */}
            <div className="space-y-3">
              {[
                { n: 'Aisha', c: 'bg-indigo-500', amt: '+₹2,340', pos: true },
                { n: 'Rohan', c: 'bg-purple-500', amt: '−₹1,180', pos: false },
                { n: 'Priya', c: 'bg-pink-500', amt: '+₹890', pos: true },
                { n: 'Dev', c: 'bg-emerald-500', amt: '−₹2,050', pos: false },
              ].map(r => (
                <div key={r.n} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full ${r.c} text-white flex items-center justify-center text-sm font-bold`}>{r.n[0]}</div>
                    <span className="font-medium text-slate-700 text-sm">{r.n}</span>
                  </div>
                  <span className={`font-bold text-sm ${r.pos ? 'text-emerald-600' : 'text-red-500'}`}>{r.amt}</span>
                </div>
              ))}
            </div>

            {/* settlement chip */}
            <div className="mt-5 flex items-center justify-between bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <TrendingUp size={16} /> Rohan pays Aisha
              </div>
              <span className="font-bold">₹1,180</span>
            </div>
          </div>

          {/* floating mini cards */}
          <div className="absolute -left-6 -bottom-6 bg-white rounded-2xl shadow-xl border border-slate-100 px-4 py-3 animate-float" style={{ animationDelay: '1.5s' }}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center">💱</div>
              <div>
                <div className="text-xs text-slate-400">USD → INR</div>
                <div className="text-sm font-bold text-slate-700">$50 = ₹4,175</div>
              </div>
            </div>
          </div>
          <div className="absolute -right-4 top-10 bg-white rounded-2xl shadow-xl border border-slate-100 px-4 py-3 animate-float" style={{ animationDelay: '2.5s' }}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center"><Check size={16} className="text-emerald-600" /></div>
              <div className="text-sm font-bold text-slate-700">All settled!</div>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <section className="border-y border-slate-100 bg-slate-50/50 py-8 overflow-hidden">
        <p className="text-center text-xs font-semibold text-slate-400 uppercase tracking-[0.2em] mb-6">Built for every shared wallet</p>
        <div className="relative flex">
          <div className="flex gap-12 animate-marquee whitespace-nowrap pr-12">
            {[...USE_CASES, ...USE_CASES].map((u, i) => (
              <span key={i} className="text-2xl font-bold text-slate-300 flex items-center gap-12">
                {u}<span className="text-indigo-200">•</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES INTRO */}
      <section id="features" className="max-w-3xl mx-auto px-6 text-center pt-24 pb-12">
        <p className="text-indigo-600 font-semibold text-sm uppercase tracking-wider mb-3">Features</p>
        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
          Everything you need to <span className="gradient-text">settle up fairly.</span>
        </h2>
        <p className="text-lg text-slate-500">From messy CSV imports to multi-currency trips, SplitWise handles the hard parts so your group doesn't have to.</p>
      </section>

      {/* FEATURE SECTIONS */}
      <FeatureRow
        eyebrow="Smart Balances"
        title="One number per person. Done."
        desc="Our min-cash-flow engine collapses dozens of expenses into the fewest possible payments. No more circular IOUs — just who pays whom, and how much."
        bullets={['Per-member net balances', 'Click any member for a full breakdown', 'Minimized settlement transactions']}
        icon={<PieChart size={22} />}
        mockup={
          <div className="space-y-3">
            {[['Rohan → Aisha', '₹1,180'], ['Dev → Priya', '₹890'], ['Dev → Aisha', '₹1,160']].map(([t, a]) => (
              <div key={t} className="flex items-center justify-between bg-white rounded-xl px-4 py-3 shadow-sm">
                <span className="text-sm font-medium text-slate-600">{t}</span>
                <span className="font-bold text-indigo-600">{a}</span>
              </div>
            ))}
          </div>
        }
      />

      <FeatureRow
        reverse
        eyebrow="Multi-currency"
        title="A dollar isn't a rupee."
        desc="Half your trip was in USD? SplitWise auto-converts every foreign expense to INR at the right rate, while preserving the original amount for a clean audit trail."
        bullets={['Automatic USD → INR conversion', 'Original + converted amounts stored', 'Per-expense exchange rate locked in']}
        icon={<Globe size={22} />}
        mockup={
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-500">Beach dinner</span>
              <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-semibold">USD</span>
            </div>
            <div className="text-3xl font-extrabold text-slate-900">₹4,175.00</div>
            <div className="text-sm text-slate-400 mt-1">$50.00 × ₹83.50</div>
          </div>
        }
      />

      <FeatureRow
        eyebrow="CSV Import"
        title="Import the mess. We'll flag it."
        desc="Drop in a real-world spreadsheet and watch SplitWise detect duplicates, bad dates, refunds, settlements logged as expenses, and members who already moved out — every anomaly surfaced, never silently guessed."
        bullets={['12+ anomaly detectors', 'Full reviewable audit log', 'Nothing deleted without a record']}
        icon={<Upload size={22} />}
        mockup={
          <div className="space-y-2">
            {[
              ['error', 'Row 7 — invalid date', 'bg-red-50 text-red-600'],
              ['warning', 'Row 12 — duplicate dinner', 'bg-amber-50 text-amber-600'],
              ['info', 'Row 15 — USD converted', 'bg-blue-50 text-blue-600'],
            ].map(([sev, txt, cls]) => (
              <div key={txt} className={`flex items-center gap-2 ${cls} rounded-xl px-3 py-2.5`}>
                <span className="w-2 h-2 rounded-full bg-current"></span>
                <span className="text-sm font-medium">{txt}</span>
                <span className="ml-auto text-xs font-semibold uppercase opacity-70">{sev}</span>
              </div>
            ))}
          </div>
        }
      />

      {/* HOW IT WORKS */}
      <section id="how" className="bg-slate-50 border-y border-slate-100 py-24">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-indigo-600 font-semibold text-sm uppercase tracking-wider mb-3">How it works</p>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-16">Settle up in three steps.</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Users size={24} />, step: '01', title: 'Create a group', desc: 'Add your flatmates or trip crew. Members can join and leave with real dates.' },
              { icon: <Receipt size={24} />, step: '02', title: 'Add expenses', desc: 'Log spending with equal, exact, percentage, or share-based splits — in any currency.' },
              { icon: <Wallet size={24} />, step: '03', title: 'Settle up', desc: 'See exactly who owes whom, record payments, and watch every balance hit zero.' },
            ].map((s, i) => (
              <div key={s.step} className="relative bg-white rounded-2xl p-8 border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center mb-5 mx-auto">{s.icon}</div>
                <div className="text-xs font-bold text-indigo-300 mb-2">{s.step}</div>
                <h3 className="font-bold text-slate-800 text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY / TRUST */}
      <section id="why" className="max-w-6xl mx-auto px-6 py-24 grid md:grid-cols-3 gap-6">
        {[
          { icon: <ShieldCheck size={22} />, title: 'Auditable by design', desc: 'Every import decision is logged. Approve changes before anything is deleted.' },
          { icon: <Users size={22} />, title: 'Time-aware membership', desc: 'Moved out in March? You won\'t be charged for April\'s electricity bill.' },
          { icon: <Sparkles size={22} />, title: 'Built on real data', desc: 'Relational Postgres schema designed to handle the messiest of spreadsheets.' },
        ].map(c => (
          <div key={c.title} className="bg-white rounded-2xl p-7 border border-slate-100 hover:border-indigo-200 hover:shadow-md transition">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">{c.icon}</div>
            <h3 className="font-bold text-slate-800 mb-2">{c.title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{c.desc}</p>
          </div>
        ))}
      </section>

      {/* CTA BAND */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 px-8 py-16 text-center">
          <div className="absolute -top-16 -left-16 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">Stop chasing your friends for money.</h2>
            <p className="text-indigo-100 text-lg mb-8 max-w-xl mx-auto">Create your first group in 30 seconds. Free forever, no card required.</p>
            <Link to="/register" className="inline-flex items-center gap-2 bg-white text-indigo-600 font-bold px-8 py-4 rounded-full hover:shadow-2xl hover:scale-105 transition">
              Get started free <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-100 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-extrabold">
            <span className="text-xl">💸</span>
            <span className="gradient-text">SplitWise</span>
          </div>
          <p className="text-sm text-slate-400">Built with Node.js · Express · React · PostgreSQL · Prisma</p>
          <div className="flex gap-3">
            <Link to="/login" className="text-sm text-slate-500 hover:text-indigo-600">Sign in</Link>
            <Link to="/register" className="text-sm font-semibold text-indigo-600 hover:underline">Get started</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureRow({ eyebrow, title, desc, bullets, icon, mockup, reverse }) {
  return (
    <section className="max-w-6xl mx-auto px-6 py-14">
      <div className={`grid md:grid-cols-2 gap-12 items-center ${reverse ? 'md:[direction:rtl]' : ''}`}>
        <div className="[direction:ltr]">
          <div className="inline-flex items-center gap-2 w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 justify-center mb-5">{icon}</div>
          <p className="text-indigo-600 font-semibold text-sm uppercase tracking-wider mb-2">{eyebrow}</p>
          <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-4">{title}</h3>
          <p className="text-slate-500 leading-relaxed mb-6">{desc}</p>
          <ul className="space-y-3">
            {bullets.map(b => (
              <li key={b} className="flex items-center gap-3 text-slate-700">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Check size={13} />
                </span>
                <span className="text-sm font-medium">{b}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="[direction:ltr]">
          <div className="bg-gradient-to-br from-slate-50 to-indigo-50/50 rounded-3xl p-6 border border-slate-100">
            {mockup}
          </div>
        </div>
      </div>
    </section>
  );
}
