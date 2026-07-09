'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/checkups', label: 'Meus Checkups', icon: '📋' },
  { href: '/nr1', label: 'NR-1 Saúde Mental', icon: '🧠' },
  { href: '/map', label: 'Mapa da Saúde', icon: '🗺️' },
  { href: '/profile', label: 'Meu Perfil', icon: '👤' },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const navLinks = (
    <nav className="space-y-1">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setMobileOpen(false)}
          className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
            isActive(item.href)
              ? 'bg-primary-50 text-primary-700'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <span className="text-lg">{item.icon}</span>
          {item.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
              aria-label="Menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="text-xl">🏥</span>
              <span className="text-lg font-bold text-primary-600">HealthApp</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-gray-600 sm:block">Maria Silva</span>
            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-sm font-medium text-primary-700">
              MS
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-0 px-0 md:gap-6 md:px-4 md:py-8">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 shrink-0 md:block">
          <div className="sticky top-24">{navLinks}</div>
        </aside>

        {/* Mobile drawer */}
        {mobileOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/30 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] w-64 bg-white p-4 shadow-lg md:hidden">
              {navLinks}
            </aside>
          </>
        )}

        {/* Main content */}
        <main className="flex-1 px-4 py-8 md:px-0 md:py-0">
          {children}
        </main>
      </div>
    </div>
  );
}
