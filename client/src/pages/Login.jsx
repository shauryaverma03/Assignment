import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { ArrowRight } from 'lucide-react';
import Logo from '../components/Logo';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
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
    } finally { setLoading(false); }
  };

  const inputCls = "w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent";

  return (
    <div className="min-h-screen flex">
      {/* LEFT — form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 bg-white">
        <div className="max-w-sm w-full mx-auto">
          <Link to="/"><Logo size="lg" /></Link>
          <p className="text-xs font-semibold tracking-[0.2em] text-zinc-400 mt-12 mb-3">SIGN IN</p>
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">Welcome back</h1>
          <p className="text-zinc-500 mb-8">Sign in to your Splitwise account.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">Email</label>
              <input type="email" required value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className={inputCls} placeholder="you@example.com" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-zinc-700">Password</label>
                <button type="button" onClick={() => setShow(s => !s)} className="text-xs font-semibold text-zinc-400 hover:text-zinc-600">
                  {show ? 'HIDE' : 'SHOW'}
                </button>
              </div>
              <input type={show ? 'text' : 'password'} required value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className={inputCls} placeholder="Enter your password" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-accent hover:bg-accent-hover text-accent-fg py-3.5 rounded-xl font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? 'Signing in...' : <>Sign in <ArrowRight size={17} /></>}
            </button>
          </form>

          <p className="text-center text-zinc-500 text-sm mt-8">
            New here? <Link to="/register" className="text-accent font-semibold hover:underline">Create an account</Link>
          </p>
        </div>
      </div>

      {/* RIGHT — dark dashboard mockup */}
      <div className="hidden lg:flex w-1/2 relative bg-[#0a0a0a] grid-texture overflow-hidden items-center justify-center p-12">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/15 blur-[120px] rounded-full"></div>
        <div className="relative w-full max-w-md">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <StatCard label="GROUPS" value="3" sub="↑ 1 this month" />
            <StatCard label="EXPENSES" value="48" sub="across all groups" />
          </div>
          <div className="bg-[#111] border border-zinc-800 rounded-2xl p-5 mb-4">
            <p className="text-xs tracking-wider text-zinc-500 mb-4">GOA TRIP · BALANCES</p>
            <div className="space-y-3">
              {[['Aisha','+₹2,340',true],['Rohan','−₹1,180',false],['Dev','−₹2,050',false]].map(([n,a,p]) => (
                <div key={n} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center text-xs font-bold">{n[0]}</div>
                    <span className="text-sm text-zinc-300">{n}</span>
                  </div>
                  <span className={`text-sm font-semibold ${p ? 'text-accent' : 'text-red-400'}`}>{a}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-accent/5 border border-accent/20 rounded-2xl px-5 py-4">
            <p className="text-xs tracking-wider text-accent/70 mb-1">SETTLE UP</p>
            <p className="text-white font-semibold">Rohan pays Aisha <span className="text-accent">₹1,180</span></p>
          </div>
          <div className="mt-10">
            <p className="text-xs font-semibold tracking-[0.2em] text-accent/70 mb-2">WELCOME TO SPLITWISE</p>
            <h2 className="text-3xl font-bold text-white leading-tight">Your balances,<br /><span className="text-zinc-500">always in view.</span></h2>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-[#111] border border-zinc-800 rounded-2xl p-4">
      <p className="text-[10px] tracking-wider text-zinc-500 mb-2">{label}</p>
      <p className="text-3xl font-bold text-white">{value}</p>
      <p className="text-xs text-accent mt-1">{sub}</p>
    </div>
  );
}
