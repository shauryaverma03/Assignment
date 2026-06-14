import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Plus, Users, Receipt, Wallet, ArrowRight, LogOut, Home, Zap, X } from 'lucide-react';

const avatarGrads = [
  'linear-gradient(135deg,#6366f1,#d946ef)',
  'linear-gradient(135deg,#10b981,#06b6d4)',
  'linear-gradient(135deg,#f97316,#f43f5e)',
  'linear-gradient(135deg,#8b5cf6,#ec4899)',
  'linear-gradient(135deg,#2563eb,#06b6d4)',
  'linear-gradient(135deg,#f43f5e,#fb7185)',
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ totalGroups: 0, totalExpenses: 0, totalMembers: 0 });
  const [hovered, setHovered] = useState(null);

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

  // 3D tilt on card
  const handleTilt = (e, id) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(700px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg) scale(1.025)`;
    card.style.boxShadow = `${-x*24}px ${-y*18}px 50px rgba(0,0,0,0.28), 0 0 40px rgb(var(--accent)/0.18)`;
  };
  const resetTilt = (e) => {
    e.currentTarget.style.transform = '';
    e.currentTarget.style.boxShadow = '';
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#0d0d12' }}>

      {/* ── SIDEBAR ── */}
      <aside className="w-64 min-h-screen fixed left-0 top-0 flex flex-col z-40"
        style={{ background: 'rgba(255,255,255,0.03)', borderRight: '1px solid rgba(255,255,255,0.07)' }}>

        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/6">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-accent-grad flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 7h10M7 7l3-3M7 7l3 3"/><path d="M17 17H7M17 17l-3 3M17 17l-3-3"/>
              </svg>
            </div>
            <span className="font-bold text-white text-lg tracking-tight">Split<span className="text-accent-grad">wise</span></span>
          </Link>
        </div>

        {/* Groups list */}
        <div className="flex-1 px-3 py-4 overflow-y-auto">
          <p className="text-[10px] font-bold tracking-widest uppercase text-white/25 px-2 mb-3">My Groups</p>
          <div className="space-y-0.5">
            {groups.map((g, i) => (
              <Link key={g.id} to={`/groups/${g.id}`}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition group"
                style={{ color: 'rgba(255,255,255,0.6)' }}
                onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.06)'; e.currentTarget.style.color='white'; }}
                onMouseLeave={e => { e.currentTarget.style.background=''; e.currentTarget.style.color='rgba(255,255,255,0.6)'; }}>
                <span className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{ background: avatarGrads[i % avatarGrads.length] }}>
                  {g.name[0].toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{g.name}</p>
                  <p className="text-[11px] text-white/30">{g._count?.expenses || 0} expenses</p>
                </div>
              </Link>
            ))}
          </div>
          <button onClick={() => setShowCreate(true)}
            className="mt-3 w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition"
            style={{ color: 'rgba(255,255,255,0.3)', border: '1px dashed rgba(255,255,255,0.12)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='rgb(var(--accent)/0.5)'; e.currentTarget.style.color='rgb(var(--accent))'; e.currentTarget.style.background='rgb(var(--accent)/0.06)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.12)'; e.currentTarget.style.color='rgba(255,255,255,0.3)'; e.currentTarget.style.background=''; }}>
            <Plus size={14} /> New Group
          </button>
        </div>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-white/6 space-y-1">
          <Link to="/" className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:text-white hover:bg-white/5 transition w-full">
            <Home size={15} /> Home
          </Link>
          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-accent-grad flex items-center justify-center text-white text-sm font-bold shadow-accent-glow">
                {user?.username?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{user?.username}</p>
                <p className="text-[10px] text-white/30">Free plan</p>
              </div>
            </div>
            <button onClick={handleLogout} className="text-white/30 hover:text-red-400 transition p-1" title="Log out">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="ml-64 flex-1 p-8 overflow-y-auto">

        {/* Hero banner */}
        <div className="relative rounded-3xl overflow-hidden mb-8 p-8"
          style={{
            background: 'linear-gradient(135deg, rgb(var(--accent)/0.15), rgb(var(--accent-2)/0.1))',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
          {/* orbs */}
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full blur-3xl opacity-40 pointer-events-none"
            style={{ background: 'rgb(var(--accent))' }}/>
          <div className="absolute -bottom-10 left-10 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{ background: 'rgb(var(--accent-2))' }}/>
          <div className="relative flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full mb-3"
                style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>
                <Zap size={11}/> Overview
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight mb-1">
                Hey, <span className="text-accent-grad">{user?.username}</span> 👋
              </h1>
              <p className="text-white/50 text-sm">Here's what's happening across your groups.</p>
            </div>
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 font-semibold text-sm px-5 py-2.5 rounded-2xl transition hover:scale-105"
              style={{ background: 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.15)' }}
              onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.12)'}>
              <Plus size={16}/> New Group
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Groups', value: stats.totalGroups, sub: 'Active', Icon: Users, grad: 'from-violet-500 to-purple-600' },
            { label: 'Expenses', value: stats.totalExpenses, sub: 'Total logged', Icon: Receipt, grad: 'from-orange-500 to-rose-500' },
            { label: 'People', value: stats.totalMembers, sub: 'In your network', Icon: Wallet, grad: 'from-emerald-500 to-teal-500' },
          ].map(({ label, value, sub, Icon, grad }) => (
            <div key={label}
              className="rounded-2xl p-5 transition-all duration-300 cursor-default"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.07)'; e.currentTarget.style.transform='translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.transform=''; }}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-white/40 font-medium">{label}</span>
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center shadow-lg`}>
                  <Icon size={17} className="text-white"/>
                </div>
              </div>
              <p className="text-4xl font-extrabold text-white tracking-tight">{value}</p>
              <p className="text-xs text-white/30 mt-1">{sub}</p>
            </div>
          ))}
        </div>

        {/* Groups heading */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-white text-lg tracking-tight">Your Groups</h2>
          {groups.length > 0 && (
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 text-sm font-medium text-accent hover:opacity-80 transition">
              <Plus size={14}/> New Group
            </button>
          )}
        </div>

        {/* Groups grid */}
        {groups.length === 0 ? (
          <div className="rounded-3xl p-16 text-center"
            style={{ background: 'rgba(255,255,255,0.03)', border: '2px dashed rgba(255,255,255,0.08)' }}>
            <div className="w-16 h-16 mx-auto rounded-3xl bg-accent-grad flex items-center justify-center mb-5 shadow-accent-glow">
              <Users size={28} className="text-white"/>
            </div>
            <h3 className="font-bold text-white text-xl mb-2">No groups yet</h3>
            <p className="text-white/40 text-sm mb-7">Create a group to start tracking shared expenses</p>
            <button onClick={() => setShowCreate(true)}
              className="bg-accent-grad text-white px-7 py-3 rounded-2xl font-semibold text-sm hover:opacity-90 hover:scale-105 transition-all shadow-accent-glow">
              Create your first group
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((g, i) => (
              <Link key={g.id} to={`/groups/${g.id}`}
                onMouseMove={(e) => handleTilt(e, g.id)}
                onMouseLeave={resetTilt}
                className="block rounded-3xl p-5 transition-all duration-300"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  transformStyle: 'preserve-3d',
                  transition: 'transform .4s cubic-bezier(0.16,1,0.3,1), box-shadow .4s ease, background .2s ease',
                }}>
                <div className="flex items-start justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl text-white flex items-center justify-center text-xl font-bold shadow-lg"
                    style={{ background: avatarGrads[i % avatarGrads.length] }}>
                    {g.name[0].toUpperCase()}
                  </div>
                  <span className="text-[11px] px-2.5 py-1 rounded-full font-medium"
                    style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)' }}>
                    {g._count?.expenses || 0} expenses
                  </span>
                </div>
                <h3 className="font-bold text-white mb-1 text-base tracking-tight">{g.name}</h3>
                <p className="text-white/35 text-sm mb-5 truncate">{g.description || 'No description'}</p>
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {g.memberships?.slice(0, 4).map((m, j) => (
                      <div key={m.id} className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ background: avatarGrads[(i + j + 1) % avatarGrads.length], border: '2px solid #0d0d12' }}>
                        {(m.displayName || m.user?.username || '?')[0].toUpperCase()}
                      </div>
                    ))}
                    {g.memberships?.length > 4 && (
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium"
                        style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.5)', border: '2px solid #0d0d12' }}>
                        +{g.memberships.length - 4}
                      </div>
                    )}
                  </div>
                  <ArrowRight size={16} className="text-accent opacity-60" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* ── CREATE MODAL ── */}
      {showCreate && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)' }}>
          <div className="w-full max-w-md rounded-3xl p-6 shadow-2xl"
            style={{ background: '#141418', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-white">Create a New Group</h2>
                <p className="text-white/40 text-sm mt-0.5">Start tracking expenses together</p>
              </div>
              <button onClick={() => setShowCreate(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition">
                <X size={16}/>
              </button>
            </div>
            <form onSubmit={createGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">Group name *</label>
                <input required
                  className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none transition"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                  placeholder="e.g. Flat 4B, Goa Trip 2024..."
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  onFocus={e => e.target.style.borderColor='rgb(var(--accent)/0.6)'}
                  onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.1)'} />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">Description</label>
                <input
                  className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none transition"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                  placeholder="Optional description"
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  onFocus={e => e.target.style.borderColor='rgb(var(--accent)/0.6)'}
                  onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.1)'} />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowCreate(false)}
                  className="flex-1 py-3 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/8 transition"
                  style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                  Cancel
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 bg-accent-grad text-white py-3 rounded-xl text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition shadow-accent-glow">
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
