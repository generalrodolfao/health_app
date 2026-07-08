'use client';

import Link from 'next/link';

export default function Dashboard() {
  const user = {
    name: 'Maria Silva',
    plan: 'Free',
    checkups: [
      { year: 2025, status: 'COMPLETED', progress: 100 },
      { year: 2026, status: 'IN_PROGRESS', progress: 60 },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <h1 className="text-xl font-bold text-primary-600">HealthApp</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.name}</span>
            <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700">
              {user.plan}
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4 py-8">
        <aside className="hidden w-64 shrink-0 md:block">
          <nav className="space-y-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-lg bg-primary-50 px-4 py-2.5 text-sm font-medium text-primary-700"
            >
              Dashboard
            </Link>
            <Link
              href="/checkups"
              className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Meus Checkups
            </Link>
            <Link
              href="/nr1"
              className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              NR-1 Saúde Mental
            </Link>
            <Link
              href="/map"
              className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Mapa da Saúde
            </Link>
            <Link
              href="/profile"
              className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Meu Perfil
            </Link>
          </nav>
        </aside>

        <main className="flex-1">
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="mt-1 text-sm text-gray-500">Bem-vinda, {user.name}!</p>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-gray-500">Checkup 2026</p>
              <p className="mt-2 text-3xl font-bold text-primary-600">{user.checkups[1].progress}%</p>
              <div className="mt-3 h-2 w-full rounded-full bg-gray-100">
                <div
                  className="h-2 rounded-full bg-primary-600"
                  style={{ width: `${user.checkups[1].progress}%` }}
                />
              </div>
            </div>

            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-gray-500">Checkups Realizados</p>
              <p className="mt-2 text-3xl font-bold text-green-600">{user.checkups.filter((c) => c.status === 'COMPLETED').length}</p>
              <p className="mt-1 text-xs text-gray-400">Total de anos</p>
            </div>

            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-gray-500">Próximo Exame</p>
              <p className="mt-2 text-xl font-bold text-amber-600">Dentista</p>
              <p className="mt-1 text-xs text-gray-400">Em 15 dias</p>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold">Histórico de Checkups</h3>
            <div className="mt-4 space-y-3">
              {user.checkups.map((checkup) => (
                <div
                  key={checkup.year}
                  className="flex items-center justify-between rounded-lg border bg-white p-4"
                >
                  <div>
                    <p className="font-medium">Checkup {checkup.year}</p>
                    <p className="text-sm text-gray-500">
                      {checkup.status === 'COMPLETED' ? 'Completo' : 'Em andamento'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{checkup.progress}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
