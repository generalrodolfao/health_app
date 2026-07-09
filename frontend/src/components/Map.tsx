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

const ICON_COLORS: Record<string, string> = {
  HOSPITAL: '#ef4444',
  PHARMACY: '#22c55e',
  CLINIC: '#3b82f6',
  LABORATORY: '#a855f7',
};

const ICON_EMOJI: Record<string, string> = {
  HOSPITAL: '🏥',
  PHARMACY: '💊',
  CLINIC: '🏨',
  LABORATORY: '🔬',
};

function createMarkerIcon(type: string, color: string) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="width:36px;height:36px;background:${color};border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-size:16px">${ICON_EMOJI[type] || '📍'}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
}

export default function Map({ center, facilities }: MapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (containerRef.current && !mapRef.current) {
      const map = L.map(containerRef.current, { center, zoom: 14, zoomControl: true });
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

  // Recenter when location changes
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView(center, 14);
    }
  }, [center]);

  // Update markers
  useEffect(() => {
    if (!mapRef.current) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    facilities.forEach((f) => {
      const color = ICON_COLORS[f.type] || '#6b7280';
      const marker = L.marker([f.lat, f.lng], { icon: createMarkerIcon(f.type, color) }).addTo(mapRef.current!);
      marker.bindPopup(`
        <div style="min-width:200px">
          <strong style="font-size:14px">${f.name}</strong><br/>
          <span style="color:#666;font-size:12px">${f.address}</span><br/>
          ${f.phone ? `<span style="color:#666;font-size:12px">📞 ${f.phone}</span><br/>` : ''}
          <span style="color:#666;font-size:12px">📍 ${f.distance} km</span>
        </div>
      `);
      markersRef.current.push(marker);
    });
  }, [facilities]);

  return <div ref={containerRef} className="h-full w-full" role="application" aria-label="Mapa de unidades de saúde" />;
}
