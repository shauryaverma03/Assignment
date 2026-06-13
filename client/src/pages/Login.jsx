import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.token, res.data.user);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950">
      <div className="hidden lg:flex flex-col justify-center px-16 w-1/2 text-white">
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold mb-16">
          <span>💸</span>
          <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">SplitWise</span>
        </Link>
        <h2 className="text-4xl font-bold mb-4 leading-tight">Track every rupee.<br/>Settle every debt.</h2>
        <p className="text-slate-400 text-lg">Smart shared expense management for flatmates, trips, and groups.</p>
        <div className="mt-10 space-y-3">
          {['Equal, exact, % and share-based splits','USD to INR auto conversion','CSV import with anomaly detection'].map(f => (
            <div key={f} className="flex items-center gap-2 text-slate-300 text-sm">
              <span className="w-5 h-5 rounded-full bg-indigo-500/30 text-indigo-400 flex items-center justify-center text-xs">✓</span>
              {f}
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Welcome back</h1>
          <p className="text-slate-500 text-sm mb-6">Log in to your account</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input type="email" required value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm bg-slate-50"
                placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input type="password" required value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm bg-slate-50"
                placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-3 rounded-xl font-semibold transition disabled:opacity-50 shadow-md">
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>
          <p className="text-center text-slate-500 text-sm mt-5">
            No account? <Link to="/register" className="text-indigo-600 font-semibold hover:underline">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
