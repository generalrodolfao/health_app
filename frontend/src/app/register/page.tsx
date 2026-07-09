'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Spinner } from '@/components/ui';

export default function RegisterPage() {
  const [name, setName] = useState('');
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
          <p className="mt-2 text-sm text-gray-600">Crie sua conta gratuita</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome completo</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Senha</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
            <p className="mt-1 text-xs text-gray-500">Mínimo de 8 caracteres</p>
          </div>
          <Button type="submit" fullWidth size="lg" disabled={loading}>
            {loading ? <Spinner className="h-5 w-5" /> : 'Criar conta'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Já tem conta?{' '}
          <Link href="/login" className="font-medium text-primary-600 hover:text-primary-500">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
