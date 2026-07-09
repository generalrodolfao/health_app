'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Spinner } from '@/components/ui';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      window.location.href = '/dashboard';
    }, 500);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="text-2xl">🏥</span>
            <span className="text-xl font-bold text-primary-600">HealthApp</span>
          </Link>
          <p className="mt-2 text-sm text-gray-600">Entre com sua conta</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <Button type="submit" fullWidth size="lg" disabled={loading}>
            {loading ? <Spinner className="h-5 w-5" /> : 'Entrar'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Não tem conta?{' '}
          <Link href="/register" className="font-medium text-primary-600 hover:text-primary-500">Cadastre-se</Link>
        </p>
      </div>
    </div>
  );
}
