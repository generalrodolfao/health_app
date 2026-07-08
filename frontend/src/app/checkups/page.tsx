'use client';

import { useState } from 'react';

const EXAMS_BY_CATEGORY = {
  Rotina: [
    { exam: 'Hemograma Completo', professional: 'Laboratório' },
    { exam: 'Exame de Urina', professional: 'Laboratório' },
    { exam: 'Exame de Fezes', professional: 'Laboratório' },
  ],
  Cardiovascular: [
    { exam: 'Eletrocardiograma', professional: 'Cardiologista' },
    { exam: 'Ecocardiograma', professional: 'Cardiologista' },
    { exam: 'Holter 24h', professional: 'Cardiologista' },
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

export default function CheckupsPage() {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [year, setYear] = useState(new Date().getFullYear());

  const toggleItem = (key: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Meus Checkups</h1>
        <p className="mt-1 text-sm text-gray-500">
          Selecione os exames que precisa fazer em {year}
        </p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700">Ano do Checkup</label>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="mt-1 rounded-lg border px-3 py-2 text-sm"
        >
          {[2024, 2025, 2026, 2027].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      <div className="space-y-6">
        {Object.entries(EXAMS_BY_CATEGORY).map(([category, exams]) => (
          <div key={category} className="rounded-xl border bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">{category}</h3>
            <div className="space-y-3">
              {exams.map((item) => {
                const key = `${category}-${item.exam}`;
                return (
                  <label
                    key={key}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                      selectedItems.has(key)
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedItems.has(key)}
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

      <div className="mt-8 flex items-center justify-between rounded-xl border bg-white p-4 shadow-sm">
        <p className="text-sm text-gray-600">
          {selectedItems.size} exame(s) selecionado(s)
        </p>
        <button className="rounded-lg bg-primary-600 px-6 py-2 text-sm font-medium text-white hover:bg-primary-700">
          Criar Checkup {year}
        </button>
      </div>
    </div>
  );
}
