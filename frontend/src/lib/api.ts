const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Erro de rede' }));
    throw new Error(error.message || `Erro ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export interface Checkup {
  id: string;
  year: number;
  status: string;
  progress: number;
  completedItems: number;
  totalItems: number;
  items: CheckupItem[];
}

export interface CheckupItem {
  id: string;
  examType: string;
  professionalType: string;
  category: string;
  status: string;
  scheduledDate?: string | null;
  completedDate?: string | null;
  notes?: string | null;
}

export interface Facility {
  id: string;
  name: string;
  type: string;
  address: string;
  phone?: string;
  lat: number;
  lng: number;
  distance: number;
  is24h?: boolean;
  openHours?: string;
}

export const api = {
  checkups: {
    list: () => request<Checkup[]>('/checkups'),
    create: (data: { year: number; targetDate: string; items: Array<{ examType: string; professionalType: string; category: string }> }) =>
      request<Checkup>('/checkups', { method: 'POST', body: JSON.stringify(data) }),
    timeline: () => request<Checkup[]>('/checkups/timeline'),
    updateItem: (itemId: string, data: { status: string; notes?: string }) =>
      request<CheckupItem>(`/checkups/items/${itemId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  },

  nr1: {
    submitAssessment: (data: { responses: Record<string, number> }) =>
      request('/nr1/assessments', { method: 'POST', body: JSON.stringify(data) }),
    dashboard: (companyId: string) => request(`/nr1/dashboard/${companyId}`),
  },

  facilities: {
    nearby: (lat: number, lng: number, radius?: number, type?: string) => {
      const params = new URLSearchParams({ lat: String(lat), lng: String(lng) });
      if (radius) params.set('radius', String(radius));
      if (type) params.set('type', type);
      return request<Facility[]>(`/facilities/nearby?${params}`);
    },
    emergency: (lat: number, lng: number) =>
      request<Facility | null>(`/facilities/emergency?lat=${lat}&lng=${lng}`),
  },
};