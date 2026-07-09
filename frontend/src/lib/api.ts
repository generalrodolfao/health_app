const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers as Record<string, string>) },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Erro de rede' }));
    const msg = Array.isArray(err.message) ? err.message.join(', ') : err.message || `Erro ${res.status}`;
    throw new Error(msg);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export interface Checkup {
  id: string; year: number; status: string; progress: number; completedItems: number; totalItems: number;
  items: CheckupItem[];
}
export interface CheckupItem {
  id: string; examType: string; professionalType: string; category: string; status: string;
  scheduledDate?: string | null; completedDate?: string | null; notes?: string | null;
}
export interface Facility {
  id: string; name: string; type: string; address: string; phone?: string;
  lat: number; lng: number; distance: number; is24h?: boolean; openHours?: string;
}
export interface Nr1Question { id: number; question: string; options: { label: string; value: number }[] }
export interface Nr1Result {
  id: string; overallRiskLevel: string; totalScore: number; maxScore: number;
  recommendation: string; assessedAt: string;
}
export interface Nr1HistoryItem { id: string; overallRiskLevel: string; assessedAt: string }

export const api = {
  checkups: {
    list: () => request<Checkup[]>('/checkups'),
    create: (data: { year: number; targetDate: string; items: { examType: string; professionalType: string; category: string }[] }) =>
      request<Checkup>('/checkups', { method: 'POST', body: JSON.stringify(data) }),
    addItem: (checkupId: string, data: { examType: string; professionalType: string; category: string }) =>
      request<CheckupItem>(`/checkups/${checkupId}/items`, { method: 'POST', body: JSON.stringify(data) }),
    updateItem: (itemId: string, data: { status: string; notes?: string }) =>
      request<CheckupItem>(`/checkups/items/${itemId}`, { method: 'PATCH', body: JSON.stringify(data) }),
    timeline: () => request<Checkup[]>('/checkups/timeline'),
  },
  nr1: {
    questions: () => request<Nr1Question[]>('/nr1/questions'),
    submit: (data: { responses: Record<string, number> }) =>
      request<Nr1Result>('/nr1/assessments', { method: 'POST', body: JSON.stringify(data) }),
    history: () => request<Nr1HistoryItem[]>('/nr1/history'),
    dashboard: () => request<{ totalAssessments: number; highRiskCount: number; riskPercentage: number }>('/nr1/dashboard'),
  },
  facilities: {
    nearby: (lat: number, lng: number, radius?: number, type?: string) => {
      const p = new URLSearchParams({ lat: String(lat), lng: String(lng) });
      if (radius) p.set('radius', String(radius));
      if (type) p.set('type', type);
      return request<Facility[]>(`/facilities/nearby?${p}`);
    },
    emergency: (lat: number, lng: number) => request<Facility | null>(`/facilities/emergency?lat=${lat}&lng=${lng}`),
  },
};