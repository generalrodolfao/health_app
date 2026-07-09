'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, Button, Badge, PageHeader, EmptyState, Spinner } from '@/components/ui';
import { api, Checkup, CheckupItem } from '@/lib/api';

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

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendente',
  SCHEDULED: 'Agendado',
  COMPLETED: 'Concluído',
  SKIPPED: 'Ignorado',
};

export default function CheckupsPage() {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [year] = useState(new Date().getFullYear());
  const [checkups, setCheckups] = useState<Checkup[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const loadCheckups = useCallback(async () => {
    try {
      const data = await api.checkups.list();
      setCheckups(data);
    } catch { setCheckups([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadCheckups(); }, [loadCheckups]);

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
      await api.checkups.create({ year, targetDate: `${year}-12-31`, items });
      await loadCheckups();
      setSelectedItems(new Set());
      setShowCreateForm(false);
    } catch (e: any) {
      setError(e.message || 'Erro ao criar checkup');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleComplete = async (item: CheckupItem) => {
    setUpdatingItemId(item.id);
    try {
      const newStatus = item.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
      await api.checkups.updateItem(item.id, {
        status: newStatus,
        ...(newStatus === 'COMPLETED' ? {} : {}),
      });
      await loadCheckups();
    } catch (e: any) {
      setError(e.message || 'Erro ao atualizar exame');
    } finally {
      setUpdatingItemId(null);
    }
  };

  const currentYearCheckup = checkups.find((c) => c.year === year);
  const otherCheckups = checkups.filter((c) => c.year !== year);

  return (
    <>
      <PageHeader
        title="Meus Checkups"
        subtitle="Acompanhe seus exames anuais"
      >
        {currentYearCheckup && !showCreateForm && (
          <Button size="sm" variant="secondary" onClick={() => setShowCreateForm(true)}>+ Novo para outro ano</Button>
        )}
      </PageHeader>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner className="h-8 w-8 text-primary-600" /></div>
      ) : (
        <>
          {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}

          {/* Checkup do ano atual */}
          {currentYearCheckup && !showCreateForm ? (
            <Card>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Checkup {currentYearCheckup.year}</h2>
                  <p className="text-sm text-gray-500">
                    {currentYearCheckup.completedItems}/{currentYearCheckup.totalItems} exames concluídos
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32">
                    <div className="h-2 rounded-full bg-gray-100">
                      <div className="h-2 rounded-full bg-primary-600 transition-all" style={{ width: `${currentYearCheckup.progress}%` }} />
                    </div>
                  </div>
                  <Badge color={currentYearCheckup.status === 'COMPLETED' ? 'green' : 'amber'}>
                    {currentYearCheckup.status === 'COMPLETED' ? 'Completo' : 'Em andamento'}
                  </Badge>
                </div>
              </div>

              {/* Items agrupados por categoria */}
              <div className="space-y-4">
                {Object.entries(
                  currentYearCheckup.items.reduce<Record<string, CheckupItem[]>>((acc, item) => {
                    (acc[item.category] = acc[item.category] || []).push(item);
                    return acc;
                  }, {}),
                ).map(([category, items]) => (
                  <div key={category}>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">{category}</h3>
                    <div className="space-y-2">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3"
                        >
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleToggleComplete(item)}
                              disabled={updatingItemId === item.id}
                              className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors ${
                                item.status === 'COMPLETED'
                                  ? 'border-green-500 bg-green-500 text-white'
                                  : 'border-gray-300 hover:border-primary-500'
                              }`}
                              aria-label="Alternar conclusão"
                            >
                              {item.status === 'COMPLETED' && '✓'}
                              {updatingItemId === item.id && <Spinner className="h-3 w-3" />}
                            </button>
                            <div>
                              <p className={`text-sm font-medium ${item.status === 'COMPLETED' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                                {item.examType}
                              </p>
                              <p className="text-xs text-gray-500">{item.professionalType}</p>
                            </div>
                          </div>
                          <Badge color={item.status === 'COMPLETED' ? 'green' : item.status === 'SCHEDULED' ? 'blue' : 'gray'}>
                            {STATUS_LABELS[item.status] || item.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            /* Formulário de criação */
            <Card>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">Criar Checkup {year}</h2>
                {showCreateForm && (
                  <Button size="sm" variant="ghost" onClick={() => setShowCreateForm(false)}>Cancelar</Button>
                )}
              </div>

              <div className="space-y-6">
                {Object.entries(EXAMS_BY_CATEGORY).map(([category, exams]) => (
                  <div key={category}>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">{category}</h3>
                    <div className="space-y-2">
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
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between rounded-xl bg-gray-50 p-4">
                <p className="text-sm text-gray-600">{selectedItems.size} exame(s) selecionado(s)</p>
                <Button onClick={handleCreate} disabled={selectedItems.size === 0 || creating}>
                  {creating ? <Spinner className="h-4 w-4" /> : 'Criar Checkup'}
                </Button>
              </div>
            </Card>
          )}

          {/* Checkups de anos anteriores */}
          {otherCheckups.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-4 text-lg font-semibold">Anos Anteriores</h2>
              <div className="space-y-3">
                {otherCheckups.map((c) => (
                  <Card key={c.id} className="flex items-center justify-between !py-4">
                    <div>
                      <p className="font-medium">Checkup {c.year}</p>
                      <p className="text-sm text-gray-500">{c.completedItems}/{c.totalItems} exames</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="hidden w-24 sm:block">
                        <div className="h-2 rounded-full bg-gray-100">
                          <div className="h-2 rounded-full bg-primary-600" style={{ width: `${c.progress}%` }} />
                        </div>
                      </div>
                      <Badge color={c.status === 'COMPLETED' ? 'green' : 'amber'}>
                        {c.status === 'COMPLETED' ? 'Completo' : 'Em andamento'}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {checkups.length === 0 && !loading && (
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