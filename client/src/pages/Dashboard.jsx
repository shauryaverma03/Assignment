import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Plus, Users, Receipt, TrendingUp, ArrowRight, LogOut } from 'lucide-react';
import Logo from '../components/Logo';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ totalGroups: 0, totalExpenses: 0 });

  const fetchGroups = async () => {
    try {
      const res = await api.get('/groups');
      setGroups(res.data);
      setStats({
        totalGroups: res.data.length,
        totalExpenses: res.data.reduce((s, g) => s + (g._count?.expenses || 0), 0),
      });
    } catch { toast.error('Failed to load groups'); }
  };

  useEffect(() => { fetchGroups(); }, []);

  const createGroup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/groups', form);
      toast.success('Group created!');
      setShowCreate(false);
      setForm({ name: '', description: '' });
      fetchGroups();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    } finally { setLoading(false); }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const avatarColors = ['bg-emerald-500','bg-violet-500','bg-pink-500','bg-sky-500','bg-orange-500','bg-cyan-500'];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar + content layout */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen bg-white border-r border-slate-200 flex flex-col fixed left-0 top-0">
          <div className="p-5 border-b border-slate-100">
            <Link to="/dashboard"><Logo /></Link>
          </div>

          <div className="flex-1 p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">My Groups</p>
            <div className="space-y-1">
              {groups.map((g, i) => (
                <Link key={g.id} to={`/groups/${g.id}`}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-emerald-50 text-slate-700 hover:text-emerald-600 transition group">
                  <span className={`w-8 h-8 rounded-lg ${avatarColors[i % avatarColors.length]} text-white flex items-center justify-center text-sm font-bold flex-shrink-0`}>
                    {g.name[0].toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{g.name}</p>
                    <p className="text-xs text-slate-400">{g.memberships?.length} members</p>
                  </div>
                </Link>
              ))}
            </div>
            <button onClick={() => setShowCreate(true)}
              className="mt-3 w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-slate-300 hover:border-emerald-400 text-slate-400 hover:text-emerald-500 text-sm transition">
              <Plus size={14} /> New Group
            </button>
          </div>

          <div className="p-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-sm font-bold">
                  {user?.username?.[0]?.toUpperCase()}
                </div>
                <span className="text-sm font-medium text-slate-700">{user?.username}</span>
              </div>
              <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 transition">
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="ml-64 flex-1 p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
            <p className="text-slate-500 text-sm mt-1">Welcome back, {user?.username}! Here's your overview.</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-5 mb-8">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-500 text-sm">Total Groups</span>
                <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Users size={18} className="text-emerald-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-800">{stats.totalGroups}</p>
              <p className="text-xs text-slate-400 mt-1">Active groups</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-500 text-sm">Total Expenses</span>
                <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Receipt size={18} className="text-purple-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-800">{stats.totalExpenses}</p>
              <p className="text-xs text-slate-400 mt-1">Across all groups</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white shadow-lg shadow-emerald-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-emerald-200 text-sm">Quick Action</span>
                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                  <TrendingUp size={18} className="text-white" />
                </div>
              </div>
              <p className="text-lg font-bold">Add an expense</p>
              <p className="text-emerald-200 text-xs mt-1">Open any group to add</p>
            </div>
          </div>

          {/* Groups grid */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800 text-lg">Your Groups</h2>
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition shadow-sm">
              <Plus size={15} /> New Group
            </button>
          </div>

          {groups.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-16 text-center">
              <div className="text-5xl mb-4">👥</div>
              <h3 className="font-bold text-slate-700 text-lg mb-2">No groups yet</h3>
              <p className="text-slate-400 text-sm mb-6">Create a group to start tracking shared expenses</p>
              <button onClick={() => setShowCreate(true)}
                className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl hover:bg-emerald-700 transition text-sm font-medium">
                Create your first group
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map((g, i) => (
                <Link key={g.id} to={`/groups/${g.id}`}
                  className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-emerald-300 hover:shadow-md transition group">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-11 h-11 rounded-xl ${avatarColors[i % avatarColors.length]} text-white flex items-center justify-center text-xl font-bold`}>
                      {g.name[0].toUpperCase()}
                    </div>
                    <span className="text-xs bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full font-medium">
                      {g._count?.expenses || 0} expenses
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-800 group-hover:text-emerald-600 transition mb-1">{g.name}</h3>
                  <p className="text-slate-400 text-sm mb-4 truncate">{g.description || 'No description'}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {g.memberships?.slice(0, 4).map((m, j) => (
                        <div key={m.id} className={`w-7 h-7 rounded-full ${avatarColors[(i+j+1) % avatarColors.length]} border-2 border-white flex items-center justify-center text-white text-xs font-bold`}>
                          {(m.displayName || m.user?.username || '?')[0].toUpperCase()}
                        </div>
                      ))}
                      {g.memberships?.length > 4 && (
                        <div className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-slate-500 text-xs font-medium">
                          +{g.memberships.length - 4}
                        </div>
                      )}
                    </div>
                    <ArrowRight size={16} className="text-slate-300 group-hover:text-emerald-400 transition" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Create Group Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-bold mb-1 text-slate-800">Create a New Group</h2>
            <p className="text-slate-500 text-sm mb-5">Give your group a name and start tracking expenses together.</p>
            <form onSubmit={createGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Group name *</label>
                <input required
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm bg-slate-50"
                  placeholder="e.g. Flat 4B, Goa Trip 2024..."
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <input
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm bg-slate-50"
                  placeholder="Optional description"
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowCreate(false)}
                  className="flex-1 border border-slate-200 py-2.5 rounded-xl text-sm hover:bg-slate-50 font-medium text-slate-600">Cancel</button>
                <button type="submit" disabled={loading}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 hover:from-emerald-500 hover:to-purple-500 transition">
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
