'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const MapWithNoSSR = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[500px] items-center justify-center rounded-xl bg-gray-100">
      <p className="text-sm text-gray-500">Carregando mapa...</p>
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
}

export default function MapPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [filterType, setFilterType] = useState<FacilityType | ''>('');
  const [userLocation, setUserLocation] = useState<[number, number]>([-23.5505, -46.6333]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        },
        () => {},
      );
    }
  }, []);

  useEffect(() => {
    async function loadFacilities() {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          lat: String(userLocation[0]),
          lng: String(userLocation[1]),
          radius: '10',
        });
        if (filterType) params.set('type', filterType);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api'}/facilities/nearby?${params}`,
        );
        const data = await res.json();
        setFacilities(data);
      } catch {
        console.error('Erro ao carregar unidades');
      } finally {
        setLoading(false);
      }
    }
    loadFacilities();
  }, [userLocation, filterType]);

  const getTypeLabel = (type: FacilityType) => {
    const labels: Record<FacilityType, string> = {
      HOSPITAL: 'Hospital',
      PHARMACY: 'Farmácia',
      CLINIC: 'Clínica',
      LABORATORY: 'Laboratório',
    };
    return labels[type];
  };

  const getTypeColor = (type: FacilityType) => {
    const colors: Record<FacilityType, string> = {
      HOSPITAL: 'text-red-600 bg-red-50 border-red-200',
      PHARMACY: 'text-green-600 bg-green-50 border-green-200',
      CLINIC: 'text-blue-600 bg-blue-50 border-blue-200',
      LABORATORY: 'text-purple-600 bg-purple-50 border-purple-200',
    };
    return colors[type];
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Mapa da Saúde</h1>
        <p className="mt-1 text-sm text-gray-500">
          Encontre farmácias, hospitais e clínicas próximas
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setFilterType('')}
          className={`rounded-full px-4 py-1.5 text-sm font-medium ${
            filterType === '' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Todas
        </button>
        {(['HOSPITAL', 'PHARMACY', 'CLINIC', 'LABORATORY'] as FacilityType[]).map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              filterType === type ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {getTypeLabel(type)}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border bg-white shadow-sm lg:col-span-2">
          <div className="h-[500px] w-full overflow-hidden rounded-xl">
            <MapWithNoSSR
              center={userLocation}
              facilities={facilities}
            />
          </div>
        </div>

        <div className="rounded-xl border bg-white shadow-sm">
          <div className="border-b px-4 py-3">
            <h2 className="text-sm font-semibold text-gray-900">
              {loading ? 'Carregando...' : `${facilities.length} unidade(s) encontrada(s)`}
            </h2>
          </div>
          <div className="h-[452px] divide-y overflow-y-auto">
            {facilities.map((facility) => (
              <div key={facility.id} className="px-4 py-3 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{facility.name}</p>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-xs font-medium ${getTypeColor(facility.type)}`}
                  >
                    {getTypeLabel(facility.type)}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-gray-500">{facility.address}</p>
                <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                  <span>{facility.distance} km</span>
                  {facility.phone && <span>{facility.phone}</span>}
                </div>
              </div>
            ))}
            {!loading && facilities.length === 0 && (
              <div className="flex h-full items-center justify-center px-4">
                <p className="text-sm text-gray-400">Nenhuma unidade encontrada</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
