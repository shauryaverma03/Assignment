import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Plus, Users, Receipt, Wallet, ArrowRight, LogOut, Sparkles } from 'lucide-react';
import Logo from '../components/Logo';

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
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen bg-white border-r border-slate-200 flex flex-col fixed left-0 top-0">
          <div className="p-5 border-b border-slate-100">
            <Link to="/dashboard"><Logo /></Link>
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">My Groups</p>
            <div className="space-y-1">
              {groups.map((g, i) => (
                <Link key={g.id} to={`/groups/${g.id}`}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700 transition group">
                  <span className="w-8 h-8 rounded-lg text-white flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ background: avatarGrads[i % avatarGrads.length] }}>
                    {g.name[0].toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate group-hover:text-accent transition">{g.name}</p>
                    <p className="text-xs text-slate-400">{g.memberships?.length} members</p>
                  </div>
                </Link>
              ))}
            </div>
            <button onClick={() => setShowCreate(true)}
              className="mt-3 w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-slate-300 hover:border-accent text-slate-400 hover:text-accent text-sm transition">
              <Plus size={14} /> New Group
            </button>
          </div>

          <div className="p-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-accent-grad flex items-center justify-center text-white text-sm font-bold">
                  {user?.username?.[0]?.toUpperCase()}
                </div>
                <span className="text-sm font-medium text-slate-700">{user?.username}</span>
              </div>
              <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 transition" title="Log out">
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="ml-64 flex-1 p-8">
          {/* Gradient welcome banner */}
          <div className="relative overflow-hidden rounded-3xl bg-accent-grad p-8 mb-7 shadow-accent-glow">
            <div className="absolute -top-10 -right-10 w-56 h-56 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-16 -left-10 w-56 h-56 bg-black/10 rounded-full blur-2xl"></div>
            <div className="relative flex items-end justify-between flex-wrap gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs px-3 py-1 rounded-full mb-3">
                  <Sparkles size={12} /> Welcome back
                </div>
                <h1 className="text-3xl font-bold text-white mb-1">Hey, {user?.username} 👋</h1>
                <p className="text-white/80 text-sm">Here's what's happening across your groups.</p>
              </div>
              <button onClick={() => setShowCreate(true)}
                className="bg-white text-slate-900 font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-white/90 transition flex items-center gap-2 shadow-lg">
                <Plus size={16} /> New Group
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-5 mb-8">
            {[
              { label: 'Total Groups', value: stats.totalGroups, sub: 'Active groups', Icon: Users },
              { label: 'Total Expenses', value: stats.totalExpenses, sub: 'Across all groups', Icon: Receipt },
              { label: 'People', value: stats.totalMembers, sub: 'In your groups', Icon: Wallet },
            ].map(({ label, value, sub, Icon }) => (
              <div key={label} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-slate-500 text-sm">{label}</span>
                  <div className="w-9 h-9 bg-accent/10 rounded-xl flex items-center justify-center">
                    <Icon size={18} className="text-accent" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-slate-800">{value}</p>
                <p className="text-xs text-slate-400 mt-1">{sub}</p>
              </div>
            ))}
          </div>

          {/* Groups grid */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800 text-lg">Your Groups</h2>
            {groups.length > 0 && (
              <button onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 text-accent text-sm font-medium hover:underline">
                <Plus size={15} /> New Group
              </button>
            )}
          </div>

          {groups.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-16 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-accent-grad flex items-center justify-center mb-5">
                <Users size={28} className="text-white" />
              </div>
              <h3 className="font-bold text-slate-700 text-lg mb-2">No groups yet</h3>
              <p className="text-slate-400 text-sm mb-6">Create a group to start tracking shared expenses</p>
              <button onClick={() => setShowCreate(true)}
                className="bg-accent-grad text-white px-6 py-2.5 rounded-xl hover:opacity-90 transition text-sm font-semibold shadow-accent-glow">
                Create your first group
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map((g, i) => (
                <Link key={g.id} to={`/groups/${g.id}`}
                  className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-accent hover:shadow-lg transition group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl text-white flex items-center justify-center text-xl font-bold"
                      style={{ background: avatarGrads[i % avatarGrads.length] }}>
                      {g.name[0].toUpperCase()}
                    </div>
                    <span className="text-xs bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full font-medium">
                      {g._count?.expenses || 0} expenses
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-800 group-hover:text-accent transition mb-1">{g.name}</h3>
                  <p className="text-slate-400 text-sm mb-4 truncate">{g.description || 'No description'}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {g.memberships?.slice(0, 4).map((m, j) => (
                        <div key={m.id} className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                          style={{ background: avatarGrads[(i + j + 1) % avatarGrads.length] }}>
                          {(m.displayName || m.user?.username || '?')[0].toUpperCase()}
                        </div>
                      ))}
                      {g.memberships?.length > 4 && (
                        <div className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-slate-500 text-xs font-medium">
                          +{g.memberships.length - 4}
                        </div>
                      )}
                    </div>
                    <ArrowRight size={16} className="text-slate-300 group-hover:text-accent transition" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Create Group Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-bold mb-1 text-slate-800">Create a New Group</h2>
            <p className="text-slate-500 text-sm mb-5">Give your group a name and start tracking expenses together.</p>
            <form onSubmit={createGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Group name *</label>
                <input required
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="e.g. Flat 4B, Goa Trip 2024..."
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <input
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Optional description"
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowCreate(false)}
                  className="flex-1 border border-slate-200 py-2.5 rounded-xl text-sm hover:bg-slate-50 font-medium text-slate-600">Cancel</button>
                <button type="submit" disabled={loading}
                  className="flex-1 bg-accent-grad text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition">
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
