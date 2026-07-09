'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, Button, Badge, PageHeader, EmptyState, Spinner } from '@/components/ui';
import { api, Checkup, CheckupItem } from '@/lib/api';

const EXAMS_BY_CATEGORY: Record<string, { exam: string; professional: string }[]> = {
  Rotina: [
    { exam: 'Hemograma Completo', professional: 'Laboratório' },
    { exam: 'Glicemia em Jejum', professional: 'Laboratório' },
    { exam: 'Colesterol Total', professional: 'Laboratório' },
  ],
  Cardiovascular: [
    { exam: 'Eletrocardiograma', professional: 'Cardiologista' },
    { exam: 'Ecocardiograma', professional: 'Cardiologista' },
  ],
  Dental: [
    { exam: 'Limpeza Dental', professional: 'Dentista' },
    { exam: 'Raio-X Panorâmico', professional: 'Dentista' },
  ],
  Visão: [
    { exam: 'Fundo de Olho', professional: 'Oftalmologista' },
    { exam: 'Tonometria', professional: 'Oftalmologista' },
  ],
  Prevenção: [
    { exam: 'Papanicolau', professional: 'Ginecologista' },
    { exam: 'PSA', professional: 'Urologista' },
    { exam: 'Mamografia', professional: 'Ginecologista' },
  ],
  'Saúde Mental': [
    { exam: 'Avaliação Psicológica', professional: 'Psicólogo' },
  ],
};

const TEMPLATES = [
  { name: 'Checkup Completo', cats: Object.keys(EXAMS_BY_CATEGORY) },
  { name: 'Básico', cats: ['Rotina', 'Dental'] },
  { name: 'Cardio', cats: ['Cardiovascular', 'Rotina'] },
];

const STATUS_LABELS: Record<string, string> = { PENDING: 'Pendente', SCHEDULED: 'Agendado', COMPLETED: 'Concluído', SKIPPED: 'Ignorado' };

export default function CheckupsPage() {
  const [checkups, setCheckups] = useState<Checkup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [creating, setCreating] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try { setCheckups(await api.checkups.list()); } catch { setCheckups([]); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const toggle = (key: string) => setSelected((p) => { const n = new Set(p); n.has(key) ? n.delete(key) : n.add(key); return n; });

  const applyTemplate = (cats: string[]) => {
    const s = new Set<string>();
    cats.forEach((c) => EXAMS_BY_CATEGORY[c]?.forEach((e) => s.add(`${c}|${e.exam}`)));
    setSelected(s);
  };

  const handleCreate = async () => {
    if (selected.size === 0) return;
    setCreating(true); setError('');
    try {
      const items = Array.from(selected).map((key) => {
        const [cat, exam] = key.split('|');
        const e = EXAMS_BY_CATEGORY[cat].find((x) => x.exam === exam)!;
        return { examType: exam, professionalType: e.professional, category: cat };
      });
      await api.checkups.create({ year, targetDate: `${year}-12-31`, items });
      await load(); setSelected(new Set()); setShowCreate(false);
    } catch (e: any) { setError(e.message); } finally { setCreating(false); }
  };

  const handleToggle = async (item: CheckupItem) => {
    setUpdatingId(item.id); setError('');
    try {
      await api.checkups.updateItem(item.id, { status: item.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED' });
      await load();
    } catch (e: any) { setError(e.message); } finally { setUpdatingId(null); }
  };

  if (loading) return <div className="flex justify-center py-12"><Spinner className="h-8 w-8 text-primary-600" /></div>;

  const current = checkups.find((c) => c.year === year && !showCreate);
  const others = checkups.filter((c) => c.year !== year);

  return (
    <>
      <PageHeader title="Meus Checkups" subtitle="Acompanhe seus exames anuais">
        {!showCreate && <Button size="sm" onClick={() => setShowCreate(true)}>+ Novo Checkup</Button>}
      </PageHeader>

      {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</div>}

      {showCreate ? (
        /* === CREATE FORM === */
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Criar Checkup</h2>
            <Button size="sm" variant="ghost" onClick={() => setShowCreate(false)}>Cancelar</Button>
          </div>

          {/* Year selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">Ano</label>
            <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="mt-1 rounded-lg border px-3 py-2 text-sm">
              {[year, year+1, year+2, year-1, year-2].map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          {/* Templates */}
          <div className="mb-6">
            <p className="mb-2 text-xs font-semibold uppercase text-gray-400">Modelos rápidos</p>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map((t) => <button key={t.name} onClick={() => applyTemplate(t.cats)} className="rounded-full bg-primary-50 px-4 py-1.5 text-sm font-medium text-primary-700 hover:bg-primary-100">{t.name}</button>)}
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-6">
            {Object.entries(EXAMS_BY_CATEGORY).map(([cat, exams]) => (
              <div key={cat}>
                <h3 className="mb-2 text-xs font-semibold uppercase text-gray-400">{cat}</h3>
                <div className="space-y-2">
                  {exams.map((item) => {
                    const key = `${cat}|${item.exam}`;
                    const sel = selected.has(key);
                    return (
                      <label key={key} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${sel ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                        <input type="checkbox" checked={sel} onChange={() => toggle(key)} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                        <div><p className="text-sm font-medium">{item.exam}</p><p className="text-xs text-gray-500">{item.professional}</p></div>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between rounded-xl bg-gray-50 p-4">
            <p className="text-sm text-gray-600">{selected.size} exame(s) selecionado(s)</p>
            <Button onClick={handleCreate} disabled={selected.size === 0 || creating}>{creating ? <Spinner className="h-4 w-4" /> : 'Criar Checkup'}</Button>
          </div>
        </Card>
      ) : current ? (
        /* === VIEW CURRENT === */
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div><h2 className="text-xl font-bold">Checkup {current.year}</h2><p className="text-sm text-gray-500">{current.completedItems}/{current.totalItems} exames</p></div>
            <div className="flex items-center gap-3">
              <div className="w-32"><div className="h-2 rounded-full bg-gray-100"><div className="h-2 rounded-full bg-primary-600 transition-all" style={{ width: `${current.progress}%` }} /></div></div>
              <Badge color={current.status === 'COMPLETED' ? 'green' : 'amber'}>{current.status === 'COMPLETED' ? 'Completo' : 'Em andamento'}</Badge>
            </div>
          </div>
          <div className="space-y-4">
            {Object.entries(current.items.reduce<Record<string, CheckupItem[]>>((a, i) => { (a[i.category] = a[i.category] || []).push(i); return a; }, {})).map(([cat, items]) => (
              <div key={cat}>
                <h3 className="mb-2 text-xs font-semibold uppercase text-gray-400">{cat}</h3>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3">
                      <div className="flex items-center gap-3">
                        <button onClick={() => handleToggle(item)} disabled={updatingId === item.id}
                          className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors ${item.status === 'COMPLETED' ? 'border-green-500 bg-green-500 text-white' : 'border-gray-300 hover:border-primary-500'}`}>
                          {item.status === 'COMPLETED' && '✓'}{updatingId === item.id && <Spinner className="h-3 w-3" />}
                        </button>
                        <div><p className={`text-sm font-medium ${item.status === 'COMPLETED' ? 'text-gray-400 line-through' : ''}`}>{item.examType}</p><p className="text-xs text-gray-500">{item.professionalType}</p></div>
                      </div>
                      <Badge color={item.status === 'COMPLETED' ? 'green' : 'gray'}>{STATUS_LABELS[item.status] || item.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        /* === EMPTY === */
        <EmptyState icon="📋" title="Nenhum checkup para este ano" description="Crie seu checkup anual para começar a acompanhar seus exames."
          action={<Button onClick={() => setShowCreate(true)}>Criar Checkup</Button>} />
      )}

      {/* Anos anteriores */}
      {others.length > 0 && !showCreate && (
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold">Anos Anteriores</h2>
          <div className="space-y-3">
            {others.map((c) => (
              <Card key={c.id} className="flex items-center justify-between !py-4">
                <div><p className="font-medium">Checkup {c.year}</p><p className="text-sm text-gray-500">{c.completedItems}/{c.totalItems} exames</p></div>
                <Badge color={c.status === 'COMPLETED' ? 'green' : 'amber'}>{c.status === 'COMPLETED' ? 'Completo' : 'Em andamento'}</Badge>
              </Card>
            ))}
          </div>
        </div>
      )}
    </>
  );
}