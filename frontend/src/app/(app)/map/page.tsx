'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Card, Button, Badge, PageHeader, Spinner, EmptyState } from '@/components/ui';

const MapWithNoSSR = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[400px] items-center justify-center rounded-xl bg-gray-100">
      <Spinner className="h-8 w-8 text-primary-600" />
    </div>
  ),
});

type FacilityType = 'HOSPITAL' | 'PHARMACY' | 'CLINIC' | 'LABORATORY';

interface Facility {
  id: string;
  name: string;
  type: FacilityType;
  address: string;
  phone?: string;
  lat: number;
  lng: number;
  distance: number;
  is24h?: boolean;
}

export default function MapPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [filterType, setFilterType] = useState<FacilityType | ''>('');
  const [userLocation, setUserLocation] = useState<[number, number]>([-23.5505, -46.6333]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [geoDenied, setGeoDenied] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation([pos.coords.latitude, pos.coords.longitude]);
          setGeoDenied(false);
        },
        () => setGeoDenied(true),
      );
    }
  }, []);

  useEffect(() => {
    async function loadFacilities() {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams({ lat: String(userLocation[0]), lng: String(userLocation[1]), radius: '10' });
        if (filterType) params.set('type', filterType);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/facilities/nearby?${params}`);
        if (!res.ok) throw new Error('Falha ao carregar');
        setFacilities(await res.json());
      } catch (e: any) {
        setError(e.message || 'Erro ao carregar unidades');
      } finally {
        setLoading(false);
      }
    }
    loadFacilities();
  }, [userLocation, filterType]);

  const handleEmergency = async () => {
    setShowEmergency(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/facilities/emergency?lat=${userLocation[0]}&lng=${userLocation[1]}`);
      if (res.ok) {
        const hospital = await res.json();
        if (hospital) {
          setFacilities([hospital]);
          setFilterType('HOSPITAL');
        }
      }
    } catch {}
  };

  const typeLabels: Record<FacilityType, string> = {
    HOSPITAL: 'Hospital', PHARMACY: 'Farmácia', CLINIC: 'Clínica', LABORATORY: 'Laboratório',
  };
  const typeColors: Record<FacilityType, 'red' | 'green' | 'blue' | 'purple'> = {
    HOSPITAL: 'red', PHARMACY: 'green', CLINIC: 'blue', LABORATORY: 'purple',
  };

  return (
    <>
      <PageHeader title="Mapa da Saúde" subtitle="Farmácias, hospitais e clínicas próximos">
        <Button variant="danger" size="sm" onClick={handleEmergency}>🚨 Emergência</Button>
      </PageHeader>

      {geoDenied && (
        <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          📍 Localização desativada. Mostrando unidades de São Paulo. Ative a localização para resultados mais precisos.
        </div>
      )}

      {showEmergency && (
        <Card className="mb-4 border-red-200 bg-red-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-red-900">🚨 Modo Emergência</p>
              <p className="text-sm text-red-700">Hospital mais próximo destacado no mapa.</p>
            </div>
            <a href="tel:192"><Button variant="danger">Ligar SAMU 192</Button></a>
          </div>
        </Card>
      )}

      {/* Filtros */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setFilterType('')}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${filterType === '' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          Todas
        </button>
        {(['HOSPITAL', 'PHARMACY', 'CLINIC', 'LABORATORY'] as FacilityType[]).map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${filterType === type ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {typeLabels[type]}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Mapa */}
        <div className="lg:col-span-2">
          <div className="h-[400px] w-full overflow-hidden rounded-xl border border-gray-200 shadow-sm lg:h-[500px]">
            <MapWithNoSSR center={userLocation} facilities={facilities} />
          </div>
        </div>

        {/* Lista lateral */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b px-4 py-3">
            <h2 className="text-sm font-semibold text-gray-900">
              {loading ? 'Carregando...' : `${facilities.length} unidade(s) encontrada(s)`}
            </h2>
          </div>
          <div className="max-h-[440px] divide-y overflow-y-auto lg:max-h-[460px]">
            {error ? (
              <div className="p-4">
                <EmptyState icon="⚠️" title="Erro ao carregar" description={error} />
              </div>
            ) : loading ? (
              <div className="flex justify-center py-12"><Spinner className="h-6 w-6 text-primary-600" /></div>
            ) : facilities.length === 0 ? (
              <div className="p-4">
                <EmptyState icon="🗺️" title="Nenhuma unidade encontrada" description="Tente aumentar o raio ou mudar o filtro." />
              </div>
            ) : (
              facilities.map((f) => (
                <div key={f.id} className="px-4 py-3 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{f.name}</p>
                    <div className="flex items-center gap-1.5">
                      {f.is24h && <Badge color="amber">24h</Badge>}
                      <Badge color={typeColors[f.type]}>{typeLabels[f.type]}</Badge>
                    </div>
                  </div>
                  <p className="mt-0.5 text-xs text-gray-500">{f.address}</p>
                  <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                    <span>📍 {f.distance} km</span>
                    {f.phone && <span>📞 {f.phone}</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
