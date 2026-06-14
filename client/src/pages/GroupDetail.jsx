import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Plus, ArrowLeft, Upload, Check, X, Info, AlertTriangle, ArrowLeftRight, Home, Receipt, TrendingUp, Users, ArrowRight } from 'lucide-react';

const TABS = ['Expenses', 'Balances', 'Settlements', 'Members', 'Import'];

const avatarGrads = [
  'linear-gradient(135deg,#6366f1,#d946ef)',
  'linear-gradient(135deg,#10b981,#06b6d4)',
  'linear-gradient(135deg,#f97316,#f43f5e)',
  'linear-gradient(135deg,#8b5cf6,#ec4899)',
  'linear-gradient(135deg,#2563eb,#06b6d4)',
  'linear-gradient(135deg,#f43f5e,#fb7185)',
];

const inputCls = "w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none transition";
const inputStyle = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' };

function DarkInput({ label, ...props }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-white/50 mb-1.5">{label}</label>}
      <input className={inputCls} style={inputStyle}
        onFocus={e => e.target.style.borderColor = 'rgb(var(--accent)/0.6)'}
        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
        {...props} />
    </div>
  );
}

function DarkSelect({ label, children, ...props }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-white/50 mb-1.5">{label}</label>}
      <select className={inputCls} style={{ ...inputStyle, colorScheme: 'dark' }}
        onFocus={e => e.target.style.borderColor = 'rgb(var(--accent)/0.6)'}
        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
        {...props}>{children}</select>
    </div>
  );
}

export default function GroupDetail() {
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [balances, setBalances] = useState(null);
  const [settlements, setSettlements] = useState([]);
  const [importLogs, setImportLogs] = useState([]);
  const [tab, setTab] = useState('Expenses');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showSettle, setShowSettle] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [breakdown, setBreakdown] = useState(null);
  const [breakdownMember, setBreakdownMember] = useState(null);

  const [expenseForm, setExpenseForm] = useState({
    description: '', amount: '', currency: 'INR', exchangeRate: 95.11,
    splitType: 'equal', date: new Date().toISOString().slice(0, 10), paidById: '', notes: '',
  });
  const [settleForm, setSettleForm] = useState({
    paidById: '', paidToId: '', amount: '', date: new Date().toISOString().slice(0, 10), notes: '',
  });

  const fetchAll = async () => {
    try {
      const [gRes, bRes, sRes, lRes] = await Promise.all([
        api.get(`/groups/${id}`),
        api.get(`/balances/${id}`),
        api.get(`/settlements?groupId=${id}`),
        api.get(`/import/logs/${id}`),
      ]);
      setGroup(gRes.data);
      setBalances(bRes.data);
      setSettlements(sRes.data);
      setImportLogs(lRes.data);
    } catch { toast.error('Failed to load group'); }
  };

  useEffect(() => { fetchAll(); }, [id]);

  const addExpense = async (e) => {
    e.preventDefault();
    try {
      const rate = expenseForm.currency === 'USD' ? parseFloat(expenseForm.exchangeRate) : 1;
      await api.post('/expenses', { ...expenseForm, groupId: id, exchangeRate: rate });
      toast.success('Expense added!');
      setShowAddExpense(false);
      setExpenseForm({ description: '', amount: '', currency: 'INR', exchangeRate: 95.11, splitType: 'equal', date: new Date().toISOString().slice(0, 10), paidById: '', notes: '' });
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const addSettlement = async (e) => {
    e.preventDefault();
    try {
      await api.post('/settlements', { ...settleForm, groupId: id });
      toast.success('Settlement recorded!');
      setShowSettle(false);
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const deleteExpense = async (expId) => {
    if (!confirm('Delete this expense?')) return;
    try { await api.delete(`/expenses/${expId}`); toast.success('Deleted'); fetchAll(); }
    catch { toast.error('Failed'); }
  };

  const handleCSVUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file); fd.append('groupId', id);
    try {
      const res = await api.post('/import/csv', fd);
      setImportResult(res.data);
      toast.success(`Imported ${res.data.imported} expenses`);
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.error || 'Import failed'); }
    finally { setUploading(false); }
  };

  const fetchBreakdown = async (member) => {
    try {
      const res = await api.get(`/balances/${id}/${member.id}`);
      setBreakdown(res.data); setBreakdownMember(member);
    } catch { toast.error('Failed'); }
  };

  if (!group) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0d0d12' }}>
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-white/30 text-sm">Loading...</p>
      </div>
    </div>
  );

  const activeMembers = group.memberships.filter(m => !m.leftAt);
  const pendingLogs = importLogs.filter(l => l.status === 'pending').length;
  const modalBg = { background: '#141418', border: '1px solid rgba(255,255,255,0.1)' };

  return (
    <div className="min-h-screen flex" style={{ background: '#0d0d12' }}>

      {/* ── SIDEBAR ── */}
      <aside className="w-64 min-h-screen fixed left-0 top-0 flex flex-col z-40"
        style={{ background: 'rgba(255,255,255,0.03)', borderRight: '1px solid rgba(255,255,255,0.07)' }}>

        {/* back nav */}
        <div className="px-4 py-4 border-b border-white/6">
          <div className="flex items-center justify-between mb-4">
            <Link to="/dashboard" className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition">
              <ArrowLeft size={14}/> All groups
            </Link>
            <Link to="/" className="text-white/30 hover:text-white transition p-1"><Home size={14}/></Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0"
              style={{ background: avatarGrads[0] }}>
              {group.name[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-white text-sm truncate">{group.name}</p>
              <p className="text-[11px] text-white/30">{group.memberships.length} members</p>
            </div>
          </div>
        </div>

        {/* tabs */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition flex items-center justify-between"
              style={{
                background: tab === t ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: tab === t ? 'white' : 'rgba(255,255,255,0.45)',
              }}
              onMouseEnter={e => { if (tab !== t) e.currentTarget.style.background='rgba(255,255,255,0.04)'; }}
              onMouseLeave={e => { if (tab !== t) e.currentTarget.style.background='transparent'; }}>
              <span>{t}</span>
              {t === 'Import' && pendingLogs > 0 && (
                <span className="text-[10px] font-bold bg-orange-500 text-white px-1.5 py-0.5 rounded-full">{pendingLogs}</span>
              )}
            </button>
          ))}
        </nav>

        {/* actions */}
        <div className="px-3 py-4 border-t border-white/6 space-y-2">
          <button onClick={() => setShowAddExpense(true)}
            className="w-full bg-accent-grad text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition shadow-accent-glow">
            <Plus size={15}/> Add Expense
          </button>
          <button onClick={() => setShowSettle(true)}
            className="w-full py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition text-white/50 hover:text-white hover:bg-white/6"
            style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
            <Check size={15}/> Settle Up
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="ml-64 flex-1 p-8">
        <div className="mb-7">
          <h1 className="text-2xl font-extrabold text-white tracking-tight">{group.name}</h1>
          <p className="text-white/35 text-sm mt-1">{group.description || 'No description'}</p>
        </div>

        {/* ── EXPENSES TAB ── */}
        {tab === 'Expenses' && (
          <div className="space-y-3">
            {group.expenses.length === 0 ? (
              <div className="rounded-3xl p-16 text-center"
                style={{ background: 'rgba(255,255,255,0.03)', border: '2px dashed rgba(255,255,255,0.08)' }}>
                <div className="w-14 h-14 mx-auto rounded-2xl bg-accent-grad flex items-center justify-center mb-4 shadow-accent-glow">
                  <Receipt size={24} className="text-white"/>
                </div>
                <h3 className="font-bold text-white text-lg mb-2">No expenses yet</h3>
                <p className="text-white/35 text-sm mb-6">Add your first expense or import a CSV file</p>
                <div className="flex gap-3 justify-center">
                  <button onClick={() => setShowAddExpense(true)}
                    className="bg-accent-grad text-white px-5 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition">
                    Add Expense
                  </button>
                  <button onClick={() => setTab('Import')}
                    className="text-white/50 px-5 py-2 rounded-xl text-sm font-medium hover:text-white hover:bg-white/6 transition"
                    style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                    Import CSV
                  </button>
                </div>
              </div>
            ) : group.expenses.map((exp) => (
              <div key={exp.id}
                className="rounded-2xl p-4 transition group"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor='rgb(var(--accent)/0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'; }}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center"
                      style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <Receipt size={18} className="text-white/40"/>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-white text-sm">{exp.description}</span>
                        {exp.isSettlement && <span className="text-[10px] bg-green-500/20 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full">Settlement</span>}
                        <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgb(var(--accent)/0.15)', color: 'rgb(var(--accent))' }}>{exp.splitType}</span>
                        {exp.currency !== 'INR' && <span className="text-[10px] bg-orange-500/15 text-orange-400 border border-orange-400/20 px-2 py-0.5 rounded-full">USD</span>}
                        {exp.importRow && <span className="text-[10px] text-white/20 px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>Row {exp.importRow}</span>}
                      </div>
                      <p className="text-xs text-white/40">
                        Paid by <span className="text-accent font-medium">{exp.paidBy?.displayName || 'Unknown'}</span>
                        <span className="mx-2 text-white/15">·</span>
                        {new Date(exp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {exp.splits.map(s => (
                          <span key={s.id} className="text-[10px] px-2 py-0.5 rounded-lg text-white/35"
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
                            {s.member?.displayName || '?'}: ₹{Number(s.amountInr).toFixed(0)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 flex-shrink-0 ml-4">
                    <div className="text-right">
                      <p className="text-base font-bold text-white">₹{Number(exp.amountInr).toFixed(2)}</p>
                      {exp.currency !== 'INR' && <p className="text-[11px] text-white/30">${Number(exp.amount).toFixed(2)}</p>}
                    </div>
                    <button onClick={() => deleteExpense(exp.id)}
                      className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition p-1">
                      <X size={14}/>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── BALANCES TAB ── */}
        {tab === 'Balances' && balances && (
          <div className="space-y-5">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {balances.members.map((m, i) => (
                <div key={m.id} onClick={() => fetchBreakdown(m)}
                  className="rounded-2xl p-5 cursor-pointer transition-all duration-300"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                  onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.08)'; e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.borderColor='rgb(var(--accent)/0.3)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.transform=''; e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'; }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
                      style={{ background: avatarGrads[i % avatarGrads.length] }}>
                      {(m.displayName || '?')[0].toUpperCase()}
                    </div>
                    <span className="font-semibold text-white text-sm">{m.displayName}</span>
                  </div>
                  <div className={`text-2xl font-extrabold mb-1 ${m.net > 0 ? 'text-emerald-400' : m.net < 0 ? 'text-red-400' : 'text-white/30'}`}>
                    {m.net > 0 ? '+' : ''}₹{Math.abs(m.net).toFixed(2)}
                  </div>
                  <p className="text-[11px] text-white/30">
                    {m.net > 0 ? 'gets back' : m.net < 0 ? 'owes' : 'settled'}
                  </p>
                  <p className="text-[11px] text-accent mt-2 opacity-60">Tap for breakdown →</p>
                </div>
              ))}
            </div>

            {/* Suggested settlements */}
            <div className="rounded-2xl p-6"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center gap-2 mb-5">
                <TrendingUp size={16} className="text-accent"/>
                <h3 className="font-bold text-white">Suggested Settlements</h3>
              </div>
              {balances.transactions.length === 0 ? (
                <div className="text-center py-6">
                  <div className="text-3xl mb-2">🎉</div>
                  <p className="text-white/40 font-medium text-sm">All settled up!</p>
                </div>
              ) : balances.transactions.map((t, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: avatarGrads[balances.members.findIndex(m => m.id === parseInt(t.from?.id)) % avatarGrads.length] }}>
                      {(t.from?.displayName||'?')[0].toUpperCase()}
                    </div>
                    <span className="text-sm">
                      <span className="font-semibold text-red-400">{t.from?.displayName}</span>
                      <span className="text-white/30 mx-2">pays</span>
                      <span className="font-semibold text-emerald-400">{t.to?.displayName}</span>
                    </span>
                  </div>
                  <span className="font-bold text-white">₹{t.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Breakdown modal */}
            {breakdown && breakdownMember && (
              <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
                style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)' }}
                onClick={() => setBreakdown(null)}>
                <div className="w-full max-w-lg rounded-3xl p-6 shadow-2xl max-h-[80vh] overflow-y-auto" style={modalBg}
                  onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold text-white">Breakdown · {breakdownMember.displayName}</h3>
                    <button onClick={() => setBreakdown(null)} className="text-white/30 hover:text-white transition"><X size={18}/></button>
                  </div>
                  <div className="space-y-2">
                    {breakdown.map(item => (
                      <div key={item.expenseId} className="p-3.5 rounded-2xl"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-white text-sm">{item.description}</span>
                          <span className={`font-bold text-sm ${item.net > 0 ? 'text-emerald-400' : item.net < 0 ? 'text-red-400' : 'text-white/30'}`}>
                            {item.net > 0 ? '+' : ''}₹{item.net.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-xs text-white/30 flex gap-4">
                          <span>{new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                          {item.paid > 0 && <span className="text-emerald-400">paid ₹{item.paid.toFixed(2)}</span>}
                          {item.owes > 0 && <span className="text-red-400">owes ₹{item.owes.toFixed(2)}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── SETTLEMENTS TAB ── */}
        {tab === 'Settlements' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-4">
              <p className="text-white/40 text-sm">{settlements.length} settlement{settlements.length !== 1 ? 's' : ''}</p>
              <button onClick={() => setShowSettle(true)} className="flex items-center gap-1.5 text-accent text-sm font-medium hover:opacity-80 transition">
                <Plus size={14}/> Record payment
              </button>
            </div>
            {settlements.length === 0 ? (
              <div className="rounded-3xl p-12 text-center"
                style={{ background: 'rgba(255,255,255,0.03)', border: '2px dashed rgba(255,255,255,0.07)' }}>
                <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-4 border border-emerald-500/20">
                  <ArrowLeftRight size={22} className="text-emerald-400"/>
                </div>
                <h3 className="font-bold text-white mb-2">No settlements yet</h3>
                <p className="text-white/35 text-sm">Record a payment when someone settles their debt</p>
              </div>
            ) : settlements.map(s => (
              <div key={s.id} className="rounded-2xl p-4 flex items-center justify-between"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center border border-emerald-500/20">
                    <ArrowLeftRight size={17} className="text-emerald-400"/>
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      <span className="text-red-400">{s.paidBy?.displayName}</span>
                      <span className="text-white/30 mx-2">→</span>
                      <span className="text-emerald-400">{s.paidTo?.displayName}</span>
                    </p>
                    <p className="text-xs text-white/30">
                      {new Date(s.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {s.notes ? ` · ${s.notes}` : ''}
                    </p>
                  </div>
                </div>
                <span className="font-bold text-emerald-400 text-lg">₹{Number(s.amount).toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── MEMBERS TAB ── */}
        {tab === 'Members' && (
          <div className="rounded-2xl overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="px-6 py-4 border-b border-white/6">
              <h3 className="font-bold text-white flex items-center gap-2"><Users size={16}/> Group Members</h3>
              <p className="text-xs text-white/30 mt-0.5">Join and leave dates determine which expenses each member shares</p>
            </div>
            <div className="divide-y divide-white/5">
              {group.memberships.map((m, i) => (
                <div key={m.id} className="px-6 py-4 flex items-center justify-between hover:bg-white/3 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
                      style={{ background: avatarGrads[i % avatarGrads.length] }}>
                      {(m.displayName || m.user?.username || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">{m.displayName || m.user?.username}</p>
                      <p className="text-xs text-white/30">@{m.user?.username}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-white/30">
                    <span>Joined {new Date(m.joinedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    {m.leftAt ? (
                      <span className="bg-orange-500/15 text-orange-400 border border-orange-400/20 px-2.5 py-1 rounded-full font-medium">
                        Left {new Date(m.leftAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    ) : (
                      <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-400/20 px-2.5 py-1 rounded-full font-medium">Active</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── IMPORT TAB ── */}
        {tab === 'Import' && (
          <div className="space-y-5">
            <div className="rounded-3xl p-10 text-center transition"
              style={{ background: 'rgba(255,255,255,0.03)', border: '2px dashed rgb(var(--accent)/0.3)' }}>
              <div className="w-14 h-14 mx-auto rounded-2xl bg-accent-grad flex items-center justify-center mb-4 shadow-accent-glow">
                <Upload size={22} className="text-white"/>
              </div>
              <h3 className="font-bold text-white mb-1">Import CSV File</h3>
              <p className="text-white/35 text-sm mb-6">Upload <strong className="text-white/60">expenses_export.csv</strong> — anomalies detected automatically</p>
              <label className={`inline-flex items-center gap-2 cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''} bg-accent-grad text-white px-6 py-3 rounded-2xl text-sm font-semibold hover:opacity-90 transition shadow-accent-glow`}>
                <Upload size={15}/>
                {uploading ? 'Importing...' : 'Choose CSV File'}
                <input type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" disabled={uploading}/>
              </label>
            </div>

            {importResult && (
              <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <h3 className="font-bold text-white mb-4">Import Report</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    [importResult.imported, 'Imported', 'text-emerald-400', 'bg-emerald-500/10 border-emerald-500/20'],
                    [importResult.skipped, 'Skipped', 'text-red-400', 'bg-red-500/10 border-red-500/20'],
                    [importResult.anomalies, 'Anomalies', 'text-amber-400', 'bg-amber-500/10 border-amber-500/20'],
                  ].map(([val, label, tc, bg]) => (
                    <div key={label} className={`text-center rounded-xl p-4 border ${bg}`}>
                      <div className={`text-3xl font-extrabold ${tc}`}>{val}</div>
                      <div className="text-xs text-white/35 mt-1">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {importLogs.length > 0 && (
              <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="px-5 py-4 border-b border-white/6 flex items-center justify-between">
                  <h3 className="font-bold text-white">Anomaly Log</h3>
                  <span className="text-xs text-white/30">{importLogs.length} issues</span>
                </div>
                <div className="max-h-96 overflow-y-auto divide-y divide-white/5">
                  {importLogs.map(log => (
                    <div key={log.id} className="px-5 py-3 flex items-start gap-3">
                      <div className="mt-0.5 flex-shrink-0">
                        {log.severity === 'error' ? <X size={13} className="text-red-400"/> :
                         log.severity === 'warning' ? <AlertTriangle size={13} className="text-amber-400"/> :
                         <Info size={13} className="text-blue-400"/>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span className="text-xs font-semibold text-white/60">Row {log.rowNumber}</span>
                          <span className="text-white/20">·</span>
                          <span className="text-xs text-white/40">{log.issueType.replace(/_/g, ' ')}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ml-auto ${
                            log.severity === 'error' ? 'bg-red-500/15 text-red-400' :
                            log.severity === 'warning' ? 'bg-amber-500/15 text-amber-400' : 'bg-blue-500/15 text-blue-400'
                          }`}>{log.severity}</span>
                        </div>
                        <p className="text-xs text-white/35">{log.issueDescription}</p>
                        {log.actionTaken && <p className="text-xs text-white/20 mt-0.5 italic">→ {log.actionTaken}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── ADD EXPENSE MODAL ── */}
      {showAddExpense && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)' }}>
          <div className="w-full max-w-lg rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto" style={modalBg}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-white">Add Expense</h2>
                <p className="text-white/30 text-xs mt-0.5">Split fairly among active members</p>
              </div>
              <button onClick={() => setShowAddExpense(false)} className="text-white/30 hover:text-white transition"><X size={18}/></button>
            </div>
            <form onSubmit={addExpense} className="space-y-4">
              <DarkInput label="Description *" required placeholder="e.g. Dinner at Barbeque Nation"
                value={expenseForm.description} onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <DarkInput label="Amount *" required type="number" step="0.01" min="0.01" placeholder="0.00"
                  value={expenseForm.amount} onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })} />
                <DarkSelect label="Currency"
                  value={expenseForm.currency} onChange={e => setExpenseForm({ ...expenseForm, currency: e.target.value })}>
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                </DarkSelect>
              </div>
              {expenseForm.currency === 'USD' && expenseForm.amount && (
                <div className="rounded-xl p-3 text-sm" style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)', color: '#fb923c' }}>
                  💱 ${expenseForm.amount} × ₹{expenseForm.exchangeRate} = <strong>₹{(parseFloat(expenseForm.amount || 0) * expenseForm.exchangeRate).toFixed(2)}</strong>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <DarkSelect label="Paid by *" required
                  value={expenseForm.paidById} onChange={e => setExpenseForm({ ...expenseForm, paidById: e.target.value })}>
                  <option value="">Select member</option>
                  {activeMembers.map(m => <option key={m.id} value={m.id}>{m.displayName || m.user?.username}</option>)}
                </DarkSelect>
                <DarkSelect label="Split type"
                  value={expenseForm.splitType} onChange={e => setExpenseForm({ ...expenseForm, splitType: e.target.value })}>
                  <option value="equal">Equal</option>
                  <option value="exact">Exact amounts</option>
                  <option value="percentage">Percentage</option>
                  <option value="shares">By shares</option>
                </DarkSelect>
              </div>
              <DarkInput label="Date *" type="date" required
                value={expenseForm.date} onChange={e => setExpenseForm({ ...expenseForm, date: e.target.value })} />
              <DarkInput label="Notes" placeholder="Optional notes"
                value={expenseForm.notes} onChange={e => setExpenseForm({ ...expenseForm, notes: e.target.value })} />
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowAddExpense(false)}
                  className="flex-1 py-3 rounded-xl text-sm font-medium text-white/40 hover:text-white transition"
                  style={{ border: '1px solid rgba(255,255,255,0.1)' }}>Cancel</button>
                <button type="submit" className="flex-1 bg-accent-grad text-white py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition shadow-accent-glow">
                  Add Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── SETTLE MODAL ── */}
      {showSettle && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)' }}>
          <div className="w-full max-w-md rounded-3xl p-6 shadow-2xl" style={modalBg}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-white">Record Settlement</h2>
                <p className="text-white/30 text-xs mt-0.5">Log a payment between members</p>
              </div>
              <button onClick={() => setShowSettle(false)} className="text-white/30 hover:text-white transition"><X size={18}/></button>
            </div>
            <form onSubmit={addSettlement} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <DarkSelect label="Who paid?" required
                  value={settleForm.paidById} onChange={e => setSettleForm({ ...settleForm, paidById: e.target.value })}>
                  <option value="">Select</option>
                  {group.memberships.map(m => <option key={m.id} value={m.id}>{m.displayName || m.user?.username}</option>)}
                </DarkSelect>
                <DarkSelect label="Who received?" required
                  value={settleForm.paidToId} onChange={e => setSettleForm({ ...settleForm, paidToId: e.target.value })}>
                  <option value="">Select</option>
                  {group.memberships.map(m => <option key={m.id} value={m.id}>{m.displayName || m.user?.username}</option>)}
                </DarkSelect>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <DarkInput label="Amount (₹)" required type="number" step="0.01" min="0.01" placeholder="0.00"
                  value={settleForm.amount} onChange={e => setSettleForm({ ...settleForm, amount: e.target.value })} />
                <DarkInput label="Date" type="date"
                  value={settleForm.date} onChange={e => setSettleForm({ ...settleForm, date: e.target.value })} />
              </div>
              <DarkInput label="Notes" placeholder="e.g. UPI transfer"
                value={settleForm.notes} onChange={e => setSettleForm({ ...settleForm, notes: e.target.value })} />
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowSettle(false)}
                  className="flex-1 py-3 rounded-xl text-sm font-medium text-white/40 hover:text-white transition"
                  style={{ border: '1px solid rgba(255,255,255,0.1)' }}>Cancel</button>
                <button type="submit"
                  className="flex-1 bg-accent-grad text-white py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition shadow-accent-glow">
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
