'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Badge, PageHeader, EmptyState, Spinner } from '@/components/ui';
import { api } from '@/lib/api';

const EXAMS_BY_CATEGORY: Record<string, { exam: string; professional: string }[]> = {
  Rotina: [
    { exam: 'Hemograma Completo', professional: 'Laboratório' },
    { exam: 'Exame de Urina', professional: 'Laboratório' },
    { exam: 'Exame de Fezes', professional: 'Laboratório' },
  ],
  Cardiovascular: [
    { exam: 'Eletrocardiograma', professional: 'Cardiologista' },
    { exam: 'Ecocardiograma', professional: 'Cardiologista' },
  ],
  Dental: [
    { exam: 'Limpeza e Avaliação', professional: 'Dentista' },
    { exam: 'Raio-X Panorâmico', professional: 'Dentista' },
  ],
  Visão: [
    { exam: 'Fundo de Olho', professional: 'Oftalmologista' },
    { exam: 'Tonometria', professional: 'Oftalmologista' },
  ],
  Preventivo: [
    { exam: 'Papanicolau', professional: 'Ginecologista' },
    { exam: 'PSA', professional: 'Urologista' },
    { exam: 'Mamografia', professional: 'Ginecologista' },
  ],
  Mental: [
    { exam: 'Avaliação Psicológica', professional: 'Psicólogo' },
    { exam: 'Triagem de Ansiedade', professional: 'Psicólogo' },
  ],
};

interface Checkup {
  id: string;
  year: number;
  status: string;
  items: { id: string; examType: string; professionalType: string; category: string; status: string }[];
}

export default function CheckupsPage() {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [year] = useState(new Date().getFullYear());
  const [checkups, setCheckups] = useState<Checkup[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.checkups.list('').then(setCheckups).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const toggleItem = (key: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const handleCreate = async () => {
    if (selectedItems.size === 0) return;
    setCreating(true);
    setError('');
    try {
      const items = Array.from(selectedItems).map((key) => {
        const [category, exam] = key.split('|');
        const examData = EXAMS_BY_CATEGORY[category].find((e) => e.exam === exam)!;
        return { examType: exam, professionalType: examData.professional, category };
      });
      await api.checkups.create('', { year, targetDate: `${year}-12-31`, items });
      const updated = await api.checkups.list('');
      setCheckups(updated);
      setSelectedItems(new Set());
    } catch (e: any) {
      setError(e.message || 'Erro ao criar checkup');
    } finally {
      setCreating(false);
    }
  };

  const existingForYear = checkups.find((c) => c.year === year);

  return (
    <>
      <PageHeader
        title="Meus Checkups"
        subtitle={existingForYear ? `Você já tem um checkup para ${year}` : `Selecione os exames para ${year}`}
      />

      {loading ? (
        <div className="flex justify-center py-12"><Spinner className="h-8 w-8 text-primary-600" /></div>
      ) : (
        <>
          {existingForYear && (
            <Card className="mb-6 border-primary-200 bg-primary-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-primary-900">Checkup {existingForYear.year}</p>
                  <p className="text-sm text-primary-700">
                    {existingForYear.items.filter((i) => i.status === 'COMPLETED').length}/{existingForYear.items.length} exames concluídos
                  </p>
                </div>
                <Badge color={existingForYear.status === 'COMPLETED' ? 'green' : 'amber'}>
                  {existingForYear.status === 'COMPLETED' ? 'Completo' : 'Em andamento'}
                </Badge>
              </div>
              <div className="mt-3 space-y-2">
                {existingForYear.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-lg bg-white/60 px-3 py-2">
                    <div>
                      <span className="text-sm font-medium">{item.examType}</span>
                      <span className="ml-2 text-xs text-gray-500">{item.professionalType}</span>
                    </div>
                    <Badge color={item.status === 'COMPLETED' ? 'green' : 'gray'}>
                      {item.status === 'COMPLETED' ? '✓ Concluído' : 'Pendente'}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {!existingForYear && (
            <>
              <div className="space-y-6">
                {Object.entries(EXAMS_BY_CATEGORY).map(([category, exams]) => (
                  <Card key={category} title={category}>
                    <div className="space-y-3">
                      {exams.map((item) => {
                        const key = `${category}|${item.exam}`;
                        const selected = selectedItems.has(key);
                        return (
                          <label
                            key={key}
                            className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                              selected ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() => toggleItem(key)}
                              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <div>
                              <p className="text-sm font-medium">{item.exam}</p>
                              <p className="text-xs text-gray-500">{item.professional}</p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </Card>
                ))}
              </div>

              {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}

              <div className="mt-8 flex items-center justify-between rounded-xl border bg-white p-4 shadow-sm">
                <p className="text-sm text-gray-600">{selectedItems.size} exame(s) selecionado(s)</p>
                <Button onClick={handleCreate} disabled={selectedItems.size === 0 || creating}>
                  {creating ? <Spinner className="h-4 w-4" /> : `Criar Checkup ${year}`}
                </Button>
              </div>
            </>
          )}

          {checkups.length === 0 && !loading && !existingForYear && (
            <div className="mt-8">
              <EmptyState
                icon="📋"
                title="Nenhum checkup criado"
                description="Selecione os exames acima e crie seu primeiro checkup anual."
              />
            </div>
          )}
        </>
      )}
    </>
  );
}
