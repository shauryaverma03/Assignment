import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Plus, ArrowLeft, Upload, Check, X, Info, AlertTriangle, ArrowLeftRight, Home, Receipt, TrendingUp, Users } from 'lucide-react';

const TABS = ['Expenses', 'Balances', 'Settlements', 'Members', 'Import'];
const AVATAR_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ec4899', '#3b82f6', '#8b5cf6'];

/* ── Shared input primitives ── */
function FieldInput({ label, ...props }) {
  return (
    <div>
      {label && <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-2)', marginBottom: '0.3rem' }}>{label}</label>}
      <input
        style={{
          width: '100%', background: 'var(--bg-subtle)', border: '1px solid var(--border)',
          borderRadius: '0.5rem', padding: '0.625rem 0.75rem', fontSize: '0.9rem',
          color: 'var(--text)', outline: 'none', transition: 'border-color 0.2s ease',
          boxSizing: 'border-box',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
        onBlur={e => e.target.style.borderColor = 'var(--border)'}
        {...props}
      />
    </div>
  );
}

function FieldSelect({ label, children, ...props }) {
  return (
    <div>
      {label && <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-2)', marginBottom: '0.3rem' }}>{label}</label>}
      <select
        style={{
          width: '100%', background: 'var(--bg-subtle)', border: '1px solid var(--border)',
          borderRadius: '0.5rem', padding: '0.625rem 0.75rem', fontSize: '0.9rem',
          color: 'var(--text)', outline: 'none', transition: 'border-color 0.2s ease',
          boxSizing: 'border-box', colorScheme: 'light dark',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
        onBlur={e => e.target.style.borderColor = 'var(--border)'}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}

function Modal({ onClose, title, subtitle, children }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 50, padding: '1rem',
      background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)',
    }} onClick={onClose}>
      <div style={{
        width: '100%', maxWidth: '480px',
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: '1rem', padding: '1.5rem',
        boxShadow: 'var(--shadow-xl)',
        maxHeight: '90vh', overflowY: 'auto',
        animation: 'rise 0.2s cubic-bezier(0.16,1,0.3,1)',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)' }}>{title}</h2>
            {subtitle && <p style={{ fontSize: '0.8125rem', color: 'var(--text-3)', marginTop: '0.2rem' }}>{subtitle}</p>}
          </div>
          <button onClick={onClose} style={{
            width: '28px', height: '28px', borderRadius: '0.375rem', display: 'flex',
            alignItems: 'center', justifyContent: 'center', background: 'none',
            border: 'none', color: 'var(--text-3)', cursor: 'pointer',
            transition: 'background 0.15s ease, color 0.15s ease', flexShrink: 0,
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-muted)'; e.currentTarget.style.color = 'var(--text)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-3)'; }}
          >
            <X size={15} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

const modalBtnRow = { display: 'flex', gap: '0.75rem', paddingTop: '0.25rem' };
const cancelBtnStyle = {
  flex: 1, padding: '0.625rem', borderRadius: '0.5rem', fontSize: '0.9rem',
  fontWeight: 500, color: 'var(--text-2)', background: 'var(--bg-subtle)',
  border: '1px solid var(--border)', cursor: 'pointer',
};
const submitBtnStyle = {
  flex: 1, padding: '0.625rem', borderRadius: '0.5rem', fontSize: '0.9rem',
  fontWeight: 600, color: 'white', background: 'var(--accent)',
  border: 'none', cursor: 'pointer', transition: 'opacity 0.2s ease',
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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '36px', height: '36px', border: '2px solid var(--accent)',
          borderTopColor: 'transparent', borderRadius: '50%',
          animation: 'spin 0.7s linear infinite', margin: '0 auto 0.75rem',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-3)' }}>Loading...</p>
      </div>
    </div>
  );

  const activeMembers = group.memberships.filter(m => !m.leftAt);
  const pendingLogs = importLogs.filter(l => l.status === 'pending').length;

  const tabStyle = (t) => ({
    padding: '0.375rem 0.875rem', borderRadius: '9999px', fontSize: '0.875rem',
    fontWeight: 500, cursor: 'pointer', border: 'none',
    background: tab === t ? 'var(--accent)' : 'transparent',
    color: tab === t ? 'white' : 'var(--text-2)',
    transition: 'background 0.15s ease, color 0.15s ease',
    position: 'relative',
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg)' }}>

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: '256px', minHeight: '100vh', position: 'fixed', left: 0, top: 0,
        display: 'flex', flexDirection: 'column', zIndex: 40,
        background: 'var(--bg-subtle)', borderRight: '1px solid var(--border)',
      }}>
        {/* Header */}
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <Link to="/dashboard" style={{
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              fontSize: '0.8125rem', color: 'var(--text-2)', textDecoration: 'none',
              transition: 'color 0.15s ease',
            }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-2)'}
            >
              <ArrowLeft size={13} /> All groups
            </Link>
            <Link to="/" style={{ color: 'var(--text-3)', transition: 'color 0.15s ease' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
            >
              <Home size={14} />
            </Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '0.625rem', flexShrink: 0,
              background: AVATAR_COLORS[0],
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: '1.125rem', fontWeight: 700,
            }}>
              {group.name[0].toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {group.name}
              </p>
              <p style={{ fontSize: '0.6875rem', color: 'var(--text-3)' }}>{group.memberships.length} members</p>
            </div>
          </div>
        </div>

        {/* Tab nav */}
        <nav style={{ flex: 1, padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '1px' }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              width: '100%', textAlign: 'left', padding: '0.5rem 0.625rem', borderRadius: '0.5rem',
              fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', border: 'none',
              background: tab === t ? 'var(--bg-muted)' : 'transparent',
              color: tab === t ? 'var(--text)' : 'var(--text-2)',
              transition: 'background 0.15s ease, color 0.15s ease',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}
              onMouseEnter={e => { if (tab !== t) { e.currentTarget.style.background = 'var(--bg-muted)'; e.currentTarget.style.color = 'var(--text)'; } }}
              onMouseLeave={e => { if (tab !== t) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-2)'; } }}
            >
              <span>{t}</span>
              {t === 'Import' && pendingLogs > 0 && (
                <span style={{
                  fontSize: '0.625rem', fontWeight: 700, background: '#f59e0b', color: 'white',
                  padding: '0.15rem 0.4rem', borderRadius: '9999px',
                }}>{pendingLogs}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Actions */}
        <div style={{ padding: '0.75rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button onClick={() => setShowAddExpense(true)} style={{
            width: '100%', background: 'var(--accent)', color: 'white',
            border: 'none', borderRadius: '0.5rem', padding: '0.625rem',
            fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
            transition: 'opacity 0.2s ease',
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <Plus size={14} /> Add Expense
          </button>
          <button onClick={() => setShowSettle(true)} style={{
            width: '100%', background: 'none',
            border: '1px solid var(--border)', borderRadius: '0.5rem', padding: '0.5rem',
            fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-2)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
            transition: 'color 0.15s ease, border-color 0.15s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            <Check size={14} /> Settle Up
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main style={{ marginLeft: '256px', flex: 1, padding: '2rem 2.5rem' }}>
        {/* Group header */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: '0.25rem' }}>
            {group.name}
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-3)' }}>{group.description || 'No description'}</p>
        </div>

        {/* Tab pills */}
        <div style={{
          display: 'flex', gap: '0.25rem', marginBottom: '1.5rem',
          background: 'var(--bg-subtle)', border: '1px solid var(--border)',
          borderRadius: '9999px', padding: '0.25rem', width: 'fit-content',
        }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={tabStyle(t)}>
              {t}
              {t === 'Import' && pendingLogs > 0 && (
                <span style={{
                  position: 'absolute', top: '-2px', right: '-2px',
                  width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b',
                }} />
              )}
            </button>
          ))}
        </div>

        {/* ── EXPENSES TAB ── */}
        {tab === 'Expenses' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {group.expenses.length === 0 ? (
              <EmptyState icon={<Receipt size={22} style={{ color: 'var(--accent)' }} />} title="No expenses yet" desc="Add your first expense or import a CSV file">
                <button onClick={() => setShowAddExpense(true)} style={{ ...submitBtnStyle, flex: 'none', padding: '0.5rem 1.25rem' }}>
                  Add Expense
                </button>
                <button onClick={() => setTab('Import')} style={{ ...cancelBtnStyle, flex: 'none', padding: '0.5rem 1.25rem' }}>
                  Import CSV
                </button>
              </EmptyState>
            ) : group.expenses.map((exp) => (
              <div key={exp.id} className="expense-row" style={{
                background: 'var(--card)', border: '1px solid var(--border)',
                borderRadius: '0.75rem', padding: '1rem',
                boxShadow: 'var(--shadow)',
                transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.querySelector('.del-btn').style.opacity = '1'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'var(--shadow)'; e.currentTarget.querySelector('.del-btn').style.opacity = '0'; }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                    <div style={{
                      width: '38px', height: '38px', borderRadius: '0.625rem', flexShrink: 0,
                      background: 'var(--bg-muted)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Receipt size={16} style={{ color: 'var(--text-3)' }} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text)' }}>{exp.description}</span>
                        {exp.isSettlement && <Badge color="#22c55e" bg="rgba(34,197,94,0.1)">Settlement</Badge>}
                        <Badge color="var(--accent)" bg="var(--accent-subtle)">{exp.splitType}</Badge>
                        {exp.currency !== 'INR' && <Badge color="#f59e0b" bg="rgba(245,158,11,0.1)">USD</Badge>}
                      </div>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-3)' }}>
                        Paid by <span style={{ color: 'var(--accent)', fontWeight: 500 }}>{exp.paidBy?.displayName || 'Unknown'}</span>
                        <span style={{ margin: '0 0.375rem', color: 'var(--border-strong)' }}>·</span>
                        {new Date(exp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.5rem' }}>
                        {exp.splits.map(s => (
                          <span key={s.id} style={{
                            fontSize: '0.6875rem', padding: '0.2rem 0.5rem', borderRadius: '0.375rem',
                            background: 'var(--bg-muted)', color: 'var(--text-3)',
                            border: '1px solid var(--border)',
                          }}>
                            {s.member?.displayName || '?'}: ₹{Number(s.amountInr).toFixed(0)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flexShrink: 0, marginLeft: '1rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>₹{Number(exp.amountInr).toFixed(2)}</p>
                      {exp.currency !== 'INR' && <p style={{ fontSize: '0.6875rem', color: 'var(--text-3)' }}>${Number(exp.amount).toFixed(2)}</p>}
                    </div>
                    <button className="del-btn" onClick={() => deleteExpense(exp.id)} style={{
                      opacity: 0, padding: '0.25rem', background: 'none', border: 'none',
                      color: 'var(--text-3)', cursor: 'pointer', transition: 'color 0.15s ease, opacity 0.15s ease',
                      borderRadius: '0.375rem',
                    }}
                      onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── BALANCES TAB ── */}
        {tab === 'Balances' && balances && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
              {balances.members.map((m, i) => (
                <div key={m.id} onClick={() => fetchBreakdown(m)} style={{
                  background: 'var(--card)', border: '1px solid var(--border)',
                  borderRadius: '0.875rem', padding: '1.125rem',
                  cursor: 'pointer', boxShadow: 'var(--shadow)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem' }}>
                    <div style={{
                      width: '34px', height: '34px', borderRadius: '50%',
                      background: AVATAR_COLORS[i % AVATAR_COLORS.length],
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontSize: '0.875rem', fontWeight: 700,
                    }}>
                      {(m.displayName || '?')[0].toUpperCase()}
                    </div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)' }}>{m.displayName}</span>
                  </div>
                  <div style={{
                    fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.2rem',
                    color: m.net > 0 ? '#22c55e' : m.net < 0 ? '#f87171' : 'var(--text-3)',
                  }}>
                    {m.net > 0 ? '+' : ''}₹{Math.abs(m.net).toFixed(2)}
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
                    {m.net > 0 ? 'gets back' : m.net < 0 ? 'owes' : 'settled'}
                  </p>
                  <p style={{ fontSize: '0.6875rem', color: 'var(--accent)', marginTop: '0.5rem', opacity: 0.7 }}>
                    Tap for breakdown →
                  </p>
                </div>
              ))}
            </div>

            <div style={{
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: '0.875rem', padding: '1.25rem', boxShadow: 'var(--shadow)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <TrendingUp size={15} style={{ color: 'var(--accent)' }} />
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text)' }}>Suggested Settlements</h3>
              </div>
              {balances.transactions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                  <p style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>🎉</p>
                  <p style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-2)' }}>All settled up!</p>
                </div>
              ) : balances.transactions.map((t, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.75rem 0', borderBottom: '1px solid var(--border)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <div style={{
                      width: '26px', height: '26px', borderRadius: '50%',
                      background: AVATAR_COLORS[balances.members.findIndex(m => m.id === parseInt(t.from?.id)) % AVATAR_COLORS.length],
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontSize: '0.6875rem', fontWeight: 700,
                    }}>
                      {(t.from?.displayName || '?')[0].toUpperCase()}
                    </div>
                    <span style={{ fontSize: '0.9rem' }}>
                      <span style={{ fontWeight: 600, color: '#f87171' }}>{t.from?.displayName}</span>
                      <span style={{ color: 'var(--text-3)', margin: '0 0.5rem' }}>pays</span>
                      <span style={{ fontWeight: 600, color: '#22c55e' }}>{t.to?.displayName}</span>
                    </span>
                  </div>
                  <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.9375rem' }}>₹{t.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Breakdown modal */}
            {breakdown && breakdownMember && (
              <Modal title={`Breakdown · ${breakdownMember.displayName}`} onClose={() => setBreakdown(null)}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {breakdown.map(item => (
                    <div key={item.expenseId} style={{
                      padding: '0.875rem', borderRadius: '0.625rem',
                      background: 'var(--bg-subtle)', border: '1px solid var(--border)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text)' }}>{item.description}</span>
                        <span style={{
                          fontSize: '0.9rem', fontWeight: 700,
                          color: item.net > 0 ? '#22c55e' : item.net < 0 ? '#f87171' : 'var(--text-3)',
                        }}>
                          {item.net > 0 ? '+' : ''}₹{item.net.toFixed(2)}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', display: 'flex', gap: '1rem' }}>
                        <span>{new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                        {item.paid > 0 && <span style={{ color: '#22c55e' }}>paid ₹{item.paid.toFixed(2)}</span>}
                        {item.owes > 0 && <span style={{ color: '#f87171' }}>owes ₹{item.owes.toFixed(2)}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </Modal>
            )}
          </div>
        )}

        {/* ── SETTLEMENTS TAB ── */}
        {tab === 'Settlements' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-3)' }}>
                {settlements.length} settlement{settlements.length !== 1 ? 's' : ''}
              </p>
              <button onClick={() => setShowSettle(true)} style={{
                display: 'flex', alignItems: 'center', gap: '0.375rem',
                fontSize: '0.875rem', fontWeight: 500, color: 'var(--accent)',
                background: 'none', border: 'none', cursor: 'pointer',
                transition: 'opacity 0.2s ease',
              }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                <Plus size={14} /> Record payment
              </button>
            </div>

            {settlements.length === 0 ? (
              <EmptyState icon={<ArrowLeftRight size={22} style={{ color: '#22c55e' }} />} title="No settlements yet" desc="Record a payment when someone settles their debt" />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {settlements.map(s => (
                  <div key={s.id} style={{
                    background: 'var(--card)', border: '1px solid var(--border)',
                    borderRadius: '0.75rem', padding: '1rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    boxShadow: 'var(--shadow)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '38px', height: '38px', borderRadius: '0.625rem',
                        background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <ArrowLeftRight size={16} style={{ color: '#22c55e' }} />
                      </div>
                      <div>
                        <p style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text)' }}>
                          <span style={{ color: '#f87171' }}>{s.paidBy?.displayName}</span>
                          <span style={{ color: 'var(--text-3)', margin: '0 0.375rem' }}>→</span>
                          <span style={{ color: '#22c55e' }}>{s.paidTo?.displayName}</span>
                        </p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
                          {new Date(s.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {s.notes ? ` · ${s.notes}` : ''}
                        </p>
                      </div>
                    </div>
                    <span style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#22c55e' }}>₹{Number(s.amount).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── MEMBERS TAB ── */}
        {tab === 'Members' && (
          <div style={{
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: '0.875rem', boxShadow: 'var(--shadow)', overflow: 'hidden',
          }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={15} style={{ color: 'var(--accent)' }} /> Group Members
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: '0.25rem' }}>
                Join and leave dates determine which expenses each member shares
              </p>
            </div>
            <div>
              {group.memberships.map((m, i) => (
                <div key={m.id} style={{
                  padding: '0.875rem 1.25rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  borderBottom: i < group.memberships.length - 1 ? '1px solid var(--border)' : 'none',
                  transition: 'background 0.15s ease',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <div style={{
                      width: '34px', height: '34px', borderRadius: '50%',
                      background: AVATAR_COLORS[i % AVATAR_COLORS.length],
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontSize: '0.875rem', fontWeight: 700,
                    }}>
                      {(m.displayName || m.user?.username || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text)' }}>
                        {m.displayName || m.user?.username}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>@{m.user?.username}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-3)' }}>
                    <span>Joined {new Date(m.joinedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    {m.leftAt ? (
                      <span style={{
                        background: 'rgba(245,158,11,0.1)', color: '#f59e0b',
                        border: '1px solid rgba(245,158,11,0.2)', padding: '0.2rem 0.625rem',
                        borderRadius: '9999px', fontWeight: 500,
                      }}>
                        Left {new Date(m.leftAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    ) : (
                      <span style={{
                        background: 'rgba(34,197,94,0.1)', color: '#22c55e',
                        border: '1px solid rgba(34,197,94,0.2)', padding: '0.2rem 0.625rem',
                        borderRadius: '9999px', fontWeight: 500,
                      }}>
                        Active
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── IMPORT TAB ── */}
        {tab === 'Import' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{
              background: 'var(--card)', border: '2px dashed var(--border)',
              borderRadius: '0.875rem', padding: '3rem 2rem', textAlign: 'center',
              boxShadow: 'var(--shadow)',
            }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '0.75rem',
                background: 'var(--accent-subtle)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1rem',
              }}>
                <Upload size={20} style={{ color: 'var(--accent)' }} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.375rem' }}>Import CSV File</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-2)', marginBottom: '1.5rem' }}>
                Upload <strong>expenses_export.csv</strong> — anomalies detected automatically
              </p>
              <label style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: 'var(--accent)', color: 'white',
                padding: '0.625rem 1.25rem', borderRadius: '0.625rem',
                fontSize: '0.9rem', fontWeight: 600, cursor: uploading ? 'not-allowed' : 'pointer',
                opacity: uploading ? 0.6 : 1, transition: 'opacity 0.2s ease',
              }}
                onMouseEnter={e => { if (!uploading) e.currentTarget.style.opacity = '0.88'; }}
                onMouseLeave={e => { if (!uploading) e.currentTarget.style.opacity = '1'; }}
              >
                <Upload size={14} />
                {uploading ? 'Importing...' : 'Choose CSV File'}
                <input type="file" accept=".csv" onChange={handleCSVUpload} style={{ display: 'none' }} disabled={uploading} />
              </label>
            </div>

            {importResult && (
              <div style={{
                background: 'var(--card)', border: '1px solid var(--border)',
                borderRadius: '0.875rem', padding: '1.25rem', boxShadow: 'var(--shadow)',
              }}>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text)', marginBottom: '1rem' }}>Import Report</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                  {[
                    [importResult.imported, 'Imported', '#22c55e', 'rgba(34,197,94,0.1)', 'rgba(34,197,94,0.2)'],
                    [importResult.skipped, 'Skipped', '#f87171', 'rgba(248,113,113,0.1)', 'rgba(248,113,113,0.2)'],
                    [importResult.anomalies, 'Anomalies', '#f59e0b', 'rgba(245,158,11,0.1)', 'rgba(245,158,11,0.2)'],
                  ].map(([val, label, color, bg, border]) => (
                    <div key={label} style={{
                      textAlign: 'center', borderRadius: '0.625rem',
                      padding: '1rem', background: bg, border: `1px solid ${border}`,
                    }}>
                      <div style={{ fontSize: '2rem', fontWeight: 700, color }}>{val}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: '0.25rem' }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {importLogs.length > 0 && (
              <div style={{
                background: 'var(--card)', border: '1px solid var(--border)',
                borderRadius: '0.875rem', overflow: 'hidden', boxShadow: 'var(--shadow)',
              }}>
                <div style={{
                  padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text)' }}>Anomaly Log</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{importLogs.length} issues</span>
                </div>
                <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
                  {importLogs.map((log, i) => (
                    <div key={log.id} style={{
                      padding: '0.75rem 1.25rem',
                      display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                      borderBottom: i < importLogs.length - 1 ? '1px solid var(--border)' : 'none',
                    }}>
                      <div style={{ marginTop: '2px', flexShrink: 0 }}>
                        {log.severity === 'error' ? <X size={13} style={{ color: '#f87171' }} /> :
                          log.severity === 'warning' ? <AlertTriangle size={13} style={{ color: '#f59e0b' }} /> :
                            <Info size={13} style={{ color: '#60a5fa' }} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-2)' }}>Row {log.rowNumber}</span>
                          <span style={{ color: 'var(--border-strong)' }}>·</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{log.issueType.replace(/_/g, ' ')}</span>
                          <span style={{
                            fontSize: '0.625rem', padding: '0.15rem 0.4rem', borderRadius: '9999px',
                            fontWeight: 600, marginLeft: 'auto',
                            background: log.severity === 'error' ? 'rgba(248,113,113,0.1)' : log.severity === 'warning' ? 'rgba(245,158,11,0.1)' : 'rgba(96,165,250,0.1)',
                            color: log.severity === 'error' ? '#f87171' : log.severity === 'warning' ? '#f59e0b' : '#60a5fa',
                          }}>{log.severity}</span>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{log.issueDescription}</p>
                        {log.actionTaken && <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontStyle: 'italic', marginTop: '0.15rem' }}>→ {log.actionTaken}</p>}
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
        <Modal title="Add Expense" subtitle="Split fairly among active members" onClose={() => setShowAddExpense(false)}>
          <form onSubmit={addExpense} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <FieldInput label="Description *" required placeholder="e.g. Dinner at Barbeque Nation"
              value={expenseForm.description} onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <FieldInput label="Amount *" required type="number" step="0.01" min="0.01" placeholder="0.00"
                value={expenseForm.amount} onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })} />
              <FieldSelect label="Currency"
                value={expenseForm.currency} onChange={e => setExpenseForm({ ...expenseForm, currency: e.target.value })}>
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
              </FieldSelect>
            </div>
            {expenseForm.currency === 'USD' && expenseForm.amount && (
              <div style={{
                borderRadius: '0.5rem', padding: '0.625rem 0.875rem', fontSize: '0.875rem',
                background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b',
              }}>
                ${expenseForm.amount} × ₹{expenseForm.exchangeRate} = <strong>₹{(parseFloat(expenseForm.amount || 0) * expenseForm.exchangeRate).toFixed(2)}</strong>
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <FieldSelect label="Paid by *" required
                value={expenseForm.paidById} onChange={e => setExpenseForm({ ...expenseForm, paidById: e.target.value })}>
                <option value="">Select member</option>
                {activeMembers.map(m => <option key={m.id} value={m.id}>{m.displayName || m.user?.username}</option>)}
              </FieldSelect>
              <FieldSelect label="Split type"
                value={expenseForm.splitType} onChange={e => setExpenseForm({ ...expenseForm, splitType: e.target.value })}>
                <option value="equal">Equal</option>
                <option value="exact">Exact amounts</option>
                <option value="percentage">Percentage</option>
                <option value="shares">By shares</option>
              </FieldSelect>
            </div>
            <FieldInput label="Date *" type="date" required
              value={expenseForm.date} onChange={e => setExpenseForm({ ...expenseForm, date: e.target.value })} />
            <FieldInput label="Notes" placeholder="Optional notes"
              value={expenseForm.notes} onChange={e => setExpenseForm({ ...expenseForm, notes: e.target.value })} />
            <div style={modalBtnRow}>
              <button type="button" onClick={() => setShowAddExpense(false)} style={cancelBtnStyle}>Cancel</button>
              <button type="submit" style={submitBtnStyle}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >Add Expense</button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── SETTLE MODAL ── */}
      {showSettle && (
        <Modal title="Record Settlement" subtitle="Log a payment between members" onClose={() => setShowSettle(false)}>
          <form onSubmit={addSettlement} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <FieldSelect label="Who paid?" required
                value={settleForm.paidById} onChange={e => setSettleForm({ ...settleForm, paidById: e.target.value })}>
                <option value="">Select</option>
                {group.memberships.map(m => <option key={m.id} value={m.id}>{m.displayName || m.user?.username}</option>)}
              </FieldSelect>
              <FieldSelect label="Who received?" required
                value={settleForm.paidToId} onChange={e => setSettleForm({ ...settleForm, paidToId: e.target.value })}>
                <option value="">Select</option>
                {group.memberships.map(m => <option key={m.id} value={m.id}>{m.displayName || m.user?.username}</option>)}
              </FieldSelect>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <FieldInput label="Amount (₹)" required type="number" step="0.01" min="0.01" placeholder="0.00"
                value={settleForm.amount} onChange={e => setSettleForm({ ...settleForm, amount: e.target.value })} />
              <FieldInput label="Date" type="date"
                value={settleForm.date} onChange={e => setSettleForm({ ...settleForm, date: e.target.value })} />
            </div>
            <FieldInput label="Notes" placeholder="e.g. UPI transfer"
              value={settleForm.notes} onChange={e => setSettleForm({ ...settleForm, notes: e.target.value })} />
            <div style={modalBtnRow}>
              <button type="button" onClick={() => setShowSettle(false)} style={cancelBtnStyle}>Cancel</button>
              <button type="submit" style={submitBtnStyle}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >Record Payment</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

/* ── Small helpers ── */
function Badge({ color, bg, children }) {
  return (
    <span style={{
      fontSize: '0.6875rem', padding: '0.15rem 0.5rem', borderRadius: '9999px',
      color, background: bg, fontWeight: 500,
    }}>{children}</span>
  );
}

function EmptyState({ icon, title, desc, children }) {
  return (
    <div style={{
      borderRadius: '0.875rem', padding: '3.5rem 2rem', textAlign: 'center',
      background: 'var(--bg-subtle)', border: '2px dashed var(--border)',
    }}>
      <div style={{
        width: '48px', height: '48px', borderRadius: '0.75rem',
        background: 'var(--bg-muted)', border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 0.875rem',
      }}>
        {icon}
      </div>
      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.375rem' }}>{title}</h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-2)', marginBottom: children ? '1.25rem' : 0 }}>{desc}</p>
      {children && <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>{children}</div>}
    </div>
  );
}
