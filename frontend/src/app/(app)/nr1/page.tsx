'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Badge, PageHeader, Spinner } from '@/components/ui';
import { api, Nr1Question, Nr1Result, Nr1HistoryItem } from '@/lib/api';

const riskColors: Record<string, 'green'|'amber'|'red'> = { LOW: 'green', MEDIUM: 'amber', HIGH: 'red', CRITICAL: 'red' };
const riskLabels: Record<string, string> = { LOW: 'Baixo', MEDIUM: 'Médio', HIGH: 'Alto', CRITICAL: 'Grave' };

export default function Nr1Page() {
  const [questions, setQuestions] = useState<Nr1Question[]>([]);
  const [step, setStep] = useState<'intro' | 'quiz' | 'submitting' | 'result' | 'error'>('intro');
  const [currentQ, setCurrentQ] = useState(0);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [result, setResult] = useState<Nr1Result | null>(null);
  const [history, setHistory] = useState<Nr1HistoryItem[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    api.nr1.questions().then(setQuestions).catch(() => {});
    api.nr1.history().then(setHistory).catch(() => {});
  }, []);

  const start = () => { setStep('quiz'); setCurrentQ(0); setResponses({}); };
  const answer = (value: number) => {
    const newResponses = { ...responses, [String(currentQ)]: value };
    setResponses(newResponses);
    if (currentQ < questions.length - 1) setCurrentQ(currentQ + 1);
    else submit(newResponses);
  };
  const goBack = () => { if (currentQ > 0) setCurrentQ(currentQ - 1); };

  const submit = async (resp: Record<string, number>) => {
    setStep('submitting');
    try {
      const r = await api.nr1.submit({ responses: resp });
      setResult(r); setStep('result');
      api.nr1.history().then(setHistory).catch(() => {});
    } catch (e: any) {
      setErrorMsg(e.message); setStep('error'); setResponses(resp);
    }
  };

  // INTRO
  if (step === 'intro') {
    return (
      <>
        <PageHeader title="Saúde Mental" subtitle="Avaliação de risco psicossocial (PHQ-9)" />
        <Card>
          <div className="space-y-4">
            <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-900">
              <p className="font-semibold">Sobre esta avaliação</p>
              <ul className="mt-2 space-y-1 text-blue-800">
                <li>• Baseada na escala PHQ-9, validada cientificamente</li>
                <li>• 9 perguntas rápidas (~2 minutos)</li>
                <li>• Suas respostas são anônimas</li>
                <li>• O resultado não é diagnóstico clínico</li>
              </ul>
            </div>
            <p className="text-sm text-gray-600">Ao final você verá seu nível de risco e recomendações personalizadas.</p>
            <Button onClick={start} size="lg" fullWidth>Iniciar Avaliação</Button>
          </div>
        </Card>

        {history.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-3 text-sm font-semibold text-gray-700">Avaliações Anteriores</h2>
            <div className="space-y-2">
              {history.map((h) => (
                <Card key={h.id} className="flex items-center justify-between !py-3">
                  <span className="text-sm text-gray-600">{new Date(h.assessedAt).toLocaleDateString('pt-BR')}</span>
                  <Badge color={riskColors[h.overallRiskLevel] || 'gray'}>{riskLabels[h.overallRiskLevel] || h.overallRiskLevel}</Badge>
                </Card>
              ))}
            </div>
          </div>
        )}
      </>
    );
  }

  // QUIZ
  if (step === 'quiz' || step === 'submitting') {
    const q = questions[currentQ];
    if (!q) return <div className="flex justify-center py-12"><Spinner className="h-8 w-8 text-primary-600" /></div>;
    const progress = Math.round(((currentQ + 1) / questions.length) * 100);

    return (
      <>
        <PageHeader title="Avaliação NR-1" subtitle={`${currentQ + 1} de ${questions.length}`} />
        <div className="mb-6"><div className="h-2 rounded-full bg-gray-100"><div className="h-2 rounded-full bg-primary-600 transition-all" style={{ width: `${progress}%` }} /></div></div>

        <Card>
          <p className="text-lg font-medium text-gray-900">{q.question}</p>
          <p className="mt-1 text-sm text-gray-500">Nas últimas 2 semanas, com que frequência?</p>
          <div className="mt-6 space-y-3">
            {q.options.map((opt) => (
              <button key={opt.value} onClick={() => answer(opt.value)} disabled={step === 'submitting'}
                className={`w-full rounded-lg border-2 p-4 text-left text-sm font-medium transition-colors ${
                  responses[String(currentQ)] === opt.value ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                }`}>
                {opt.label}
              </button>
            ))}
          </div>
        </Card>

        <div className="mt-4 flex justify-between">
          <Button variant="ghost" onClick={goBack} disabled={currentQ === 0}>← Voltar</Button>
          {step === 'submitting' && <Spinner className="h-6 w-6 text-primary-600" />}
        </div>
      </>
    );
  }

  // ERROR
  if (step === 'error') {
    return (
      <>
        <PageHeader title="Erro" />
        <Card className="text-center">
          <div className="mb-3 text-4xl">⚠️</div>
          <p className="font-medium text-red-600">{errorMsg}</p>
          <p className="mt-2 text-sm text-gray-500">Suas respostas não foram perdidas.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Button onClick={() => submit(responses)}>Tentar novamente</Button>
            <Button variant="ghost" onClick={() => setStep('intro')}>Voltar ao início</Button>
          </div>
        </Card>
      </>
    );
  }

  // RESULT
  if (step === 'result' && result) {
    return (
      <>
        <PageHeader title="Resultado da Avaliação" />
        <Card className="text-center">
          <p className="text-sm text-gray-500">Seu nível de risco</p>
          <div className="mt-3 inline-block"><Badge color={riskColors[result.overallRiskLevel] || 'gray'} className="text-base px-6 py-2">{riskLabels[result.overallRiskLevel] || result.overallRiskLevel}</Badge></div>
          <p className="mt-4 text-2xl font-bold text-gray-900">{result.totalScore}<span className="text-lg text-gray-400">/{result.maxScore}</span></p>
          <p className="mt-1 text-xs text-gray-500">Score total</p>
          <p className="mt-6 rounded-lg bg-gray-50 p-4 text-sm text-gray-700">{result.recommendation}</p>
        </Card>

        {(result.overallRiskLevel === 'HIGH' || result.overallRiskLevel === 'CRITICAL') && (
          <Card className="mt-4 border-red-200 bg-red-50">
            <div className="flex items-center justify-between">
              <div><p className="font-semibold text-red-900">Precisa de ajuda?</p><p className="text-sm text-red-700">Ligue para o CVV — gratuito e 24h</p></div>
              <a href="tel:188"><Button variant="danger">Ligar 188</Button></a>
            </div>
          </Card>
        )}

        <Card className="mt-4">
          <p className="text-xs text-gray-500">Esta avaliação não substitui um diagnóstico clínico. Consulte um profissional de saúde para avaliação completa.</p>
        </Card>

        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={start}>Fazer Nova Avaliação</Button>
        </div>
      </>
    );
  }

  return null;
}