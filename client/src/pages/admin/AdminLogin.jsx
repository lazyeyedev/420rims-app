import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const schema = yup.object({
  email:    yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().required('Password is required'),
});

const s = {
  page: {
    minHeight: '100vh', background: '#0a0a0a', display: 'flex',
    alignItems: 'center', justifyContent: 'center', padding: '1.5rem',
  },
  card: {
    width: '100%', maxWidth: 420, background: '#111',
    border: '1px solid #1e1e1e', borderRadius: 12,
    padding: '2.5rem 2rem', boxShadow: '0 8px 48px rgba(0,0,0,0.8)',
  },
  logo:     { textAlign: 'center', marginBottom: '2rem' },
  logoText: { fontSize: '1.6rem', fontWeight: 900, letterSpacing: 3, color: '#c9a84c' },
  logoSub:  { color: '#444', fontSize: '0.75rem', marginTop: 4, letterSpacing: 2,
    textTransform: 'uppercase', fontWeight: 600 },
  divider:  { width: 32, height: 2, background: '#c9a84c33', margin: '1rem auto 0' },
  title:    { color: '#888', fontSize: '0.82rem', fontWeight: 600, marginBottom: '1.75rem',
    textAlign: 'center', textTransform: 'uppercase', letterSpacing: 1 },
  group:    { marginBottom: '1.2rem' },
  label:    { display: 'block', color: '#555', fontSize: '0.75rem', marginBottom: 6,
    fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputWrap: { position: 'relative' },
  input: {
    width: '100%', background: '#0d0d0d', border: '1px solid #1e1e1e',
    borderRadius: 6, padding: '0.75rem 1rem', color: '#f0f0f0',
    fontSize: '0.92rem', outline: 'none', boxSizing: 'border-box',
  },
  inputPw: {
    width: '100%', background: '#0d0d0d', border: '1px solid #1e1e1e',
    borderRadius: 6, padding: '0.75rem 3rem 0.75rem 1rem', color: '#f0f0f0',
    fontSize: '0.92rem', outline: 'none', boxSizing: 'border-box',
  },
  toggle: {
    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', color: '#444', fontSize: '0.72rem',
    cursor: 'pointer', padding: 0, letterSpacing: 0.5,
  },
  error: { color: '#e05252', fontSize: '0.76rem', marginTop: 4 },
  btn: {
    width: '100%', background: '#c9a84c', color: '#0a0a0a', border: 'none',
    borderRadius: 6, padding: '0.85rem', fontWeight: 800, fontSize: '0.92rem',
    marginTop: '0.5rem', cursor: 'pointer', letterSpacing: 0.5,
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  back: { textAlign: 'center', marginTop: '1.75rem' },
  backLink: { color: '#333', fontSize: '0.8rem', textDecoration: 'none' },
};

const focusStyle = `
  input:focus { border-color: #c9a84c !important; box-shadow: 0 0 0 2px rgba(201,168,76,0.1); }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

const Spinner = () => (
  <span style={{ width: 15, height: 15, border: '2px solid #0a0a0a44',
    borderTop: '2px solid #0a0a0a', borderRadius: '50%',
    display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
);

export default function AdminLogin() {
  const [showPw, setShowPw] = useState(false);
  const { login, logout } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async ({ email, password }) => {
    try {
      const user = await login(email, password);
      if (user.role !== 'admin') {
        await logout();
        toast.error('Access denied — admin credentials required');
        return;
      }
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div style={s.page}>
      <style>{focusStyle}</style>
      <div style={s.card}>
        <div style={s.logo}>
          <div style={s.logoText}>420RIMS</div>
          <div style={s.logoSub}>Admin Panel</div>
          <div style={s.divider} />
        </div>

        <div style={s.title}>Restricted Access</div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div style={s.group}>
            <label style={s.label}>Email</label>
            <input {...register('email')} type="email" placeholder="admin@420rims.com"
              style={s.input} autoComplete="username" />
            {errors.email && <div style={s.error}>{errors.email.message}</div>}
          </div>

          <div style={s.group}>
            <label style={s.label}>Password</label>
            <div style={s.inputWrap}>
              <input {...register('password')} type={showPw ? 'text' : 'password'}
                placeholder="••••••••••••" style={s.inputPw} autoComplete="current-password" />
              <button type="button" style={s.toggle} onClick={() => setShowPw(p => !p)}>
                {showPw ? 'HIDE' : 'SHOW'}
              </button>
            </div>
            {errors.password && <div style={s.error}>{errors.password.message}</div>}
          </div>

          <button type="submit"
            style={{ ...s.btn, ...(isSubmitting ? { opacity: 0.6, cursor: 'not-allowed' } : {}) }}
            disabled={isSubmitting}>
            {isSubmitting ? <><Spinner /> Verifying…</> : 'Sign In to Admin Panel'}
          </button>
        </form>

        <div style={s.back}>
          <Link to="/" style={s.backLink}
            onMouseEnter={e => e.target.style.color = '#c9a84c'}
            onMouseLeave={e => e.target.style.color = '#333'}>
            ← Back to site
          </Link>
        </div>
      </div>
    </div>
  );
}
