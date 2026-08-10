import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function AdminLogin() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    navigate(location.state?.from?.pathname || '/admin', { replace: true });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(username, password);
      navigate(location.state?.from?.pathname || '/admin', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4 kit-stripes">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-block" aria-label="A2PEX Kits home">
            <img src="/logo-lockup.png" alt="A2PEX Kits" className="mx-auto h-28 w-auto" />
          </Link>
          <p className="mt-1 font-mono text-xs uppercase tracking-widest text-gray-500">
            Admin Dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card-surface space-y-4 p-7 shadow-2xl">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-pitch/15">
            <Lock size={18} className="text-pitch" />
          </div>

          {error && (
            <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-center text-sm text-red-400">
              {error}
            </p>
          )}

          <div>
            <label htmlFor="admin-username" className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-gray-400">
              Username or email
            </label>
            <input
              id="admin-username"
              name="username"
              autoComplete="username"
              required
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field-dark"
              placeholder="Enter your admin username"
            />
          </div>

          <div>
            <label htmlFor="admin-password" className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-gray-400">
              Password
            </label>
            <input
              id="admin-password"
              name="password"
              autoComplete="current-password"
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field-dark"
              placeholder="••••••••"
            />
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center font-mono text-xs text-gray-500">
          No account yet? Run <code className="text-gray-300">npm run create-admin</code> from{' '}
          <code className="text-gray-300">/server</code>.
        </p>
      </div>
    </div>
  );
}
