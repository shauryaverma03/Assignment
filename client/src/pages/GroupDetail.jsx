import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Plus, ArrowLeft, Upload, ChevronRight, Check, X, Info, AlertTriangle, ArrowLeftRight } from 'lucide-react';

const TABS = ['Expenses', 'Balances', 'Settlements', 'Members', 'Import'];
const avatarColors = ['bg-accent/100','bg-violet-500','bg-pink-500','bg-sky-500','bg-orange-500','bg-cyan-500'];

const Avatar = ({ name, index, size = 'sm' }) => {
  const letter = (name || '?')[0].toUpperCase();
  const cls = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm';
  return (
    <div className={`${cls} rounded-full ${avatarColors[index % avatarColors.length]} text-white flex items-center justify-center font-bold flex-shrink-0`}>
      {letter}
    </div>
  );
};

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
    description: '', amount: '', currency: 'INR', exchangeRate: 83.5,
    splitType: 'equal', date: new Date().toISOString().slice(0, 10), paidById: '', notes: '',
  });
  const [settleForm, setSettleForm] = useState({ paidById: '', paidToId: '', amount: '', date: new Date().toISOString().slice(0, 10), notes: '' });

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
      setExpenseForm({ description: '', amount: '', currency: 'INR', exchangeRate: 83.5, splitType: 'equal', date: new Date().toISOString().slice(0, 10), paidById: '', notes: '' });
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
    try {
      await api.delete(`/expenses/${expId}`);
      toast.success('Deleted');
      fetchAll();
    } catch { toast.error('Failed'); }
  };

  const handleCSVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('groupId', id);
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
      setBreakdown(res.data);
      setBreakdownMember(member);
    } catch { toast.error('Failed to load breakdown'); }
  };

  if (!group) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-slate-400 text-sm">Loading group...</p>
      </div>
    </div>
  );

  const activeMembers = group.memberships.filter(m => !m.leftAt);
  const memberIndex = (m) => group.memberships.findIndex(x => x.id === m.id);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen bg-white border-r border-slate-200 fixed left-0 top-0 flex flex-col">
          <div className="p-5 border-b border-slate-100">
            <Link to="/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-accent text-sm transition mb-4">
              <ArrowLeft size={14} /> All groups
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent-grad flex items-center justify-center text-white font-bold text-lg">
                {group.name[0].toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm leading-tight">{group.name}</p>
                <p className="text-xs text-slate-400">{group.memberships.length} members</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition flex items-center justify-between ${tab === t ? 'bg-accent/10 text-accent' : 'text-slate-600 hover:bg-slate-50'}`}>
                <span>{t}</span>
                {t === 'Import' && importLogs.filter(l => l.status === 'pending').length > 0 && (
                  <span className="bg-orange-400 text-white text-xs px-1.5 py-0.5 rounded-full">{importLogs.filter(l => l.status === 'pending').length}</span>
                )}
              </button>
            ))}
          </nav>
          <div className="p-4 border-t border-slate-100 space-y-2">
            <button onClick={() => setShowAddExpense(true)}
              className="w-full bg-accent-grad text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition">
              <Plus size={15} /> Add Expense
            </button>
            <button onClick={() => setShowSettle(true)}
              className="w-full border border-slate-200 text-slate-600 py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-slate-50 transition">
              <Check size={15} /> Settle Up
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="ml-64 flex-1 p-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-1">{group.name}</h1>
          <p className="text-slate-400 text-sm mb-8">{group.description || 'No description'}</p>

          {/* EXPENSES */}
          {tab === 'Expenses' && (
            <div className="space-y-3">
              {group.expenses.length === 0 ? (
                <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-16 text-center">
                  <div className="text-5xl mb-3">🧾</div>
                  <h3 className="font-bold text-slate-700 mb-2">No expenses yet</h3>
                  <p className="text-slate-400 text-sm mb-5">Add your first expense or import a CSV file</p>
                  <div className="flex gap-3 justify-center">
                    <button onClick={() => setShowAddExpense(true)} className="bg-accent text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-accent-hover">Add Expense</button>
                    <button onClick={() => setTab('Import')} className="border border-slate-200 text-slate-600 px-5 py-2 rounded-xl text-sm font-medium hover:bg-slate-50">Import CSV</button>
                  </div>
                </div>
              ) : group.expenses.map((exp, i) => (
                <div key={exp.id} className="bg-white rounded-2xl border border-slate-200 p-4 hover:border-accent hover:shadow-sm transition group">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl flex-shrink-0">🧾</div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-semibold text-slate-800">{exp.description}</span>
                          {exp.isSettlement && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Settlement</span>}
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{exp.splitType}</span>
                          {exp.currency !== 'INR' && <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">USD</span>}
                          {exp.importRow && <span className="text-xs bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full">Row {exp.importRow}</span>}
                        </div>
                        <p className="text-sm text-slate-500">
                          Paid by <span className="text-accent font-medium">{exp.paidBy?.displayName || 'Unknown'}</span>
                          <span className="mx-2 text-slate-300">·</span>
                          {new Date(exp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {exp.splits.map(s => (
                            <span key={s.id} className="text-xs bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-lg text-slate-500">
                              {s.member?.displayName || '?'}: ₹{Number(s.amountInr).toFixed(0)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 flex-shrink-0 ml-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-slate-800">₹{Number(exp.amountInr).toFixed(2)}</p>
                        {exp.currency !== 'INR' && <p className="text-xs text-slate-400">${Number(exp.amount).toFixed(2)}</p>}
                      </div>
                      <button onClick={() => deleteExpense(exp.id)} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition p-1">
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* BALANCES */}
          {tab === 'Balances' && balances && (
            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {balances.members.map((m, i) => (
                  <div key={m.id}
                    onClick={() => fetchBreakdown(m)}
                    className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-accent hover:shadow-md transition cursor-pointer group">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar name={m.displayName} index={i} size="md" />
                      <span className="font-semibold text-slate-800">{m.displayName}</span>
                    </div>
                    <div className={`text-2xl font-bold mb-1 ${m.net > 0 ? 'text-accent' : m.net < 0 ? 'text-red-500' : 'text-slate-400'}`}>
                      {m.net > 0 ? '+' : ''}₹{Math.abs(m.net).toFixed(2)}
                    </div>
                    <p className="text-xs text-slate-400">
                      {m.net > 0 ? '← gets back' : m.net < 0 ? '→ owes' : 'all settled'}
                    </p>
                    <p className="text-xs text-accent mt-2 group-hover:text-accent transition">Click for breakdown →</p>
                  </div>
                ))}
              </div>

              {/* Suggested settlements */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-bold text-slate-800 mb-4">💡 Suggested Settlements</h3>
                {balances.transactions.length === 0 ? (
                  <div className="text-center py-6">
                    <div className="text-4xl mb-2">🎉</div>
                    <p className="text-slate-500 font-medium">All settled up!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {balances.transactions.map((t, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <Avatar name={t.from?.displayName} index={balances.members.findIndex(m => m.id === parseInt(t.from?.id))} />
                          <div>
                            <span className="font-semibold text-red-500">{t.from?.displayName}</span>
                            <span className="text-slate-400 mx-2">pays</span>
                            <span className="font-semibold text-accent">{t.to?.displayName}</span>
                          </div>
                        </div>
                        <span className="font-bold text-slate-800 text-lg">₹{t.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Breakdown modal */}
              {breakdown && breakdownMember && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4" onClick={() => setBreakdown(null)}>
                  <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-slate-800">Breakdown for {breakdownMember.displayName}</h3>
                      <button onClick={() => setBreakdown(null)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
                    </div>
                    <div className="space-y-2">
                      {breakdown.map(item => (
                        <div key={item.expenseId} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-slate-700 text-sm">{item.description}</span>
                            <span className={`font-bold text-sm ${item.net > 0 ? 'text-accent' : item.net < 0 ? 'text-red-500' : 'text-slate-400'}`}>
                              {item.net > 0 ? '+' : ''}₹{item.net.toFixed(2)}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 flex gap-4">
                            <span>{new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                            {item.paid > 0 && <span className="text-accent">paid ₹{item.paid.toFixed(2)}</span>}
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

          {/* SETTLEMENTS */}
          {tab === 'Settlements' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center mb-2">
                <p className="text-slate-500 text-sm">{settlements.length} settlement{settlements.length !== 1 ? 's' : ''} recorded</p>
                <button onClick={() => setShowSettle(true)} className="flex items-center gap-2 text-accent text-sm font-medium hover:underline">
                  <Plus size={14} /> Record payment
                </button>
              </div>
              {settlements.length === 0 ? (
                <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
                  <div className="text-4xl mb-3">🤝</div>
                  <h3 className="font-bold text-slate-700 mb-2">No settlements yet</h3>
                  <p className="text-slate-400 text-sm">Record a payment when someone settles their debt</p>
                </div>
              ) : settlements.map(s => (
                <div key={s.id} className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center text-accent"><ArrowLeftRight size={18} /></div>
                    <div>
                      <p className="font-medium text-slate-800 text-sm">
                        <span className="text-red-500">{s.paidBy?.displayName}</span>
                        <span className="text-slate-400 mx-2">→</span>
                        <span className="text-accent">{s.paidTo?.displayName}</span>
                      </p>
                      <p className="text-xs text-slate-400">{new Date(s.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}{s.notes ? ` · ${s.notes}` : ''}</p>
                    </div>
                  </div>
                  <span className="font-bold text-accent text-lg">₹{Number(s.amount).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}

          {/* MEMBERS */}
          {tab === 'Members' && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-800">Group Members</h3>
                <p className="text-xs text-slate-400 mt-0.5">Members are time-scoped — join and leave dates determine which expenses they share</p>
              </div>
              <div className="divide-y divide-slate-100">
                {group.memberships.map((m, i) => (
                  <div key={m.id} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar name={m.displayName || m.user?.username} index={i} size="md" />
                      <div>
                        <p className="font-semibold text-slate-800">{m.displayName || m.user?.username}</p>
                        <p className="text-xs text-slate-400">@{m.user?.username}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span>Joined {new Date(m.joinedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      {m.leftAt ? (
                        <span className="bg-orange-100 text-orange-600 px-2.5 py-1 rounded-full font-medium">
                          Left {new Date(m.leftAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      ) : (
                        <span className="bg-accent/15 text-accent px-2.5 py-1 rounded-full font-medium">Active</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* IMPORT */}
          {tab === 'Import' && (
            <div className="space-y-5">
              <div className="bg-white rounded-2xl border-2 border-dashed border-accent p-10 text-center hover:border-accent transition">
                <div className="text-5xl mb-3">📥</div>
                <h3 className="font-bold text-slate-800 mb-1">Import CSV File</h3>
                <p className="text-slate-400 text-sm mb-5">Upload <strong>expenses_export.csv</strong> — all anomalies will be detected and logged</p>
                <label className={`inline-flex items-center gap-2 cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''} bg-accent-grad text-white px-6 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition shadow-md shadow-accent`}>
                  <Upload size={16} />
                  {uploading ? 'Importing...' : 'Choose CSV File'}
                  <input type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" disabled={uploading} />
                </label>
              </div>

              {importResult && (
                <div className="bg-white rounded-2xl border border-slate-200 p-5">
                  <h3 className="font-bold text-slate-800 mb-4">Import Report</h3>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center bg-accent/10 rounded-xl p-4">
                      <div className="text-3xl font-bold text-accent">{importResult.imported}</div>
                      <div className="text-xs text-slate-500 mt-1">Imported</div>
                    </div>
                    <div className="text-center bg-red-50 rounded-xl p-4">
                      <div className="text-3xl font-bold text-red-500">{importResult.skipped}</div>
                      <div className="text-xs text-slate-500 mt-1">Skipped</div>
                    </div>
                    <div className="text-center bg-amber-50 rounded-xl p-4">
                      <div className="text-3xl font-bold text-amber-600">{importResult.anomalies}</div>
                      <div className="text-xs text-slate-500 mt-1">Anomalies</div>
                    </div>
                  </div>
                </div>
              )}

              {importLogs.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800">Anomaly Log</h3>
                    <span className="text-xs text-slate-400">{importLogs.length} issues found</span>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                    {importLogs.map(log => (
                      <div key={log.id} className="px-5 py-3 flex items-start gap-3">
                        <div className="mt-0.5">
                          {log.severity === 'error' ? <X size={15} className="text-red-500" /> :
                           log.severity === 'warning' ? <AlertTriangle size={15} className="text-amber-500" /> :
                           <Info size={15} className="text-blue-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-semibold text-slate-600">Row {log.rowNumber}</span>
                            <span className="text-xs text-slate-400">·</span>
                            <span className="text-xs text-slate-500">{log.issueType.replace(/_/g, ' ')}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ml-auto ${
                              log.severity === 'error' ? 'bg-red-100 text-red-700' :
                              log.severity === 'warning' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                            }`}>{log.severity}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{log.issueDescription}</p>
                          {log.actionTaken && <p className="text-xs text-slate-400 mt-0.5 italic">→ {log.actionTaken}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ADD EXPENSE MODAL */}
      {showAddExpense && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-800">Add Expense</h2>
              <button onClick={() => setShowAddExpense(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <form onSubmit={addExpense} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
                <input required
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent text-sm bg-slate-50"
                  placeholder="e.g. Dinner at Barbeque Nation"
                  value={expenseForm.description} onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Amount *</label>
                  <input required type="number" step="0.01" min="0.01"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent text-sm bg-slate-50"
                    placeholder="0.00"
                    value={expenseForm.amount} onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
                  <select className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent text-sm bg-slate-50"
                    value={expenseForm.currency} onChange={e => setExpenseForm({ ...expenseForm, currency: e.target.value })}>
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
              </div>
              {expenseForm.currency === 'USD' && expenseForm.amount && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-sm text-orange-700">
                  💱 ${expenseForm.amount} × ₹{expenseForm.exchangeRate} = <strong>₹{(parseFloat(expenseForm.amount || 0) * expenseForm.exchangeRate).toFixed(2)}</strong>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Paid by *</label>
                  <select required
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent text-sm bg-slate-50"
                    value={expenseForm.paidById} onChange={e => setExpenseForm({ ...expenseForm, paidById: e.target.value })}>
                    <option value="">Select member</option>
                    {activeMembers.map(m => <option key={m.id} value={m.id}>{m.displayName || m.user?.username}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Split type</label>
                  <select className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent text-sm bg-slate-50"
                    value={expenseForm.splitType} onChange={e => setExpenseForm({ ...expenseForm, splitType: e.target.value })}>
                    <option value="equal">Equal</option>
                    <option value="exact">Exact amounts</option>
                    <option value="percentage">Percentage</option>
                    <option value="shares">By shares</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
                <input type="date" required
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent text-sm bg-slate-50"
                  value={expenseForm.date} onChange={e => setExpenseForm({ ...expenseForm, date: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <input
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent text-sm bg-slate-50"
                  placeholder="Optional notes"
                  value={expenseForm.notes} onChange={e => setExpenseForm({ ...expenseForm, notes: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowAddExpense(false)}
                  className="flex-1 border border-slate-200 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit"
                  className="flex-1 bg-accent-grad text-white py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition">
                  Add Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SETTLE MODAL */}
      {showSettle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-800">Record Settlement</h2>
              <button onClick={() => setShowSettle(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <form onSubmit={addSettlement} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Who paid?</label>
                  <select required
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent text-sm bg-slate-50"
                    value={settleForm.paidById} onChange={e => setSettleForm({ ...settleForm, paidById: e.target.value })}>
                    <option value="">Select</option>
                    {group.memberships.map(m => <option key={m.id} value={m.id}>{m.displayName || m.user?.username}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Who received?</label>
                  <select required
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent text-sm bg-slate-50"
                    value={settleForm.paidToId} onChange={e => setSettleForm({ ...settleForm, paidToId: e.target.value })}>
                    <option value="">Select</option>
                    {group.memberships.map(m => <option key={m.id} value={m.id}>{m.displayName || m.user?.username}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
                  <input required type="number" step="0.01" min="0.01"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent text-sm bg-slate-50"
                    placeholder="0.00"
                    value={settleForm.amount} onChange={e => setSettleForm({ ...settleForm, amount: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                  <input type="date"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent text-sm bg-slate-50"
                    value={settleForm.date} onChange={e => setSettleForm({ ...settleForm, date: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <input
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent text-sm bg-slate-50"
                  placeholder="e.g. UPI transfer"
                  value={settleForm.notes} onChange={e => setSettleForm({ ...settleForm, notes: e.target.value })} />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowSettle(false)}
                  className="flex-1 border border-slate-200 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit"
                  className="flex-1 bg-accent-grad text-white py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition">
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
