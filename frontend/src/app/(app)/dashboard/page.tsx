'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, Button, Badge, LoadingCard, EmptyState, PageHeader } from '@/components/ui';
import { api } from '@/lib/api';

interface Checkup {
  id: string;
  year: number;
  status: string;
  items: { id: string; status: string; examType: string }[];
}

export default function DashboardPage() {
  const [checkups, setCheckups] = useState<Checkup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.checkups.list('').then(setCheckups).catch(() => setError(true)).finally(() => setLoading(false));
  }, []);

  const currentCheckup = checkups.find((c) => c.status !== 'COMPLETED');
  const completedCheckups = checkups.filter((c) => c.status === 'COMPLETED');
  const currentProgress = currentCheckup
    ? Math.round((currentCheckup.items.filter((i) => i.status === 'COMPLETED').length / currentCheckup.items.length) * 100) || 0
    : 0;

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Bem-vinda, Maria!" />

      {loading ? (
        <div className="grid gap-6 md:grid-cols-3">
          <LoadingCard /><LoadingCard /><LoadingCard />
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <p className="text-sm font-medium text-gray-600">Checkup {new Date().getFullYear()}</p>
              <p className="mt-2 text-3xl font-bold text-primary-600">{currentProgress}%</p>
              <div className="mt-3 h-2 w-full rounded-full bg-gray-100">
                <div className="h-2 rounded-full bg-primary-600 transition-all" style={{ width: `${currentProgress}%` }} />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                {currentCheckup ? `${currentCheckup.items.filter((i) => i.status === 'COMPLETED').length}/${currentCheckup.items.length} exames` : 'Nenhum checkup ativo'}
              </p>
            </Card>

            <Card>
              <p className="text-sm font-medium text-gray-600">Checkups Concluídos</p>
              <p className="mt-2 text-3xl font-bold text-green-600">{completedCheckups.length}</p>
              <p className="mt-1 text-xs text-gray-500">Total de anos</p>
            </Card>

            <Card>
              <p className="text-sm font-medium text-gray-600">Próximo Exame</p>
              <p className="mt-2 text-xl font-bold text-amber-600">
                {currentCheckup?.items.find((i) => i.status !== 'COMPLETED')?.examType || 'Tudo em dia!'}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {currentCheckup?.items.find((i) => i.status !== 'COMPLETED') ? 'Pendente' : 'Nenhum exame pendente'}
              </p>
            </Card>
          </div>

          <div className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Histórico de Checkups</h2>
              <Link href="/checkups"><Button size="sm">Gerenciar</Button></Link>
            </div>

            {checkups.length === 0 && !error ? (
              <EmptyState
                icon="📋"
                title="Nenhum checkup criado ainda"
                description="Crie seu primeiro checkup anual para começar a acompanhar seus exames."
                action={<Link href="/checkups"><Button>Criar Checkup</Button></Link>}
              />
            ) : (
              <div className="space-y-3">
                {checkups.map((c) => {
                  const progress = c.items.length > 0
                    ? Math.round((c.items.filter((i) => i.status === 'COMPLETED').length / c.items.length) * 100)
                    : 0;
                  return (
                    <Card key={c.id} className="flex items-center justify-between !py-4">
                      <div>
                        <p className="font-medium">Checkup {c.year}</p>
                        <p className="text-sm text-gray-500">
                          {c.items.filter((i) => i.status === 'COMPLETED').length}/{c.items.length} exames
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="hidden w-24 sm:block">
                          <div className="h-2 rounded-full bg-gray-100">
                            <div className="h-2 rounded-full bg-primary-600" style={{ width: `${progress}%` }} />
                          </div>
                        </div>
                        <Badge color={c.status === 'COMPLETED' ? 'green' : 'amber'}>
                          {c.status === 'COMPLETED' ? 'Completo' : progress > 0 ? 'Em andamento' : 'Pendente'}
                        </Badge>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <Card title="NR-1 Saúde Mental" icon="🧠">
              <p className="text-sm text-gray-600">Avalie seus riscos psicossociais em conformidade com a NR-1.</p>
              <Link href="/nr1" className="mt-4 block"><Button fullWidth size="sm">Fazer Avaliação</Button></Link>
            </Card>
            <Card title="Mapa da Saúde" icon="🗺️">
              <p className="text-sm text-gray-600">Encontre farmácias, hospitais e clínicas próximas de você.</p>
              <Link href="/map" className="mt-4 block"><Button fullWidth size="sm">Ver Mapa</Button></Link>
            </Card>
          </div>
        </>
      )}
    </>
  );
}
