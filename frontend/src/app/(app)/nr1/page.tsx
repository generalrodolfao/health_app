'use client';

import { useState } from 'react';
import { Card, Button, Badge, PageHeader, Spinner } from '@/components/ui';
import { api } from '@/lib/api';

interface Question {
  id: keyof Responses;
  label: string;
  question: string;
}

const QUESTIONS: Question[] = [
  { id: 'psychologicalDemand', label: 'Exigências Psicológicas', question: 'Com que frequência você precisa trabalhar muito rápido?' },
  { id: 'workControl', label: 'Controle sobre o Trabalho', question: 'Você tem influência sobre como organizar suas tarefas?' },
  { id: 'socialSupport', label: 'Apoio Social', question: 'Você recebe apoio dos colegas quando precisa?' },
  { id: 'rewards', label: 'Compensações', question: 'Você considera seu reconhecimento profissional adequado?' },
  { id: 'violenceHarassment', label: 'Violência e Assédio', question: 'Você presenciou ou sofreu situações de assédio no trabalho?' },
];

const LABELS = ['Muito Baixo', 'Baixo', 'Médio', 'Alto', 'Muito Alto'];
type Responses = Record<string, number>;

export default function Nr1Page() {
  const [responses, setResponses] = useState<Responses>({
    psychologicalDemand: 1,
    workControl: 1,
    socialSupport: 1,
    rewards: 1,
    violenceHarassment: 1,
  });
  const [step, setStep] = useState<'assess' | 'submitting' | 'done'>('assess');
  const [result, setResult] = useState<{ level: string; color: 'green' | 'amber' | 'red' } | null>(null);

  const updateResponse = (key: string, value: number) => {
    setResponses((prev) => ({ ...prev, [key]: value }));
  };

  const allAnswered = Object.values(responses).every((v) => v >= 1 && v <= 5);
  const answeredCount = Object.values(responses).filter((v) => v >= 1).length;
  const progress = Math.round((answeredCount / QUESTIONS.length) * 100);

  const handleSubmit = async () => {
    setStep('submitting');
    try {
      await api.nr1.submitAssessment({ responses });
      const avg = Object.values(responses).reduce((a, b) => a + b, 0) / Object.values(responses).length;
      const level = avg >= 4 ? 'Alto' : avg >= 2.5 ? 'Médio' : 'Baixo';
      const color = avg >= 4 ? 'red' : avg >= 2.5 ? 'amber' : 'green';
      setResult({ level, color });
      setStep('done');
    } catch {
      setStep('assess');
    }
  };

  if (step === 'done' && result) {
    return (
      <>
        <PageHeader title="Avaliação Concluída" />
        <Card className="text-center">
          <div className="mb-4 text-4xl">✅</div>
          <p className="text-lg font-medium">Suas respostas foram registradas anonimamente.</p>
          <div className="mt-6 inline-block">
            <Badge color={result.color} className="text-sm px-4 py-1.5">
              Risco Psicossocial: {result.level}
            </Badge>
          </div>
          <p className="mt-4 text-xs text-gray-500">Seu gestor verá apenas dados agregados do grupo.</p>
          <Button className="mt-6" variant="secondary" onClick={() => { setStep('assess'); setResult(null); }}>
            Fazer Nova Avaliação
          </Button>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader title="NR-1: Saúde Mental" subtitle="Avaliação de riscos psicossociais — anônima e conforme LGPD" />

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Progresso</span>
          <span>{answeredCount}/{QUESTIONS.length} respondidas</span>
        </div>
        <div className="mt-1 h-2 rounded-full bg-gray-100">
          <div className="h-2 rounded-full bg-primary-600 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="space-y-6">
        {QUESTIONS.map((q, idx) => (
          <Card key={q.id}>
            <div className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">
              {idx + 1}. {q.label}
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
              <div className="mt-1 flex justify-between text-xs">
                {LABELS.map((label, i) => (
                  <span key={label} className={responses[q.id] === i + 1 ? 'font-semibold text-primary-600' : 'text-gray-400'}>
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <Button onClick={handleSubmit} disabled={!allAnswered || step === 'submitting'} fullWidth size="lg">
          {step === 'submitting' ? <Spinner className="h-5 w-5" /> : allAnswered ? 'Enviar Avaliação' : 'Responda todas as questões'}
        </Button>
        <p className="mt-3 text-center text-xs text-gray-500">Suas respostas são anônimas e protegidas pela LGPD</p>
      </div>
    </>
  );
}
