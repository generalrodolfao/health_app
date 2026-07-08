const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';

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

  return res.json();
}

export const api = {
  auth: {
    register: (data: { name: string; email: string; password: string }) =>
      request<{ accessToken: string; user: { id: string; email: string } }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    login: (data: { email: string; password: string }) =>
      request<{ accessToken: string; user: { id: string; email: string } }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  users: {
    profile: (token: string) =>
      request<{
        id: string;
        name: string;
        email: string;
        phone?: string;
        plan: string;
      }>('/users/profile', { token }),

    update: (token: string, data: Record<string, unknown>) =>
      request('/users/profile', {
        method: 'PATCH',
        token,
        body: JSON.stringify(data),
      }),
  },

  checkups: {
    list: (token: string) =>
      request<Array<{ id: string; year: number; status: string; items: Array<unknown> }>>('/checkups', { token }),

    create: (token: string, data: { year: number; targetDate: string; items: Array<{ examType: string; professionalType: string; category: string }> }) =>
      request('/checkups', { method: 'POST', token, body: JSON.stringify(data) }),

    timeline: (token: string) =>
      request('/checkups/timeline', { token }),
  },

  nr1: {
    submitAssessment: (token: string, data: { responses: Record<string, number>; companyId?: string }) =>
      request('/nr1/assessments', { method: 'POST', token, body: JSON.stringify(data) }),

    dashboard: (token: string, companyId: string) =>
      request<{
        totalAssessments: number;
        highRiskCount: number;
        riskPercentage: number;
        totalActions: number;
        completedActions: number;
      }>(`/nr1/dashboard/${companyId}`, { token }),
  },

  facilities: {
    nearby: (lat: number, lng: number, radius?: number, type?: string) => {
      const params = new URLSearchParams({ lat: String(lat), lng: String(lng) });
      if (radius) params.set('radius', String(radius));
      if (type) params.set('type', type);
      return request<Array<{ id: string; name: string; type: string; lat: number; lng: number; distance: number }>>(`/facilities/nearby?${params}`);
    },

    emergency: (lat: number, lng: number) =>
      request<{ id: string; name: string; address: string } | null>(`/facilities/emergency?lat=${lat}&lng=${lng}`),
  },
};
