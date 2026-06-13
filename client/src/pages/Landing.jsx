import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 text-2xl font-bold">
          <span className="text-3xl">💸</span>
          <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">SplitWise</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-slate-300 hover:text-white px-4 py-2 rounded-lg transition text-sm">Log in</Link>
          <Link to="/register" className="bg-indigo-500 hover:bg-indigo-400 px-5 py-2 rounded-lg text-sm font-medium transition">Get started free</Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-5xl mx-auto text-center px-6 pt-20 pb-16">
        <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs px-4 py-1.5 rounded-full mb-8">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
          Built for the Spreetail Assignment
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight">
          Split expenses,<br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">not friendships.</span>
        </h1>
        <p className="text-slate-400 text-xl max-w-2xl mx-auto mb-10">
          Track shared expenses, handle multi-currency splits, import messy CSVs, and settle debts — all in one place.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link to="/register" className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white px-8 py-3.5 rounded-xl font-semibold text-lg transition shadow-lg shadow-indigo-900/50">
            Start splitting for free →
          </Link>
          <Link to="/login" className="border border-slate-700 hover:border-slate-500 text-slate-300 px-8 py-3.5 rounded-xl font-medium text-lg transition">
            Log in
          </Link>
        </div>
      </div>

      {/* Feature cards */}
      <div className="max-w-6xl mx-auto px-6 pb-20 grid md:grid-cols-3 gap-5">
        {[
          { icon: '👥', title: 'Time-based Groups', desc: 'Members join and leave with dates. Sam\'s April expenses don\'t affect March balances.' },
          { icon: '💱', title: 'Multi-currency', desc: 'USD expenses auto-converted to INR. No more "the sheet pretends a dollar is a rupee."' },
          { icon: '📊', title: 'Smart Balances', desc: 'Min-cash-flow algorithm gives you the fewest possible transactions to settle everyone.' },
          { icon: '📥', title: 'CSV Import', desc: 'Import messy spreadsheets. Duplicates, bad dates, missing fields — all detected & surfaced.' },
          { icon: '🔍', title: 'Full Audit Trail', desc: 'Every anomaly logged. Meera can review before anything is deleted or changed.' },
          { icon: '⚡', title: 'Equal / Exact / % / Shares', desc: 'All split types supported. Pick the right one for every expense.' },
        ].map(f => (
          <div key={f.title} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition">
            <div className="text-4xl mb-3">{f.icon}</div>
            <h3 className="font-bold text-white mb-1">{f.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      <div className="text-center text-slate-600 text-xs pb-6">Built with Node.js · Express · React · PostgreSQL (Neon) · Prisma</div>
    </div>
  );
}
