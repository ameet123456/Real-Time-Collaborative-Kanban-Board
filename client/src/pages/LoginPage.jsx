import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Layers } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const BG_DOTS = `radial-gradient(circle at 20% 50%, rgba(124,106,247,0.08) 0%, transparent 50%),
  radial-gradient(circle at 80% 20%, rgba(62,207,142,0.06) 0%, transparent 40%),
  radial-gradient(circle at 60% 80%, rgba(245,158,11,0.05) 0%, transparent 40%)`;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Password is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back! 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: `${BG_DOTS}, var(--bg-base)`, padding: '1.5rem',
    }}>
      {/* Decorative orb */}
      <div style={{
        position: 'fixed', top: '-15%', right: '-10%',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,106,247,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        width: '100%', maxWidth: 420,
        animation: 'fadeIn 0.4s ease',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            width: 52, height: 52, borderRadius: 'var(--radius-lg)',
            background: 'var(--accent-dim)', border: '1.5px solid var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem', boxShadow: 'var(--shadow-glow)',
          }}>
            <Layers size={24} color="var(--accent)" />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.8rem', letterSpacing: '-0.02em' }}>
            KanbanFlow
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.4rem', fontSize: '0.9rem' }}>
            Sign in to your workspace
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-xl)',
          padding: '2rem',
          boxShadow: 'var(--shadow-lg)',
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <Input
              label="Email Address"
              type="email"
              placeholder="arjun@example.com"
              icon={Mail}
              value={form.email}
              onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: '' }); }}
              error={errors.email}
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              value={form.password}
              onChange={(e) => { setForm({ ...form, password: e.target.value }); setErrors({ ...errors, password: '' }); }}
              error={errors.password}
              autoComplete="current-password"
            />
            <Button type="submit" loading={loading} fullWidth size="lg" style={{ marginTop: '0.5rem' }}>
              Sign In
            </Button>
          </form>

          <div style={{
            marginTop: '1.5rem', paddingTop: '1.5rem',
            borderTop: '1px solid var(--border)',
            textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)',
          }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--accent-light)', fontWeight: 600 }}>
              Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
