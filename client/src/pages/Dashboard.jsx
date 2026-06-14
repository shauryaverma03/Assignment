import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Plus, Users, Receipt, Wallet, ArrowRight, LogOut, Home, X } from 'lucide-react';
import Logo from '../components/Logo';

const AVATAR_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ec4899', '#3b82f6', '#8b5cf6'];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ totalGroups: 0, totalExpenses: 0, totalMembers: 0 });

  const fetchGroups = async () => {
    try {
      const res = await api.get('/groups');
      setGroups(res.data);
      const members = new Set();
      res.data.forEach(g => g.memberships?.forEach(m => members.add(m.userId)));
      setStats({
        totalGroups: res.data.length,
        totalExpenses: res.data.reduce((s, g) => s + (g._count?.expenses || 0), 0),
        totalMembers: members.size,
      });
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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg)' }}>

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: '256px', minHeight: '100vh', position: 'fixed', left: 0, top: 0,
        display: 'flex', flexDirection: 'column', zIndex: 40,
        background: 'var(--bg-subtle)', borderRight: '1px solid var(--border)',
      }}>
        {/* Logo */}
        <div style={{ padding: '1.25rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
          <Link to="/dashboard" style={{ textDecoration: 'none' }}>
            <Logo />
          </Link>
        </div>

        {/* Nav */}
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

        {/* Bottom */}
        <div style={{ padding: '0.75rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <Link to="/" style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.5rem 0.625rem', borderRadius: '0.5rem',
            fontSize: '0.875rem', color: 'var(--text-3)',
            textDecoration: 'none',
            transition: 'background 0.15s ease, color 0.15s ease',
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
          <h1 style={{
            fontSize: '1.625rem', fontWeight: 700, letterSpacing: '-0.02em',
            color: 'var(--text)', marginBottom: '0.25rem',
          }}>
            {getGreeting()}, {user?.username}
          </h1>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-2)' }}>
            Here's what's happening across your groups.
          </p>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Groups', value: stats.totalGroups, sub: 'Active', Icon: Users },
            { label: 'Expenses', value: stats.totalExpenses, sub: 'Total logged', Icon: Receipt },
            { label: 'People', value: stats.totalMembers, sub: 'In your network', Icon: Wallet },
          ].map(({ label, value, sub, Icon }) => (
            <div key={label} style={{
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: '0.875rem', padding: '1.25rem',
              boxShadow: 'var(--shadow)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              cursor: 'default',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-3)', fontWeight: 500 }}>{label}</span>
                <div style={{
                  width: '34px', height: '34px', borderRadius: '0.5rem',
                  background: 'var(--accent-subtle)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={16} style={{ color: 'var(--accent)' }} />
                </div>
              </div>
              <p style={{ fontSize: '2.25rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: '0.25rem' }}>
                {value}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{sub}</p>
            </div>
          ))}
        </div>

        {/* Groups section */}
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

        {/* Groups grid */}
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
            {groups.map((g, i) => (
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
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
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
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-3)', marginBottom: '1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {g.description || 'No description'}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex' }}>
                    {g.memberships?.slice(0, 4).map((m, j) => (
                      <div key={m.id} style={{
                        width: '26px', height: '26px', borderRadius: '50%',
                        background: AVATAR_COLORS[(i + j + 1) % AVATAR_COLORS.length],
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontSize: '0.6875rem', fontWeight: 700,
                        border: '2px solid var(--card)',
                        marginLeft: j > 0 ? '-6px' : 0,
                      }}>
                        {(m.displayName || m.user?.username || '?')[0].toUpperCase()}
                      </div>
                    ))}
                    {g.memberships?.length > 4 && (
                      <div style={{
                        width: '26px', height: '26px', borderRadius: '50%',
                        background: 'var(--bg-muted)', color: 'var(--text-3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.6875rem', fontWeight: 600,
                        border: '2px solid var(--card)', marginLeft: '-6px',
                      }}>
                        +{g.memberships.length - 4}
                      </div>
                    )}
                  </div>
                  <ArrowRight size={15} style={{ color: 'var(--accent)', opacity: 0.6 }} />
                </div>
              </Link>
            ))}
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
                  transition: 'color 0.2s ease',
                }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-2)'}
                >
                  Cancel
                </button>
                <button type="submit" disabled={loading} style={{
                  flex: 1, padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.9375rem',
                  fontWeight: 600, color: 'white', background: 'var(--accent)',
                  border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1, transition: 'opacity 0.2s ease',
                }}
                  onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.88'; }}
                  onMouseLeave={e => { if (!loading) e.currentTarget.style.opacity = '1'; }}
                >
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
