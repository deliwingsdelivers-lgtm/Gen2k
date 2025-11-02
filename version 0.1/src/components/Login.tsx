import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UtensilsCrossed } from 'lucide-react';

export function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const demoCredentials = [
    { email: 'server@bhairuha.local', password: 'password', role: 'Server' },
    { email: 'kitchen@bhairuha.local', password: 'password', role: 'Kitchen' },
    { email: 'admin@bhairuha.local', password: 'password', role: 'Admin' },
  ];

  const autofillDemo = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="backdrop-blur-lg bg-white/80 rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="flex justify-center mb-8">
            <div className="p-4 bg-gradient-to-br from-emerald-500 to-lime-500 rounded-2xl">
              <UtensilsCrossed className="w-8 h-8 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-semibold text-center text-gray-900 mb-2">
            Bhairuha OMS
          </h1>
          <p className="text-center text-gray-600 mb-8">Order Management System</p>

          <form onSubmit={handleSubmit} className="space-y-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:outline-none transition bg-gray-50 text-gray-900"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:outline-none transition bg-gray-50 text-gray-900"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-lime-500 hover:from-emerald-600 hover:to-lime-600 disabled:opacity-50 text-white font-semibold rounded-xl transition transform hover:scale-105"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="border-t border-gray-200 pt-6">
            <p className="text-sm text-gray-600 font-medium mb-4">Demo Credentials</p>
            <div className="space-y-3">
              {demoCredentials.map((cred) => (
                <button
                  key={cred.email}
                  type="button"
                  onClick={() => autofillDemo(cred.email, cred.password)}
                  className="w-full p-3 text-left bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 rounded-xl border border-gray-200 hover:border-gray-300 transition"
                >
                  <div className="font-medium text-gray-900">{cred.role}</div>
                  <div className="text-xs text-gray-500">{cred.email}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>Premium Real-time Order Management</p>
          <p className="text-gray-400 mt-2">Synchronized across all devices</p>
        </div>
      </div>
    </div>
  );
}
