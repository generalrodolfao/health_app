'use client';

import { useState } from 'react';

interface AssessmentResponse {
  psychologicalDemand: number;
  workControl: number;
  socialSupport: number;
  rewards: number;
  violenceHarassment: number;
}

const QUESTIONS = [
  {
    id: 'psychologicalDemand' as keyof AssessmentResponse,
    label: 'Exigências Psicológicas',
    question: 'Com que frequência você precisa trabalhar muito rápido?',
  },
  {
    id: 'workControl' as keyof AssessmentResponse,
    label: 'Controle sobre o Trabalho',
    question: 'Você tem influência sobre como organizar suas tarefas?',
  },
  {
    id: 'socialSupport' as keyof AssessmentResponse,
    label: 'Apoio Social',
    question: 'Você recebe apoio dos colegas quando precisa?',
  },
  {
    id: 'rewards' as keyof AssessmentResponse,
    label: 'Compensações',
    question: 'Você considera seu reconhecimento profissional adequado?',
  },
  {
    id: 'violenceHarassment' as keyof AssessmentResponse,
    label: 'Violência e Assédio',
    question: 'Você presenciou ou sofreu situações de assédio no trabalho?',
  },
];

const LABELS = ['Muito Baixo', 'Baixo', 'Médio', 'Alto', 'Muito Alto'];

export default function Nr1Page() {
  const [step, setStep] = useState<'assess' | 'done'>('assess');
  const [responses, setResponses] = useState<AssessmentResponse>({
    psychologicalDemand: 0,
    workControl: 0,
    socialSupport: 0,
    rewards: 0,
    violenceHarassment: 0,
  });

  const updateResponse = (key: keyof AssessmentResponse, value: number) => {
    setResponses((prev) => ({ ...prev, [key]: value }));
  };

  const allAnswered = Object.values(responses).every((v) => v > 0);

  const handleSubmit = () => {
    setStep('done');
  };

  if (step === 'done') {
    const avg = Object.values(responses).reduce((a, b) => a + b, 0) / Object.values(responses).length;
    const riskLevel = avg >= 4 ? 'Alto' : avg >= 2.5 ? 'Médio' : 'Baixo';
    const riskColor = riskLevel === 'Alto' ? 'text-red-600 bg-red-50' : riskLevel === 'Médio' ? 'text-amber-600 bg-amber-50' : 'text-green-600 bg-green-50';

    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="rounded-xl border bg-white p-8 text-center shadow-sm">
          <div className="mb-4 text-4xl">✅</div>
          <h1 className="text-2xl font-bold">Avaliação Concluída</h1>
          <p className="mt-2 text-gray-500">Suas respostas foram registradas de forma anônima.</p>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${riskColor}">
            Risco Psicossocial: {riskLevel}
          </div>
          <p className="mt-4 text-xs text-gray-400">
            Resultado agregado. Seu gestor verá apenas dados do grupo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Avaliação NR-1: Saúde Mental</h1>
        <p className="mt-1 text-sm text-gray-500">
          Responda anonimamente para ajudar sua empresa a identificar riscos psicossociais.
        </p>
      </div>

      <div className="space-y-6">
        {QUESTIONS.map((q) => (
          <div key={q.id} className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">
              {q.label}
            </div>
            <p className="text-sm font-medium text-gray-900">{q.question}</p>
            <div className="mt-4">
              <input
                type="range"
                min={1}
                max={5}
                value={responses[q.id]}
                onChange={(e) => updateResponse(q.id, Number(e.target.value))}
                className="w-full accent-primary-600"
              />
              <div className="mt-1 flex justify-between text-xs text-gray-400">
                {LABELS.map((label, i) => (
                  <span key={label} className={responses[q.id] === i + 1 ? 'font-medium text-primary-600' : ''}>
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <button
          onClick={handleSubmit}
          disabled={!allAnswered}
          className="w-full rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {allAnswered ? 'Enviar Avaliação' : 'Responda todas as questões'}
        </button>
        <p className="mt-2 text-center text-xs text-gray-400">
          Suas respostas são anônimas e protegidas pela LGPD
        </p>
      </div>
    </div>
  );
}
