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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg)' }}>

      {/* LEFT — form */}
      <div style={{
        width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '2rem 3rem',
        borderRight: '1px solid var(--border)',
      }}>
        <div style={{ maxWidth: '340px', width: '100%', margin: '0 auto' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Logo />
          </Link>

          <div style={{ marginTop: '2.5rem', marginBottom: '2rem' }}>
            <p style={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: '0.5rem' }}>
              SIGN IN
            </p>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: '0.375rem' }}>
              Welcome back
            </h1>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-2)' }}>
              Sign in to your Splitwise account.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-2)', marginBottom: '0.4rem' }}>
                Email
              </label>
              <input
                type="email" required value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                style={{
                  width: '100%', background: 'var(--bg-subtle)', border: '1px solid var(--border)',
                  borderRadius: '0.625rem', padding: '0.75rem 0.875rem', fontSize: '0.9375rem',
                  color: 'var(--text)', outline: 'none', transition: 'border-color 0.2s ease',
                  boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-2)' }}>Password</label>
                <button type="button" onClick={() => setShow(s => !s)} style={{
                  fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-3)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  transition: 'color 0.2s ease',
                }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
                >
                  {show ? 'HIDE' : 'SHOW'}
                </button>
              </div>
              <input
                type={show ? 'text' : 'password'} required value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="Enter your password"
                style={{
                  width: '100%', background: 'var(--bg-subtle)', border: '1px solid var(--border)',
                  borderRadius: '0.625rem', padding: '0.75rem 0.875rem', fontSize: '0.9375rem',
                  color: 'var(--text)', outline: 'none', transition: 'border-color 0.2s ease',
                  boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', background: 'var(--accent)', color: 'white',
              border: 'none', borderRadius: '0.625rem', padding: '0.875rem',
              fontSize: '0.9375rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1, display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '0.5rem',
              transition: 'opacity 0.2s ease',
            }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.88'; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.opacity = '1'; }}
            >
              {loading ? 'Signing in...' : <><span>Sign in</span><ArrowRight size={17} /></>}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-2)', marginTop: '1.75rem' }}>
            New here?{' '}
            <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>

      {/* RIGHT — dark panel with mockup */}
      <div className="hidden lg:flex" style={{
        flex: 1, position: 'relative', background: '#0a0a0a',
        overflow: 'hidden', alignItems: 'center', justifyContent: 'center', padding: '3rem',
      }}>
        <div className="grid-texture" style={{ position: 'absolute', inset: 0, opacity: 0.6 }} />
        <div style={{
          position: 'absolute', top: 0, right: 0,
          width: '400px', height: '400px',
          background: 'rgba(99,102,241,0.12)', borderRadius: '50%', filter: 'blur(100px)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
            {[['GROUPS', '3', '↑ 1 this month'], ['EXPENSES', '48', 'across all groups']].map(([label, value, sub]) => (
              <div key={label} style={{
                background: '#111', border: '1px solid #222',
                borderRadius: '0.875rem', padding: '1rem',
              }}>
                <p style={{ fontSize: '0.625rem', letterSpacing: '0.12em', color: '#555', marginBottom: '0.5rem' }}>{label}</p>
                <p style={{ fontSize: '1.75rem', fontWeight: 700, color: 'white', letterSpacing: '-0.02em' }}>{value}</p>
                <p style={{ fontSize: '0.6875rem', color: '#818cf8', marginTop: '0.25rem' }}>{sub}</p>
              </div>
            ))}
          </div>

          {/* Balance card */}
          <div style={{ background: '#111', border: '1px solid #222', borderRadius: '0.875rem', padding: '1.125rem', marginBottom: '0.75rem' }}>
            <p style={{ fontSize: '0.625rem', letterSpacing: '0.12em', color: '#555', marginBottom: '0.875rem' }}>GOA TRIP · BALANCES</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[['Aisha', '+₹2,340', true], ['Rohan', '−₹1,180', false], ['Dev', '−₹2,050', false]].map(([n, a, pos]) => (
                <div key={n} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '50%',
                      background: '#222', color: '#aaa',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.6875rem', fontWeight: 700,
                    }}>{n[0]}</div>
                    <span style={{ fontSize: '0.875rem', color: '#ccc' }}>{n}</span>
                  </div>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: pos ? '#818cf8' : '#f87171' }}>{a}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Settle up */}
          <div style={{
            background: 'rgba(129,140,248,0.06)', border: '1px solid rgba(129,140,248,0.2)',
            borderRadius: '0.875rem', padding: '0.875rem 1.125rem',
          }}>
            <p style={{ fontSize: '0.625rem', letterSpacing: '0.12em', color: 'rgba(129,140,248,0.7)', marginBottom: '0.25rem' }}>SETTLE UP</p>
            <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'white' }}>
              Rohan pays Aisha <span style={{ color: '#818cf8' }}>₹1,180</span>
            </p>
          </div>

          {/* Caption */}
          <div style={{ marginTop: '2rem' }}>
            <p style={{ fontSize: '0.625rem', fontWeight: 600, letterSpacing: '0.15em', color: 'rgba(129,140,248,0.6)', marginBottom: '0.5rem' }}>
              WELCOME TO SPLITWISE
            </p>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'white', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
              Your balances,<br />
              <span style={{ color: '#444' }}>always in view.</span>
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}
