'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Facility { id: string; name: string; type: string; address: string; phone?: string; lat: number; lng: number; distance: number; is24h?: boolean; openHours?: string }
interface MapProps { center: [number, number]; facilities: Facility[]; emergencyHospital?: Facility | null }

const ICONS: Record<string, string> = { HOSPITAL: '#ef4444', PHARMACY: '#22c55e', CLINIC: '#3b82f6', LABORATORY: '#a855f7' };
const EMOJI: Record<string, string> = { HOSPITAL: '🏥', PHARMACY: '💊', CLINIC: '🏨', LABORATORY: '🔬' };

function markerIcon(type: string, color: string, emoji: string) {
  return L.divIcon({ className: 'custom-marker', html: `<div style="width:36px;height:36px;background:${color};border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-size:16px">${emoji}</div>`, iconSize: [36,36], iconAnchor: [18,36], popupAnchor: [0,-36] });
}
const userIcon = L.divIcon({ className: 'custom-marker', html: `<div style="width:20px;height:20px;background:#2563eb;border:3px solid white;border-radius:50%;box-shadow:0 0 0 6px rgba(37,99,235,0.3)">📍</div>`, iconSize: [20,20], iconAnchor: [10,10] });

export default function Map({ center, facilities, emergencyHospital }: MapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const userMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (containerRef.current && !mapRef.current) {
      const map = L.map(containerRef.current, { center, zoom: 14 });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap', maxZoom: 19 }).addTo(map);
      mapRef.current = map;
    }
    return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  }, []);

  useEffect(() => {
    if (mapRef.current) { mapRef.current.setView(center, 14); }
  }, [center]);

  useEffect(() => {
    if (!mapRef.current) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    facilities.forEach((f) => {
      const color = ICONS[f.type] || '#6b7280';
      const m = L.marker([f.lat, f.lng], { icon: markerIcon(f.type, color, EMOJI[f.type] || '📍') }).addTo(mapRef.current!);
      m.bindPopup(`<div style="min-width:200px"><strong>${f.name}</strong><br/><span style="color:#666;font-size:12px">${f.address}</span><br/>${f.phone ? `<span style="color:#666;font-size:12px">📞 ${f.phone}</span><br/>` : ''}${f.openHours ? `<span style="color:#666;font-size:12px">🕒 ${f.openHours}</span><br/>` : ''}<span style="color:#666;font-size:12px">📍 ${f.distance} km</span>${f.is24h ? ' <strong style="color:#f59e0b">24h</strong>' : ''}</div>`);
      markersRef.current.push(m);
    });
    // Emergency highlight
    if (emergencyHospital) {
      const m = L.marker([emergencyHospital.lat, emergencyHospital.lng], { icon: markerIcon('HOSPITAL', '#dc2626', '🚨'), zIndexOffset: 1000 }).addTo(mapRef.current!);
      m.bindPopup(`<div style="min-width:220px"><strong style="color:#dc2626">🚨 EMERGÊNCIA</strong><br/><strong>${emergencyHospital.name}</strong><br/><span style="color:#666;font-size:12px">${emergencyHospital.address}</span><br/><span style="color:#666;font-size:12px">📍 ${emergencyHospital.distance} km</span></div>`).openPopup();
      markersRef.current.push(m);
    }
  }, [facilities, emergencyHospital]);

  // User location marker
  useEffect(() => {
    if (!mapRef.current) return;
    if (userMarkerRef.current) userMarkerRef.current.remove();
    userMarkerRef.current = L.marker(center, { icon: userIcon, zIndexOffset: 500 }).addTo(mapRef.current).bindPopup('Você está aqui');
  }, [center]);

  return <div ref={containerRef} className="h-full w-full" role="application" aria-label="Mapa de unidades de saúde" />;
}