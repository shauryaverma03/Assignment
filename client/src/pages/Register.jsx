import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { ArrowRight, Check } from 'lucide-react';
import Logo from '../components/Logo';

export default function Register() {
  const [form, setForm] = useState({ email: '', username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/register', form);
      login(res.data.token, res.data.user);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex">
      {/* LEFT — form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 bg-white">
        <div className="max-w-sm w-full mx-auto">
          <Link to="/"><Logo size="lg" /></Link>
          <p className="text-xs font-semibold tracking-[0.2em] text-zinc-400 mt-12 mb-3">GET STARTED</p>
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">Create your account</h1>
          <p className="text-zinc-500 mb-8">Free forever. No credit card required.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">Email</label>
              <input type="email" required value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full border border-zinc-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 text-sm"
                placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">Username</label>
              <input type="text" required value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                className="w-full border border-zinc-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 text-sm"
                placeholder="shaurya" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">Password</label>
              <input type="password" required value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full border border-zinc-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 text-sm"
                placeholder="Min 8 characters" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 rounded-xl font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? 'Creating account...' : <>Create account <ArrowRight size={17} /></>}
            </button>
          </form>

          <p className="text-center text-zinc-500 text-sm mt-8">
            Already have an account? <Link to="/login" className="text-emerald-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>

      {/* RIGHT — dark */}
      <div className="hidden lg:flex w-1/2 relative bg-[#0a0a0a] grid-texture overflow-hidden items-center justify-center p-12">
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/15 blur-[120px] rounded-full"></div>
        <div className="relative max-w-md">
          <h2 className="text-4xl font-bold text-white leading-tight mb-6">Start splitting<br /><span className="text-zinc-500">in 30 seconds.</span></h2>
          <p className="text-zinc-400 mb-8">Create a group, add expenses, and see exactly who owes what — instantly.</p>
          <ul className="space-y-4">
            {['Equal, exact, % and share-based splits', 'USD → INR auto conversion', 'CSV import with anomaly detection', 'Min-cash-flow debt settlement'].map(f => (
              <li key={f} className="flex items-center gap-3 text-zinc-300">
                <span className="w-6 h-6 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <Check size={13} />
                </span>
                <span className="text-sm">{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
