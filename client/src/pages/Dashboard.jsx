import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Plus, Users, Receipt, Wallet, ArrowRight, LogOut, Home, X, TrendingUp, IndianRupee } from 'lucide-react';
import Logo from '../components/Logo';

const AVATAR_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ec4899', '#3b82f6', '#8b5cf6'];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function fmt(n) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}k`;
  return `₹${n.toFixed(0)}`;
}

/* ── Mini bar chart ── */
function MiniBarChart({ values, color = '#6366f1', height = 36 }) {
  if (!values || values.length === 0) return null;
  const max = Math.max(...values, 1);
  const w = 100 / values.length;
  return (
    <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" style={{ width: '100%', height }}>
      {values.map((v, i) => {
        const barH = (v / max) * (height - 2);
        return (
          <rect
            key={i}
            x={i * w + 1}
            y={height - barH}
            width={w - 2}
            height={barH}
            rx="1"
            fill={color}
            opacity={0.75}
          />
        );
      })}
    </svg>
  );
}

/* ── Horizontal bar chart for group comparison ── */
function GroupBarChart({ groups }) {
  const maxAmt = Math.max(...groups.map(g => g.totalSpent), 1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
      {groups.map((g, i) => (
        <div key={g.id}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '22px', height: '22px', borderRadius: '0.375rem', flexShrink: 0,
                background: AVATAR_COLORS[i % AVATAR_COLORS.length],
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: '0.625rem', fontWeight: 700,
              }}>
                {g.name[0].toUpperCase()}
              </div>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-2)', fontWeight: 500 }}>{g.name}</span>
            </div>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text)' }}>{fmt(g.totalSpent)}</span>
          </div>
          <div style={{ height: '6px', background: 'var(--bg-muted)', borderRadius: '9999px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${(g.totalSpent / maxAmt) * 100}%`,
              background: AVATAR_COLORS[i % AVATAR_COLORS.length],
              borderRadius: '9999px',
              transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Monthly spending area-line chart ── */
function SpendingChart({ monthlyData }) {
  if (!monthlyData.length) return (
    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-3)', fontSize: '0.875rem' }}>
      No expense data yet
    </div>
  );

  const W = 400, H = 100;
  const max = Math.max(...monthlyData.map(d => d.total), 1);
  const pts = monthlyData.map((d, i) => {
    const x = monthlyData.length === 1 ? W / 2 : (i / (monthlyData.length - 1)) * W;
    const y = H - (d.total / max) * (H - 16);
    return { x, y, ...d };
  });

  const polyline = pts.map(p => `${p.x},${p.y}`).join(' ');
  const area = `${pts[0]?.x},${H} ${polyline} ${pts[pts.length - 1]?.x},${H}`;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 80, overflow: 'visible' }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <polygon points={area} fill="url(#areaGrad)" />
        <polyline points={polyline} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="var(--accent)" />
        ))}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.375rem' }}>
        {monthlyData.map(d => (
          <span key={d.label} style={{ fontSize: '0.625rem', color: 'var(--text-3)', textAlign: 'center' }}>
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);

  const fetchGroups = async () => {
    try {
      const res = await api.get('/groups');
      setGroups(res.data);
    } catch { toast.error('Failed to load groups'); }
  };

  useEffect(() => { fetchGroups(); }, []);

  const createGroup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/groups', form);
      toast.success('Group created!');
      setShowCreate(false);
      setForm({ name: '', description: '' });
      fetchGroups();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    } finally { setLoading(false); }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  // ── Computed stats ──
  const totalSpent = groups.reduce((s, g) => s + g.expenses.reduce((a, e) => a + Number(e.amountInr), 0), 0);
  const totalExpenses = groups.reduce((s, g) => s + (g._count?.expenses || 0), 0);
  const memberSet = new Set();
  groups.forEach(g => g.memberships?.forEach(m => memberSet.add(m.userId)));
  const totalMembers = memberSet.size;

  const groupsWithTotals = groups.map(g => ({
    ...g,
    totalSpent: g.expenses.reduce((s, e) => s + Number(e.amountInr), 0),
  })).sort((a, b) => b.totalSpent - a.totalSpent);

  // ── Monthly spending (last 6 months across all groups) ──
  const monthlyMap = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-IN', { month: 'short' });
    monthlyMap[key] = { label, total: 0 };
  }
  groups.forEach(g => {
    g.expenses.forEach(e => {
      const d = new Date(e.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyMap[key]) monthlyMap[key].total += Number(e.amountInr);
    });
  });
  const monthlyData = Object.values(monthlyMap);

  // ── Month-over-month trend ──
  const thisMonth = monthlyData[monthlyData.length - 1]?.total || 0;
  const lastMonth = monthlyData[monthlyData.length - 2]?.total || 0;
  const trendPct = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;

  const statCards = [
    { label: 'Total Spent', value: fmt(totalSpent), sub: trendPct !== 0 ? `${trendPct > 0 ? '+' : ''}${trendPct.toFixed(0)}% vs last month` : 'Across all groups', Icon: IndianRupee, color: '#6366f1' },
    { label: 'Expenses', value: totalExpenses, sub: 'Total logged', Icon: Receipt, color: '#22c55e' },
    { label: 'Groups', value: groups.length, sub: 'Active', Icon: Users, color: '#f59e0b' },
    { label: 'People', value: totalMembers, sub: 'In your network', Icon: Wallet, color: '#ec4899' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg)' }}>

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: '256px', minHeight: '100vh', position: 'fixed', left: 0, top: 0,
        display: 'flex', flexDirection: 'column', zIndex: 40,
        background: 'var(--bg-subtle)', borderRight: '1px solid var(--border)',
      }}>
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)' }}>
          <Link to="/dashboard" style={{ textDecoration: 'none' }}>
            <Logo />
          </Link>
        </div>

        <div style={{ flex: 1, padding: '1rem 0.75rem', overflowY: 'auto' }}>
          <p style={{
            fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: 'var(--text-3)',
            padding: '0 0.625rem', marginBottom: '0.5rem',
          }}>My Groups</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            {groups.map((g, i) => (
              <Link key={g.id} to={`/groups/${g.id}`} style={{
                display: 'flex', alignItems: 'center', gap: '0.625rem',
                padding: '0.5rem 0.625rem', borderRadius: '0.5rem',
                textDecoration: 'none', color: 'var(--text-2)',
                transition: 'background 0.15s ease, color 0.15s ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-muted)'; e.currentTarget.style.color = 'var(--text)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-2)'; }}
              >
                <span style={{
                  width: '30px', height: '30px', borderRadius: '0.5rem', flexShrink: 0,
                  background: AVATAR_COLORS[i % AVATAR_COLORS.length],
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: '0.75rem', fontWeight: 700,
                }}>
                  {g.name[0].toUpperCase()}
                </span>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {g.name}
                  </p>
                  <p style={{ fontSize: '0.6875rem', color: 'var(--text-3)' }}>{g._count?.expenses || 0} expenses</p>
                </div>
              </Link>
            ))}
          </div>

          <button onClick={() => setShowCreate(true)} style={{
            marginTop: '0.625rem', width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.5rem 0.625rem', borderRadius: '0.5rem', fontSize: '0.875rem',
            color: 'var(--text-3)', background: 'none',
            border: '1px dashed var(--border)', cursor: 'pointer',
            transition: 'border-color 0.2s ease, color 0.2s ease, background 0.2s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent-subtle)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.background = 'none'; }}
          >
            <Plus size={14} /> New Group
          </button>
        </div>

        <div style={{ padding: '0.75rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <Link to="/" style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.5rem 0.625rem', borderRadius: '0.5rem',
            fontSize: '0.875rem', color: 'var(--text-3)',
            textDecoration: 'none', transition: 'background 0.15s ease, color 0.15s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-muted)'; e.currentTarget.style.color = 'var(--text)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-3)'; }}
          >
            <Home size={15} /> Home
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.625rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div style={{
                width: '30px', height: '30px', borderRadius: '50%',
                background: 'var(--accent)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: 'white', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
              }}>
                {user?.username?.[0]?.toUpperCase()}
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text)' }}>{user?.username}</p>
                <p style={{ fontSize: '0.6875rem', color: 'var(--text-3)' }}>Free plan</p>
              </div>
            </div>
            <button onClick={handleLogout} style={{
              padding: '0.375rem', background: 'none', border: 'none',
              color: 'var(--text-3)', cursor: 'pointer', borderRadius: '0.375rem',
              transition: 'color 0.2s ease',
            }}
              onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
              title="Log out"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main style={{ marginLeft: '256px', flex: 1, padding: '2rem 2.5rem', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.625rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: '0.25rem' }}>
            {getGreeting()}, {user?.username}
          </h1>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-2)' }}>
            Here's what's happening across your groups.
          </p>
        </div>

        {/* ── Stat cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
          {statCards.map(({ label, value, sub, Icon, color }) => (
            <div key={label} style={{
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: '0.875rem', padding: '1.125rem',
              boxShadow: 'var(--shadow)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              cursor: 'default',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-3)', fontWeight: 500 }}>{label}</span>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '0.5rem',
                  background: `${color}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={15} style={{ color }} />
                </div>
              </div>
              <p style={{ fontSize: '1.875rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: '0.25rem', lineHeight: 1 }}>
                {value}
              </p>
              <p style={{ fontSize: '0.75rem', color: label === 'Total Spent' && trendPct > 0 ? '#f87171' : label === 'Total Spent' && trendPct < 0 ? '#22c55e' : 'var(--text-3)' }}>
                {sub}
              </p>
            </div>
          ))}
        </div>

        {/* ── Analytics row ── */}
        {groups.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.75rem' }}>

            {/* Monthly spending chart */}
            <div style={{
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: '0.875rem', padding: '1.25rem', boxShadow: 'var(--shadow)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <TrendingUp size={14} style={{ color: 'var(--accent)' }} />
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)' }}>Spending Trend</span>
                <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-3)' }}>Last 6 months</span>
              </div>
              <SpendingChart monthlyData={monthlyData} />
            </div>

            {/* Group comparison */}
            <div style={{
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: '0.875rem', padding: '1.25rem', boxShadow: 'var(--shadow)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <IndianRupee size={14} style={{ color: 'var(--accent)' }} />
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)' }}>Groups by Spending</span>
              </div>
              {groupsWithTotals.length === 0 || groupsWithTotals.every(g => g.totalSpent === 0) ? (
                <p style={{ fontSize: '0.875rem', color: 'var(--text-3)', textAlign: 'center', padding: '1.5rem 0' }}>
                  No expenses recorded yet
                </p>
              ) : (
                <GroupBarChart groups={groupsWithTotals} />
              )}
            </div>
          </div>
        )}

        {/* ── Groups section ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.01em' }}>
            Your Groups
          </h2>
          {groups.length > 0 && (
            <button onClick={() => setShowCreate(true)} style={{
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              fontSize: '0.875rem', fontWeight: 500, color: 'var(--accent)',
              background: 'none', border: 'none', cursor: 'pointer',
              transition: 'opacity 0.2s ease',
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              <Plus size={14} /> New Group
            </button>
          )}
        </div>

        {groups.length === 0 ? (
          <div style={{
            borderRadius: '1rem', padding: '4rem 2rem', textAlign: 'center',
            background: 'var(--bg-subtle)', border: '2px dashed var(--border)',
          }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '0.875rem',
              background: 'var(--accent-subtle)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 1rem',
            }}>
              <Users size={24} style={{ color: 'var(--accent)' }} />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.5rem' }}>No groups yet</h3>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-2)', marginBottom: '1.5rem' }}>
              Create a group to start tracking shared expenses
            </p>
            <button onClick={() => setShowCreate(true)} style={{
              background: 'var(--accent)', color: 'white', border: 'none',
              borderRadius: '0.625rem', padding: '0.75rem 1.5rem',
              fontSize: '0.9375rem', fontWeight: 600, cursor: 'pointer',
              transition: 'opacity 0.2s ease',
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              Create your first group
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
            {groupsWithTotals.map((g, i) => {
              const monthlyVals = (() => {
                const mp = {};
                for (let k = 5; k >= 0; k--) {
                  const d = new Date(now.getFullYear(), now.getMonth() - k, 1);
                  const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                  mp[key] = 0;
                }
                g.expenses.forEach(e => {
                  const d = new Date(e.date);
                  const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                  if (key in mp) mp[key] += Number(e.amountInr);
                });
                return Object.values(mp);
              })();

              return (
                <Link key={g.id} to={`/groups/${g.id}`} style={{
                  display: 'block', textDecoration: 'none',
                  background: 'var(--card)', border: '1px solid var(--border)',
                  borderRadius: '0.875rem', padding: '1.25rem',
                  boxShadow: 'var(--shadow)',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '0.75rem',
                      background: AVATAR_COLORS[i % AVATAR_COLORS.length],
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontSize: '1.25rem', fontWeight: 700,
                    }}>
                      {g.name[0].toUpperCase()}
                    </div>
                    <span style={{
                      fontSize: '0.6875rem', padding: '0.25rem 0.625rem', borderRadius: '9999px',
                      background: 'var(--bg-muted)', color: 'var(--text-3)', fontWeight: 500,
                    }}>
                      {g._count?.expenses || 0} expenses
                    </span>
                  </div>

                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.25rem', letterSpacing: '-0.01em' }}>
                    {g.name}
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-3)', marginBottom: '0.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {g.description || 'No description'}
                  </p>

                  {/* Total spent + sparkline */}
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div>
                      <p style={{ fontSize: '0.6875rem', color: 'var(--text-3)', marginBottom: '0.1rem' }}>Total spent</p>
                      <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>
                        {fmt(g.totalSpent)}
                      </p>
                    </div>
                    <div style={{ width: '80px', opacity: 0.7 }}>
                      <MiniBarChart values={monthlyVals} color={AVATAR_COLORS[i % AVATAR_COLORS.length]} height={32} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex' }}>
                      {g.memberships?.slice(0, 4).map((m, j) => (
                        <div key={m.id} style={{
                          width: '24px', height: '24px', borderRadius: '50%',
                          background: AVATAR_COLORS[(i + j + 1) % AVATAR_COLORS.length],
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontSize: '0.625rem', fontWeight: 700,
                          border: '2px solid var(--card)', marginLeft: j > 0 ? '-6px' : 0,
                        }}>
                          {(m.displayName || m.user?.username || '?')[0].toUpperCase()}
                        </div>
                      ))}
                      {g.memberships?.length > 4 && (
                        <div style={{
                          width: '24px', height: '24px', borderRadius: '50%',
                          background: 'var(--bg-muted)', color: 'var(--text-3)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.625rem', fontWeight: 600,
                          border: '2px solid var(--card)', marginLeft: '-6px',
                        }}>
                          +{g.memberships.length - 4}
                        </div>
                      )}
                    </div>
                    <ArrowRight size={14} style={{ color: 'var(--accent)', opacity: 0.6 }} />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      {/* ── CREATE GROUP MODAL ── */}
      {showCreate && (
        <div style={{
          position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 50, padding: '1rem',
          background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)',
        }} onClick={() => setShowCreate(false)}>
          <div style={{
            width: '100%', maxWidth: '440px',
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: '1rem', padding: '1.5rem',
            boxShadow: 'var(--shadow-xl)',
            animation: 'rise 0.2s cubic-bezier(0.16,1,0.3,1)',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text)' }}>Create a New Group</h2>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-3)', marginTop: '0.25rem' }}>Start tracking expenses together</p>
              </div>
              <button onClick={() => setShowCreate(false)} style={{
                width: '30px', height: '30px', borderRadius: '0.5rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer',
                transition: 'background 0.15s ease, color 0.15s ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-muted)'; e.currentTarget.style.color = 'var(--text)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-3)'; }}
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={createGroup} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-2)', marginBottom: '0.375rem' }}>
                  Group name *
                </label>
                <input required
                  style={{
                    width: '100%', background: 'var(--bg-subtle)', border: '1px solid var(--border)',
                    borderRadius: '0.5rem', padding: '0.625rem 0.75rem', fontSize: '0.9375rem',
                    color: 'var(--text)', outline: 'none', transition: 'border-color 0.2s ease',
                    boxSizing: 'border-box',
                  }}
                  placeholder="e.g. Flat 4B, Goa Trip 2024..."
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-2)', marginBottom: '0.375rem' }}>
                  Description
                </label>
                <input
                  style={{
                    width: '100%', background: 'var(--bg-subtle)', border: '1px solid var(--border)',
                    borderRadius: '0.5rem', padding: '0.625rem 0.75rem', fontSize: '0.9375rem',
                    color: 'var(--text)', outline: 'none', transition: 'border-color 0.2s ease',
                    boxSizing: 'border-box',
                  }}
                  placeholder="Optional description"
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.25rem' }}>
                <button type="button" onClick={() => setShowCreate(false)} style={{
                  flex: 1, padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.9375rem',
                  fontWeight: 500, color: 'var(--text-2)', background: 'var(--bg-subtle)',
                  border: '1px solid var(--border)', cursor: 'pointer',
                }}>
                  Cancel
                </button>
                <button type="submit" disabled={loading} style={{
                  flex: 1, padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.9375rem',
                  fontWeight: 600, color: 'white', background: 'var(--accent)',
                  border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1, transition: 'opacity 0.2s ease',
                }}>
                  {loading ? 'Creating...' : 'Create Group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
