'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Card, Button, Badge, PageHeader, Spinner, EmptyState } from '@/components/ui';
import { api, Facility } from '@/lib/api';

const MapWithNoSSR = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <div className="flex h-[400px] items-center justify-center rounded-xl bg-gray-100"><Spinner className="h-8 w-8 text-primary-600" /></div>,
});

export default function MapPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [emergency, setEmergency] = useState<Facility | null>(null);
  const [filter, setFilter] = useState('');
  const [loc, setLoc] = useState<[number, number]>([-23.5505, -46.6333]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [geoDenied, setGeoDenied] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => { setLoc([pos.coords.latitude, pos.coords.longitude]); setGeoDenied(false); },
      () => setGeoDenied(true),
    );
  }, []);

  useEffect(() => {
    setLoading(true); setError('');
    api.facilities.nearby(loc[0], loc[1], 10, filter || undefined)
      .then(setFacilities).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, [loc, filter]);

  const handleEmergency = async () => {
    setShowEmergency(true); setEmergency(null);
    try { setEmergency(await api.facilities.emergency(loc[0], loc[1])); }
    catch { setError('Não foi possível buscar hospital'); }
  };

  const typeLabels: Record<string, string> = { HOSPITAL: 'Hospital', PHARMACY: 'Farmácia', CLINIC: 'Clínica', LABORATORY: 'Laboratório' };
  const typeColors: Record<string, 'red'|'green'|'blue'|'purple'|'gray'> = { HOSPITAL: 'red', PHARMACY: 'green', CLINIC: 'blue', LABORATORY: 'purple' };

  return (
    <>
      <PageHeader title="Mapa da Saúde" subtitle="Farmácias, hospitais e clínicas reais perto de você">
        <Button variant="danger" size="sm" onClick={handleEmergency}>🚨 Emergência</Button>
      </PageHeader>

      {geoDenied && <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">📍 Localização desativada. Mostrando São Paulo. Ative a localização para resultados precisos.</div>}

      {showEmergency && (
        <Card className={`mb-4 ${emergency ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-red-900">🚨 {emergency ? 'Hospital mais próximo' : 'Buscando hospital...'}</p>
              {emergency && <p className="text-sm text-red-700">{emergency.name} — {emergency.distance} km</p>}
            </div>
            <a href="tel:192"><Button variant="danger">SAMU 192</Button></a>
          </div>
        </Card>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        <button onClick={() => setFilter('')} className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${filter === '' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Todas</button>
        {(['HOSPITAL','PHARMACY','CLINIC','LABORATORY'] as const).map((t) => (
          <button key={t} onClick={() => setFilter(t)} className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${filter === t ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{typeLabels[t]}</button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="h-[400px] w-full overflow-hidden rounded-xl border border-gray-200 shadow-sm lg:h-[500px]">
            <MapWithNoSSR center={loc} facilities={facilities} emergencyHospital={emergency} />
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b px-4 py-3"><h2 className="text-sm font-semibold">{loading ? 'Carregando...' : `${facilities.length} unidade(s)`}</h2></div>
          <div className="max-h-[440px] divide-y overflow-y-auto">
            {error ? <div className="p-4"><EmptyState icon="⚠️" title="Erro" description={error} /></div>
            : loading ? <div className="flex justify-center py-12"><Spinner className="h-6 w-6 text-primary-600" /></div>
            : facilities.length === 0 ? <div className="p-4"><EmptyState icon="🗺️" title="Nenhuma unidade" description="Tente aumentar o raio." /></div>
            : facilities.map((f) => (
              <div key={f.id} className="px-4 py-3 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{f.name}</p>
                  <div className="flex gap-1.5">{f.is24h && <Badge color="amber">24h</Badge>}<Badge color={typeColors[f.type] || 'gray'}>{typeLabels[f.type] || f.type}</Badge></div>
                </div>
                <p className="mt-0.5 text-xs text-gray-500">{f.address}</p>
                <div className="mt-1 flex gap-3 text-xs text-gray-500"><span>📍 {f.distance} km</span>{f.phone && <span>📞 {f.phone}</span>}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}