import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, LayoutDashboard, LogOut, TrendingUp, Upload, Users, Globe, Zap, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

/* ── Scroll reveal ── */
function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(32px)',
      transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
    }}>
      {children}
    </div>
  );
}

const MARQUEE_ITEMS = ['Flatmates', 'Road Trips', 'Office Lunches', 'Roommates', 'Vacations', 'House Parties', 'Goa Trips', 'Weekend Getaways'];

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', overflowX: 'hidden' }}>

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: scrolled ? 'var(--bg)' : 'transparent',
        borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
        transition: 'background 0.3s ease, border-color 0.3s ease',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Logo />
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }} className="hidden md:flex">
            {[['#features', 'Features'], ['#how', 'How it works']].map(([href, label]) => (
              <a key={href} href={href} style={{
                fontSize: '0.875rem', color: 'var(--text-2)', textDecoration: 'none',
                transition: 'color 0.2s ease',
              }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-2)'}
              >{label}</a>
            ))}
          </div>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link to="/dashboard" style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                fontSize: '0.875rem', fontWeight: 600, color: 'white',
                background: 'var(--accent)', padding: '0.45rem 1rem',
                borderRadius: '9999px', textDecoration: 'none',
                transition: 'opacity 0.2s ease',
              }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                <LayoutDashboard size={13} /> Dashboard
              </Link>
              <button onClick={handleLogout} style={{
                padding: '0.45rem', background: 'none', border: 'none',
                color: 'var(--text-3)', cursor: 'pointer', borderRadius: '8px',
                transition: 'color 0.2s ease',
              }}
                onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link to="/login" style={{
                fontSize: '0.875rem', color: 'var(--text-2)', textDecoration: 'none',
                padding: '0.45rem 0.75rem', transition: 'color 0.2s ease',
              }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-2)'}
              >Sign in</Link>
              <Link to="/register" style={{
                fontSize: '0.875rem', fontWeight: 600, color: 'white',
                background: 'var(--accent)', padding: '0.45rem 1rem',
                borderRadius: '9999px', textDecoration: 'none',
                transition: 'opacity 0.2s ease',
              }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >Get started</Link>
            </div>
          )}
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: '56px', background: 'var(--bg)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '5rem 1.5rem 4rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }} className="hero-grid">
          {/* LEFT */}
          <div>
            {/* Eyebrow pill */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: 'var(--accent-subtle)', color: 'var(--accent)',
              borderRadius: '9999px', padding: '0.35rem 0.875rem',
              fontSize: '0.75rem', fontWeight: 600, marginBottom: '1.5rem',
              border: '1px solid var(--accent)',
              opacity: 0.9,
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
              Shared expenses, settled fairly
            </div>

            <h1 style={{
              fontSize: 'clamp(2.5rem, 5vw, 3.25rem)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              marginBottom: '1.25rem',
              color: 'var(--text)',
            }}>
              Split expenses,<br />not friendships.
            </h1>

            <p style={{
              fontSize: '1.0625rem', color: 'var(--text-2)', lineHeight: 1.65,
              maxWidth: '440px', marginBottom: '2rem',
            }}>
              Track shared spending, convert currencies, import spreadsheets, and settle debts — all in one clean interface.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link to={user ? '/dashboard' : '/register'} style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: 'var(--accent)', color: 'white', fontWeight: 600,
                padding: '0.75rem 1.5rem', borderRadius: '0.75rem',
                textDecoration: 'none', fontSize: '0.9375rem',
                transition: 'opacity 0.2s ease, transform 0.2s ease',
                boxShadow: '0 2px 8px rgba(99,102,241,0.25)',
              }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                {user ? 'Open Dashboard' : 'Get started free'} <ArrowRight size={16} />
              </Link>
              <a href="#features" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: 'var(--bg-muted)', color: 'var(--text-2)', fontWeight: 500,
                padding: '0.75rem 1.5rem', borderRadius: '0.75rem',
                textDecoration: 'none', fontSize: '0.9375rem',
                border: '1px solid var(--border)',
                transition: 'color 0.2s ease, border-color 0.2s ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                See features
              </a>
            </div>

            {/* Mini stats */}
            <div style={{ display: 'flex', gap: '2rem', marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
              {[['4+', 'Split types'], ['Zero', 'Data sold'], ['Free', 'Forever']].map(([n, l]) => (
                <div key={l}>
                  <div style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>{n}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: '0.2rem' }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — app mockup with subtle 3D tilt (static, not animated) */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{
              width: '100%', maxWidth: '400px',
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '1.25rem',
              boxShadow: 'var(--shadow-xl)',
              overflow: 'hidden',
              transform: 'perspective(1000px) rotateX(4deg) rotateY(-6deg)',
            }}>
              {/* Window bar */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.375rem',
                padding: '0.75rem 1.125rem',
                borderBottom: '1px solid var(--border)',
                background: 'var(--bg-subtle)',
              }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', opacity: 0.8 }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b', opacity: 0.8 }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e', opacity: 0.8 }} />
                <span style={{ marginLeft: '0.625rem', fontSize: '0.6875rem', color: 'var(--text-3)' }}>Goa Trip 2024 · Balances</span>
              </div>
              <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  { i: 'A', n: 'Aisha', a: '+₹4,250', pos: true },
                  { i: 'R', n: 'Rohan', a: '−₹1,180', pos: false },
                  { i: 'P', n: 'Priya', a: '+₹890', pos: true },
                  { i: 'D', n: 'Dev', a: '−₹3,960', pos: false },
                ].map(({ i, n, a, pos }) => (
                  <div key={n} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: 'var(--bg-subtle)', borderRadius: '0.625rem',
                    padding: '0.625rem 0.875rem',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <div style={{
                        width: '30px', height: '30px', borderRadius: '50%',
                        background: 'var(--accent)', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', color: 'white', fontSize: '0.6875rem', fontWeight: 700,
                        opacity: pos ? 1 : 0.5,
                      }}>{i}</div>
                      <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text)' }}>{n}</span>
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: pos ? '#22c55e' : '#ef4444' }}>{a}</span>
                  </div>
                ))}
              </div>
              <div style={{ padding: '0 1rem 1rem' }}>
                <div style={{
                  background: 'var(--accent-subtle)', borderRadius: '0.625rem',
                  padding: '0.75rem', border: '1px solid var(--border)',
                }}>
                  <p style={{ fontSize: '0.6875rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
                    Settle in 2 payments
                  </p>
                  {[['Rohan → Aisha', '₹1,180'], ['Dev → Aisha', '₹3,070']].map(([t, a]) => (
                    <div key={t} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-2)' }}>{t}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)' }}>{a}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <div className="float-badge" style={{
              position: 'absolute', top: '-1.25rem', right: '-1rem',
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: '0.875rem', padding: '0.625rem 0.875rem',
              boxShadow: 'var(--shadow-lg)',
            }}>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-3)', marginBottom: '0.2rem' }}>USD → INR</div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text)' }}>
                $50 = <span style={{ color: 'var(--accent)' }}>₹4,755</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile single-column fallback */}
        <style>{`
          @media (max-width: 768px) {
            .hero-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
            .hero-grid > div:last-child { display: none !important; }
          }
        `}</style>
      </section>

      {/* ── MARQUEE ── */}
      <div style={{
        borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
        background: 'var(--bg-subtle)', padding: '0.875rem 0', overflow: 'hidden',
      }}>
        <div className="animate-marquee" style={{ display: 'flex', gap: '2rem', whiteSpace: 'nowrap' }}>
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((t, i) => (
            <span key={i} style={{
              fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-3)',
              display: 'inline-flex', alignItems: 'center', gap: '2rem',
            }}>
              {t}
              <span style={{ color: 'var(--accent)', opacity: 0.5 }}>◆</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: '6rem 1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
        <Reveal>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '0.75rem' }}>
              Features
            </p>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)', lineHeight: 1.15 }}>
              Everything in one place.
            </h2>
            <p style={{ fontSize: '1.0625rem', color: 'var(--text-2)', maxWidth: '480px', margin: '0.875rem auto 0', lineHeight: 1.6 }}>
              Purpose-built for groups. No spreadsheets, no awkward reminders.
            </p>
          </div>
        </Reveal>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {[
            {
              Icon: TrendingUp, color: '#6366f1', bg: 'rgba(99,102,241,0.08)',
              title: 'Smart Balances',
              desc: 'Min-cash-flow algorithm collapses dozens of debts into the fewest possible payments. Click any member for a full breakdown.',
            },
            {
              Icon: Globe, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',
              title: 'Multi-currency',
              desc: 'USD, INR — auto-converted at the real exchange rate. Original and converted amounts stored for a full audit trail.',
            },
            {
              Icon: Users, color: '#3b82f6', bg: 'rgba(59,130,246,0.08)',
              title: 'Time-aware Members',
              desc: 'Members who left before an expense are excluded automatically. Join and leave dates on every membership.',
            },
            {
              Icon: Upload, color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)',
              title: 'CSV Import',
              desc: '12 anomaly detectors catch duplicates, bad dates, and refunds — all surfaced for review before import.',
            },
            {
              Icon: Zap, color: '#ec4899', bg: 'rgba(236,72,153,0.08)',
              title: 'All Split Types',
              desc: 'Equal, exact amounts, percentage, or custom shares — pick the right split for every expense.',
            },
            {
              Icon: Shield, color: '#22c55e', bg: 'rgba(34,197,94,0.08)',
              title: 'Full Audit Trail',
              desc: 'Every import decision logged. Every anomaly surfaced. Nothing changes without a record you can review.',
            },
          ].map(({ Icon, color, bg, title, desc }, i) => (
            <Reveal key={title} delay={i * 0.05}>
              <div style={{
                background: 'var(--card)', border: '1px solid var(--border)',
                borderRadius: '1rem', padding: '1.5rem',
                boxShadow: 'var(--shadow)',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                cursor: 'default',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
              >
                <div style={{
                  width: '40px', height: '40px', borderRadius: '0.625rem',
                  background: bg, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', marginBottom: '1rem',
                }}>
                  <Icon size={19} style={{ color }} />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.5rem', letterSpacing: '-0.01em' }}>
                  {title}
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-2)', lineHeight: 1.6, margin: 0 }}>
                  {desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" style={{
        padding: '5rem 1.5rem',
        background: 'var(--bg-subtle)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '0.75rem' }}>
                How it works
              </p>
              <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)', lineHeight: 1.15 }}>
                Three steps. Zero confusion.
              </h2>
            </div>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {[
              { n: '01', title: 'Create a group', desc: 'Add members with real join and leave dates. Time-aware expense splitting from day one.' },
              { n: '02', title: 'Log expenses', desc: 'Any split type, any currency. INR or USD — auto-converted at the right rate.' },
              { n: '03', title: 'Settle up', desc: 'Min-cash-flow gives you the fewest payments needed. Record them and you\'re done.' },
            ].map(({ n, title, desc }, i) => (
              <Reveal key={n} delay={i * 0.1}>
                <div style={{
                  background: 'var(--card)', border: '1px solid var(--border)',
                  borderRadius: '1rem', padding: '1.75rem',
                  boxShadow: 'var(--shadow)',
                }}>
                  <div style={{
                    fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)',
                    letterSpacing: '0.08em', marginBottom: '0.875rem',
                    fontVariantNumeric: 'tabular-nums',
                  }}>{n}</div>
                  <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.5rem', letterSpacing: '-0.01em' }}>
                    {title}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-2)', lineHeight: 1.6, margin: 0 }}>
                    {desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{ padding: '5rem 1.5rem' }}>
        <Reveal>
          <div style={{
            maxWidth: '700px', margin: '0 auto', textAlign: 'center',
            background: 'var(--bg-subtle)', border: '1px solid var(--border)',
            borderRadius: '1.5rem', padding: '3.5rem 2rem',
            boxShadow: 'var(--shadow)',
          }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '1rem' }}>
              Stop chasing people
            </p>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)', lineHeight: 1.15, marginBottom: '1rem' }}>
              Money sorted.<br />Friendships saved.
            </h2>
            <p style={{ fontSize: '1rem', color: 'var(--text-2)', marginBottom: '2rem', lineHeight: 1.6 }}>
              Free forever. No card. 30-second setup.
            </p>
            <Link to={user ? '/dashboard' : '/register'} style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: 'var(--accent)', color: 'white', fontWeight: 600,
              padding: '0.875rem 2rem', borderRadius: '0.875rem',
              textDecoration: 'none', fontSize: '1rem',
              transition: 'opacity 0.2s ease, transform 0.2s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {user ? 'Go to Dashboard' : 'Start for free'} <ArrowRight size={18} />
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '2.5rem 1.5rem',
      }}>
        <div style={{
          maxWidth: '1100px', margin: '0 auto',
          display: 'flex', flexWrap: 'wrap', gap: '1rem',
          alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Logo size="sm" />
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-3)', margin: 0 }}>
            Node.js · Express · React · PostgreSQL (Neon) · Prisma
          </p>
          <div style={{ display: 'flex', gap: '1.25rem' }}>
            {[['Sign in', '/login'], ['Get started', '/register']].map(([label, to]) => (
              <Link key={to} to={to} style={{
                fontSize: '0.8125rem', color: label === 'Get started' ? 'var(--accent)' : 'var(--text-3)',
                textDecoration: 'none', transition: 'color 0.2s ease',
              }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                onMouseLeave={e => e.currentTarget.style.color = label === 'Get started' ? 'var(--accent)' : 'var(--text-3)'}
              >{label}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
