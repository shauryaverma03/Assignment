import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Plus, ArrowLeft, Upload, TrendingUp, Receipt, Users } from 'lucide-react';

const TABS = ['Expenses', 'Balances', 'Members', 'Import'];

export default function GroupDetail() {
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [balances, setBalances] = useState(null);
  const [tab, setTab] = useState('Expenses');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [importLogs, setImportLogs] = useState([]);
  const [expenseForm, setExpenseForm] = useState({
    description: '', amount: '', currency: 'INR', exchangeRate: 1,
    splitType: 'equal', date: new Date().toISOString().slice(0, 10), paidById: '', notes: '',
  });
  const [uploading, setUploading] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const fetchGroup = async () => {
    try {
      const res = await api.get(`/groups/${id}`);
      setGroup(res.data);
    } catch { toast.error('Failed to load group'); }
  };

  const fetchBalances = async () => {
    try {
      const res = await api.get(`/balances/${id}`);
      setBalances(res.data);
    } catch { toast.error('Failed to load balances'); }
  };

  const fetchLogs = async () => {
    try {
      const res = await api.get(`/import/logs/${id}`);
      setImportLogs(res.data);
    } catch {}
  };

  useEffect(() => { fetchGroup(); fetchBalances(); fetchLogs(); }, [id]);

  const addExpense = async (e) => {
    e.preventDefault();
    try {
      await api.post('/expenses', { ...expenseForm, groupId: id });
      toast.success('Expense added!');
      setShowAddExpense(false);
      fetchGroup(); fetchBalances();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    }
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
      fetchGroup(); fetchBalances(); fetchLogs();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Import failed');
    } finally {
      setUploading(false);
    }
  };

  const deleteExpense = async (expId) => {
    if (!confirm('Delete this expense?')) return;
    try {
      await api.delete(`/expenses/${expId}`);
      toast.success('Deleted');
      fetchGroup(); fetchBalances();
    } catch { toast.error('Failed'); }
  };

  if (!group) return <div className="flex items-center justify-center h-64 text-slate-400">Loading...</div>;

  const activeMembers = group.memberships.filter(m => !m.leftAt);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <Link to="/" className="flex items-center gap-1 text-slate-500 hover:text-indigo-600 text-sm mb-4">
        <ArrowLeft size={14} /> Back to groups
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{group.name}</h1>
          <p className="text-slate-500 text-sm">{group.description}</p>
        </div>
        <button
          onClick={() => setShowAddExpense(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition text-sm"
        >
          <Plus size={16} /> Add Expense
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-6 w-fit">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${tab === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >{t}</button>
        ))}
      </div>

      {/* EXPENSES TAB */}
      {tab === 'Expenses' && (
        <div className="space-y-3">
          {group.expenses.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Receipt size={40} className="mx-auto mb-2 opacity-30" />
              <p>No expenses yet.</p>
            </div>
          ) : group.expenses.map(exp => (
            <div key={exp.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between hover:border-indigo-200 transition">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-slate-800">{exp.description}</span>
                  {exp.isSettlement && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Settlement</span>}
                  {exp.importRow && <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Imported row {exp.importRow}</span>}
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{exp.splitType}</span>
                </div>
                <div className="text-sm text-slate-500">
                  Paid by <span className="text-indigo-600 font-medium">{exp.paidBy?.displayName || 'Unknown'}</span>
                  &nbsp;· {new Date(exp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  {exp.currency !== 'INR' && <span className="ml-2 text-orange-500">{exp.amount} {exp.currency} → ₹{Number(exp.amountInr).toFixed(2)}</span>}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Splits: {exp.splits.map(s => `${s.member?.displayName || '?'}: ₹${Number(s.amountInr).toFixed(2)}`).join(' · ')}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-lg font-bold text-slate-800">₹{Number(exp.amountInr).toFixed(2)}</span>
                <button onClick={() => deleteExpense(exp.id)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* BALANCES TAB */}
      {tab === 'Balances' && balances && (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            {balances.members.map(m => (
              <div key={m.id} className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-800">{m.displayName}</span>
                  <span className={`font-bold text-lg ${m.net > 0 ? 'text-green-600' : m.net < 0 ? 'text-red-500' : 'text-slate-400'}`}>
                    {m.net > 0 ? '+' : ''}₹{m.net.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{m.net > 0 ? 'gets back' : m.net < 0 ? 'owes' : 'settled'}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><TrendingUp size={16} /> Suggested Settlements</h3>
            {balances.transactions.length === 0 ? (
              <p className="text-slate-400 text-sm">All settled up! 🎉</p>
            ) : balances.transactions.map((t, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <span className="text-slate-700">
                  <span className="font-medium text-red-500">{t.from?.displayName}</span>
                  {' → '}
                  <span className="font-medium text-green-600">{t.to?.displayName}</span>
                </span>
                <span className="font-bold text-slate-800">₹{t.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MEMBERS TAB */}
      {tab === 'Members' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Users size={16} /> Members</h3>
          <div className="space-y-2">
            {group.memberships.map(m => (
              <div key={m.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <div>
                  <span className="font-medium text-slate-800">{m.displayName || m.user?.username}</span>
                  <span className="text-xs text-slate-400 ml-2">@{m.user?.username}</span>
                </div>
                <div className="text-xs text-slate-400">
                  Joined: {new Date(m.joinedAt).toLocaleDateString('en-IN')}
                  {m.leftAt && <span className="ml-2 text-orange-500">Left: {new Date(m.leftAt).toLocaleDateString('en-IN')}</span>}
                  {!m.leftAt && <span className="ml-2 bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Active</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* IMPORT TAB */}
      {tab === 'Import' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border-2 border-dashed border-indigo-200 p-8 text-center">
            <Upload size={36} className="mx-auto mb-3 text-indigo-400" />
            <p className="text-slate-600 mb-4">Upload <strong>expenses_export.csv</strong> to import</p>
            <label className="cursor-pointer bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition text-sm">
              {uploading ? 'Importing...' : 'Choose CSV File'}
              <input type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" disabled={uploading} />
            </label>
          </div>

          {importResult && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-bold text-slate-800 mb-3">Import Report</h3>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center bg-green-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-green-600">{importResult.imported}</div>
                  <div className="text-xs text-slate-500">Imported</div>
                </div>
                <div className="text-center bg-red-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-red-500">{importResult.skipped}</div>
                  <div className="text-xs text-slate-500">Skipped</div>
                </div>
                <div className="text-center bg-yellow-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-yellow-600">{importResult.anomalies}</div>
                  <div className="text-xs text-slate-500">Anomalies</div>
                </div>
              </div>
            </div>
          )}

          {importLogs.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-bold text-slate-800 mb-3">Anomaly Log ({importLogs.length})</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {importLogs.map(log => (
                  <div key={log.id} className={`p-3 rounded-lg border text-sm ${
                    log.severity === 'error' ? 'bg-red-50 border-red-200' :
                    log.severity === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                    'bg-blue-50 border-blue-200'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">Row {log.rowNumber} — {log.issueType.replace(/_/g, ' ')}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        log.severity === 'error' ? 'bg-red-200 text-red-800' :
                        log.severity === 'warning' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-blue-200 text-blue-800'
                      }`}>{log.severity}</span>
                    </div>
                    <p className="text-slate-600">{log.issueDescription}</p>
                    <p className="text-slate-400 text-xs mt-1">Action: {log.actionTaken || log.status}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ADD EXPENSE MODAL */}
      {showAddExpense && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">Add Expense</h2>
            <form onSubmit={addExpense} className="space-y-3">
              <input className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Description" required
                value={expenseForm.description} onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })} />

              <div className="grid grid-cols-2 gap-3">
                <input className="border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="Amount" type="number" step="0.01" required
                  value={expenseForm.amount} onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })} />
                <select className="border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  value={expenseForm.currency} onChange={e => setExpenseForm({ ...expenseForm, currency: e.target.value, exchangeRate: e.target.value === 'USD' ? 83.5 : 1 })}>
                  <option value="INR">INR ₹</option>
                  <option value="USD">USD $</option>
                </select>
              </div>

              {expenseForm.currency === 'USD' && (
                <div className="bg-orange-50 rounded-lg p-2 text-sm text-orange-700">
                  Exchange rate: 1 USD = ₹{expenseForm.exchangeRate} — Amount in INR: ₹{(parseFloat(expenseForm.amount || 0) * expenseForm.exchangeRate).toFixed(2)}
                </div>
              )}

              <select className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={expenseForm.paidById} required onChange={e => setExpenseForm({ ...expenseForm, paidById: e.target.value })}>
                <option value="">Who paid?</option>
                {activeMembers.map(m => <option key={m.id} value={m.id}>{m.displayName || m.user?.username}</option>)}
              </select>

              <select className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={expenseForm.splitType} onChange={e => setExpenseForm({ ...expenseForm, splitType: e.target.value })}>
                <option value="equal">Equal split</option>
                <option value="exact">Exact amounts</option>
                <option value="percentage">By percentage</option>
                <option value="shares">By shares</option>
              </select>

              <input type="date" required
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={expenseForm.date} onChange={e => setExpenseForm({ ...expenseForm, date: e.target.value })} />

              <textarea className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
                placeholder="Notes (optional)" rows={2}
                value={expenseForm.notes} onChange={e => setExpenseForm({ ...expenseForm, notes: e.target.value })} />

              <div className="flex gap-2">
                <button type="button" onClick={() => setShowAddExpense(false)} className="flex-1 border border-slate-300 py-2 rounded-lg text-sm hover:bg-slate-50">Cancel</button>
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm hover:bg-indigo-700">Add Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
