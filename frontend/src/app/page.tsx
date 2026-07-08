'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <h1 className="text-xl font-bold text-primary-600">HealthApp</h1>
          <nav className="flex gap-4">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-primary-600">
              Entrar
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
            >
              Cadastrar
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="bg-gradient-to-br from-primary-50 to-blue-100 py-20">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Sua saúde em um só lugar
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Checkups anuais, saúde mental ocupacional (NR-1) e mapa de unidades próximas.
              Para você e sua empresa.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link
                href="/register"
                className="rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-700"
              >
                Começar grátis
              </Link>
              <Link
                href="#features"
                className="rounded-lg border bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
              >
                Saiba mais
              </Link>
            </div>
          </div>
        </section>

        <section id="features" className="py-16">
          <div className="mx-auto max-w-6xl px-4">
            <h3 className="text-center text-2xl font-bold">Funcionalidades</h3>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold">Checkups Anuais</h4>
                <p className="mt-2 text-sm text-gray-600">
                  Acompanhe todos os exames que precisa fazer no ano: clínico geral, dentista,
                  cardiologista e muito mais. Nunca perca um checkup importante.
                </p>
              </div>

              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-600">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold">NR-1 Saúde Mental</h4>
                <p className="mt-2 text-sm text-gray-600">
                  Compliance com a nova lei NR-1. Avaliações psicossociais, planos de ação e
                  dashboard para RH. Sua empresa protegida.
                </p>
              </div>

              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold">Mapa da Saúde</h4>
                <p className="mt-2 text-sm text-gray-600">
                  Encontre farmácias, hospitais e clínicas perto de você. Modo emergência
                  para encontrar o hospital mais próximo rapidamente.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500">
          <p>HealthApp &copy; {new Date().getFullYear()} - Monitoramento de Saúde</p>
        </div>
      </footer>
    </div>
  );
}
