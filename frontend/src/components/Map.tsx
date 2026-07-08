'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Facility {
  id: string;
  name: string;
  type: string;
  address: string;
  phone?: string;
  lat: number;
  lng: number;
  distance: number;
}

interface MapProps {
  center: [number, number];
  facilities: Facility[];
}

const ICONS: Record<string, string> = {
  HOSPITAL: '#ef4444',
  PHARMACY: '#22c55e',
  CLINIC: '#3b82f6',
  LABORATORY: '#a855f7',
};

const ICON_SVGS: Record<string, string> = {
  HOSPITAL: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  PHARMACY: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  CLINIC: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
  LABORATORY: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
};

function createMarkerIcon(type: string, color: string) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 36px; height: 36px;
      background: ${color};
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      display: flex; align-items: center; justify-content: center;
      color: white; font-size: 16px;
    ">${type === 'HOSPITAL' ? '🏥' : type === 'PHARMACY' ? '💊' : type === 'CLINIC' ? '🏨' : '🔬'}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
}

export default function Map({ center, facilities }: MapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center,
        zoom: 14,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    facilities.forEach((f) => {
      const color = ICONS[f.type] || '#6b7280';
      const marker = L.marker([f.lat, f.lng], {
        icon: createMarkerIcon(f.type, color),
      }).addTo(mapRef.current!);

      marker.bindPopup(`
        <div style="min-width: 200px">
          <strong style="font-size: 14px">${f.name}</strong><br/>
          <span style="color: #666; font-size: 12px">${f.address}</span><br/>
          ${f.phone ? `<span style="color: #666; font-size: 12px">📞 ${f.phone}</span><br/>` : ''}
          <span style="color: #666; font-size: 12px">📍 ${f.distance} km</span>
        </div>
      `);

      markersRef.current.push(marker);
    });
  }, [facilities]);

  return (
    <div ref={mapContainerRef} className="h-full w-full" />
  );
}
