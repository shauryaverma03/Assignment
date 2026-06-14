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

  const inputStyle = {
    width: '100%', background: 'var(--bg-subtle)', border: '1px solid var(--border)',
    borderRadius: '0.625rem', padding: '0.75rem 0.875rem', fontSize: '0.9375rem',
    color: 'var(--text)', outline: 'none', transition: 'border-color 0.2s ease',
    boxSizing: 'border-box',
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
              GET STARTED
            </p>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: '0.375rem' }}>
              Create your account
            </h1>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-2)' }}>
              Free forever. No credit card required.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            {[
              { key: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
              { key: 'username', label: 'Username', type: 'text', placeholder: 'shaurya' },
              { key: 'password', label: 'Password', type: 'password', placeholder: 'Min 8 characters' },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-2)', marginBottom: '0.4rem' }}>
                  {label}
                </label>
                <input
                  type={type} required value={form[key]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  placeholder={placeholder}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
            ))}

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
              {loading ? 'Creating account...' : <><span>Create account</span><ArrowRight size={17} /></>}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-2)', marginTop: '1.75rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* RIGHT — dark panel with feature list */}
      <div className="hidden lg:flex" style={{
        flex: 1, position: 'relative', background: '#0a0a0a',
        overflow: 'hidden', alignItems: 'center', justifyContent: 'center', padding: '3rem',
      }}>
        <div className="grid-texture" style={{ position: 'absolute', inset: 0, opacity: 0.6 }} />
        <div style={{
          position: 'absolute', bottom: 0, left: 0,
          width: '400px', height: '400px',
          background: 'rgba(99,102,241,0.1)', borderRadius: '50%', filter: 'blur(100px)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', maxWidth: '380px', width: '100%' }}>
          <h2 style={{
            fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 700, color: 'white',
            lineHeight: 1.2, letterSpacing: '-0.02em', marginBottom: '1rem',
          }}>
            Start splitting<br />
            <span style={{ color: '#444' }}>in 30 seconds.</span>
          </h2>
          <p style={{ fontSize: '0.9375rem', color: '#666', marginBottom: '2rem', lineHeight: 1.6 }}>
            Create a group, add expenses, and see exactly who owes what — instantly.
          </p>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {[
              'Equal, exact, % and share-based splits',
              'USD → INR auto conversion',
              'CSV import with anomaly detection',
              'Min-cash-flow debt settlement',
            ].map(feature => (
              <li key={feature} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{
                  width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                  background: 'rgba(129,140,248,0.12)', border: '1px solid rgba(129,140,248,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8',
                }}>
                  <Check size={12} />
                </span>
                <span style={{ fontSize: '0.875rem', color: '#aaa' }}>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
