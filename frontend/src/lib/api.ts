const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

interface RequestOptions extends RequestInit {
  token?: string;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, ...init } = options;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...init, headers });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Erro de rede' }));
    throw new Error(error.message || `Erro ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  checkups: {
    list: (token: string) =>
      request<Array<{ id: string; year: number; status: string; items: Array<{ id: string; examType: string; professionalType: string; category: string; status: string }> }>>('/checkups', { token }),

    create: (token: string, data: { year: number; targetDate: string; items: Array<{ examType: string; professionalType: string; category: string }> }) =>
      request('/checkups', { method: 'POST', token, body: JSON.stringify(data) }),

    timeline: (token: string) => request('/checkups/timeline', { token }),
  },

  nr1: {
    submitAssessment: (token: string, data: { responses: Record<string, number>; companyId?: string }) =>
      request('/nr1/assessments', { method: 'POST', token, body: JSON.stringify(data) }),

    dashboard: (token: string, companyId: string) =>
      request(`/nr1/dashboard/${companyId}`, { token }),
  },

  facilities: {
    nearby: (lat: number, lng: number, radius?: number, type?: string) => {
      const params = new URLSearchParams({ lat: String(lat), lng: String(lng) });
      if (radius) params.set('radius', String(radius));
      if (type) params.set('type', type);
      return request<Array<{ id: string; name: string; type: string; lat: number; lng: number; distance: number; address: string; phone?: string; is24h?: boolean }>>(`/facilities/nearby?${params}`);
    },

    emergency: (lat: number, lng: number) =>
      request<{ id: string; name: string; address: string } | null>(`/facilities/emergency?lat=${lat}&lng=${lng}`),
  },
};
