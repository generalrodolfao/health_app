'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">🏥</span>
            <h1 className="text-xl font-bold text-primary-600">HealthApp</h1>
          </Link>
          <nav className="flex gap-3">
            <Link href="/login" className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary-600">
              Entrar
            </Link>
            <Link href="/dashboard" className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
              Acessar Dashboard
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
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/dashboard" className="rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-700">
                Começar agora
              </Link>
              <Link href="#features" className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50">
                Saiba mais
              </Link>
            </div>
          </div>
        </section>

        <section id="features" className="py-16">
          <div className="mx-auto max-w-6xl px-4">
            <h3 className="text-center text-2xl font-bold">Funcionalidades</h3>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-2xl">📋</div>
                <h4 className="text-lg font-semibold">Checkups Anuais</h4>
                <p className="mt-2 text-sm text-gray-600">
                  Acompanhe todos os exames que precisa fazer no ano: clínico geral, dentista,
                  cardiologista e muito mais. Nunca perca um checkup importante.
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-2xl">🧠</div>
                <h4 className="text-lg font-semibold">NR-1 Saúde Mental</h4>
                <p className="mt-2 text-sm text-gray-600">
                  Compliance com a nova lei NR-1. Avaliações psicossociais, planos de ação e
                  dashboard para RH. Sua empresa protegida.
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 text-2xl">🗺️</div>
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

      <footer className="border-t border-gray-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500">
          <p>HealthApp &copy; {new Date().getFullYear()} - Monitoramento de Saúde</p>
        </div>
      </footer>
    </div>
  );
}
