'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, Button, Badge, LoadingCard, EmptyState, PageHeader } from '@/components/ui';
import { api, Checkup, Nr1HistoryItem } from '@/lib/api';

export default function DashboardPage() {
  const [checkups, setCheckups] = useState<Checkup[]>([]);
  const [nr1History, setNr1History] = useState<Nr1HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.all([api.checkups.list(), api.nr1.history()])
      .then(([c, n]) => { setCheckups(c); setNr1History(n); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const current = checkups.find((c) => c.status !== 'COMPLETED');
  const completed = checkups.filter((c) => c.status === 'COMPLETED');
  const nextExam = current?.items.find((i) => i.status !== 'COMPLETED');
  const lastNr1 = nr1History[0];

  if (loading) return <div className="grid gap-6 md:grid-cols-2"><LoadingCard /><LoadingCard /><LoadingCard /><LoadingCard /></div>;
  if (error) return <EmptyState icon="⚠️" title="Não foi possível carregar" description="Verifique sua conexão." action={<Button onClick={() => location.reload()}>Tentar novamente</Button>} />;

  const riskColors: Record<string, 'green'|'amber'|'red'|'gray'> = { LOW: 'green', MEDIUM: 'amber', HIGH: 'red', CRITICAL: 'red' };
  const riskLabels: Record<string, string> = { LOW: 'Baixo', MEDIUM: 'Médio', HIGH: 'Alto', CRITICAL: 'Grave' };

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Bem-vinda, Maria!" />

      {/* KPIs */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Progresso Checkup */}
        <Card>
          <p className="text-sm font-medium text-gray-600">Checkup {new Date().getFullYear()}</p>
          <div className="mt-3 flex items-center gap-3">
            <div className="relative h-16 w-16">
              <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" fill="none" stroke="#e5e7eb" strokeWidth="6" />
                <circle cx="32" cy="32" r="28" fill="none" stroke="#2563eb" strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={`${(current?.progress ?? 0) * 1.76} 176`} />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-primary-600">{current?.progress ?? 0}%</span>
            </div>
            <div>
              <p className="text-xs text-gray-500">{current ? `${current.completedItems}/${current.totalItems} exames` : 'Sem checkup'}</p>
              {current ? <Link href="/checkups" className="text-xs font-medium text-primary-600 hover:underline">Ver detalhes →</Link>
                       : <Link href="/checkups" className="text-xs font-medium text-primary-600 hover:underline">Criar checkup →</Link>}
            </div>
          </div>
        </Card>

        {/* Próximo Exame */}
        <Card>
          <p className="text-sm font-medium text-gray-600">Próximo Exame</p>
          <p className="mt-2 text-lg font-bold text-amber-600">{nextExam?.examType || 'Tudo em dia!'}</p>
          <p className="mt-1 text-xs text-gray-500">{nextExam?.professionalType || 'Nenhum exame pendente'}</p>
        </Card>

        {/* Saúde Mental */}
        <Card>
          <p className="text-sm font-medium text-gray-600">Saúde Mental</p>
          {lastNr1 ? (
            <>
              <div className="mt-2 flex items-center gap-2">
                <Badge color={riskColors[lastNr1.overallRiskLevel] || 'gray'}>{riskLabels[lastNr1.overallRiskLevel] || lastNr1.overallRiskLevel}</Badge>
                <span className="text-xs text-gray-400">{new Date(lastNr1.assessedAt).toLocaleDateString('pt-BR')}</span>
              </div>
              <Link href="/nr1" className="mt-2 block text-xs font-medium text-primary-600 hover:underline">Nova avaliação →</Link>
            </>
          ) : (
            <>
              <p className="mt-2 text-sm text-gray-400">Sem avaliações</p>
              <Link href="/nr1" className="mt-2 block text-xs font-medium text-primary-600 hover:underline">Fazer avaliação →</Link>
            </>
          )}
        </Card>

        {/* Mapa */}
        <Card>
          <p className="text-sm font-medium text-gray-600">Unidade Mais Próxima</p>
          <p className="mt-2 text-sm font-bold text-gray-900">Ver no mapa</p>
          <Link href="/map" className="mt-2 block text-xs font-medium text-primary-600 hover:underline">Abrir mapa →</Link>
        </Card>
      </div>

      {/* Histórico */}
      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Histórico de Checkups</h2>
          <Link href="/checkups"><Button size="sm" variant="secondary">Gerenciar</Button></Link>
        </div>
        {checkups.length === 0 ? (
          <EmptyState icon="📋" title="Nenhum checkup criado" description="Crie seu primeiro checkup anual." action={<Link href="/checkups"><Button>Criar Checkup</Button></Link>} />
        ) : (
          <div className="space-y-3">
            {checkups.map((c) => (
              <Card key={c.id} className="flex items-center justify-between !py-4">
                <div><p className="font-medium">Checkup {c.year}</p><p className="text-sm text-gray-500">{c.completedItems}/{c.totalItems} exames</p></div>
                <div className="flex items-center gap-3">
                  <div className="hidden w-24 sm:block"><div className="h-2 rounded-full bg-gray-100"><div className="h-2 rounded-full bg-primary-600" style={{ width: `${c.progress}%` }} /></div></div>
                  <Badge color={c.status === 'COMPLETED' ? 'green' : c.progress > 0 ? 'amber' : 'gray'}>{c.status === 'COMPLETED' ? 'Completo' : c.progress > 0 ? 'Em andamento' : 'Pendente'}</Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Atalhos */}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card title="NR-1 Saúde Mental" icon="🧠">
          <p className="text-sm text-gray-600">Avalie seus riscos psicossociais (PHQ-9).</p>
          <Link href="/nr1" className="mt-4 block"><Button fullWidth size="sm">Fazer Avaliação</Button></Link>
        </Card>
        <Card title="Mapa da Saúde" icon="🗺️">
          <p className="text-sm text-gray-600">Farmácias, hospitais e clínicas reais perto de você.</p>
          <Link href="/map" className="mt-4 block"><Button fullWidth size="sm">Ver Mapa</Button></Link>
        </Card>
      </div>
    </>
  );
}