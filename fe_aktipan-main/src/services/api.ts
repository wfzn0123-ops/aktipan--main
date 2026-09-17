/**
 * AKTIPAN Unified API Client Layer
 * Handles authentication headers, JWT token persistence, and full REST endpoints.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5000/api' : 'https://be-aktipan-main.railway.app/api');

// Token storage keys
export const TOKEN_KEY = 'aktipan_auth_token';
export const USER_KEY = 'aktipan_auth_user';

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser(): any | null {
  const cached = localStorage.getItem(USER_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {}
  }
  return null;
}

export function setStoredUser(user: any): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// Universal fetch wrapper with Bearer token injection
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<{ success: boolean; data?: T; message?: string; [key: string]: any }> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      credentials: 'include',
      ...options,
      headers
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      // If 401 Unauthorized, handle token expiration gracefully
      if (response.status === 401 && token) {
        removeAuthToken();
      }
      // HTTP/2 omits statusText — provide human-readable fallbacks
      const STATUS_TEXT: Record<number, string> = {
        400: 'Bad Request',
        401: 'Unauthorized – silakan login kembali',
        403: 'Forbidden – akses ditolak',
        404: 'Endpoint tidak ditemukan',
        405: 'Method Not Allowed – backend belum berjalan atau URL salah',
        408: 'Request Timeout',
        429: 'Terlalu banyak permintaan',
        500: 'Internal Server Error',
        502: 'Bad Gateway – backend tidak merespons',
        503: 'Service Unavailable',
      };
      const statusText = response.statusText || STATUS_TEXT[response.status] || `HTTP ${response.status}`;
      return {
        success: false,
        message: data.message || `${statusText}`,
        status: response.status,
        ...data
      };
    }

    return {
      success: true,
      ...data
    };
  } catch (error: any) {
    console.warn(`[API Network Error] ${endpoint}:`, error.message);
    return {
      success: false,
      message: 'Tidak dapat terhubung ke server backend be_aktipan-main. Pastikan backend sedang berjalan.',
      isNetworkError: true
    };
  }
}

// --- Auth API ---
export const authApi = {
  async register(payload: { name: string; email: string; password: string; phone?: string; role?: string; location?: string; whatsapp?: string }) {
    const res = await request<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    if (res.success && res.token && res.user) {
      setAuthToken(res.token);
      setStoredUser(res.user);
    }
    return res;
  },

  async login(payload: { email: string; password: string }) {
    const res = await request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    if (res.success && res.token && res.user) {
      setAuthToken(res.token);
      setStoredUser(res.user);
    }
    return res;
  },

  async getMe() {
    const res = await request<{ user: any }>('/auth/me', {
      method: 'GET'
    });
    if (res.success && res.user) {
      setStoredUser(res.user);
    }
    return res;
  },

  async logout() {
    try {
      await request('/auth/logout', { method: 'POST' });
    } finally {
      removeAuthToken();
    }
    return { success: true };
  },

  async updateProfile(updates: any) {
    const res = await request<{ user: any }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    if (res.success && res.user) {
      setStoredUser(res.user);
    }
    return res;
  },

  async changePassword(oldPassword: string, newPassword: string) {
    return request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ oldPassword, newPassword })
    });
  }
};

// --- Admin API ---
export const adminApi = {
  async getStats() {
    return request<any>('/admin/stats');
  },

  async getUsers(params?: { q?: string; role?: string; status?: string }) {
    const query = new URLSearchParams();
    if (params?.q) query.set('q', params.q);
    if (params?.role) query.set('role', params.role);
    if (params?.status) query.set('status', params.status);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<{ users: any[]; count: number }>(`/admin/users${qs}`);
  },

  async createUser(payload: { name: string; email: string; password: string; role: string; phone?: string; location?: string }) {
    return request<{ user: any }>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async updateUserRole(userId: string, updates: { role?: string; isActive?: boolean }) {
    return request<{ user: any }>(`/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  async deleteUser(userId: string) {
    return request(`/admin/users/${userId}`, {
      method: 'DELETE'
    });
  },

  async getAuditLogs(limit: number = 100) {
    return request<{ logs: any[] }>(`/admin/audit-logs?limit=${limit}`);
  },

  async resetSeed() {
    return request('/admin/seed-reset', {
      method: 'POST'
    });
  }
};

// --- Activities API ---
export const activitiesApi = {
  async getAll(params?: { q?: string; category?: string; energy?: string; format?: string; is_free?: boolean }) {
    const query = new URLSearchParams();
    if (params?.q) query.set('q', params.q);
    if (params?.category) query.set('category', params.category);
    if (params?.energy) query.set('energy', params.energy);
    if (params?.format) query.set('format', params.format);
    if (params?.is_free !== undefined) query.set('is_free', String(params.is_free));
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<{ activities: any[]; count: number }>(`/activities${qs}`);
  },

  async getById(id: number) {
    return request<{ activity: any }>(`/activities/${id}`);
  },

  async create(activityData: any) {
    return request<{ activity: any }>('/activities', {
      method: 'POST',
      body: JSON.stringify(activityData)
    });
  },

  async update(id: number, updates: any) {
    return request<{ activity: any }>(`/activities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  async delete(id: number) {
    return request(`/activities/${id}`, {
      method: 'DELETE'
    });
  },

  async getSaved() {
    return request<{ savedIds: number[]; activities: any[] }>('/activities/saved');
  },

  async toggleSave(activityId: number) {
    return request<{ isSaved: boolean; savedIds: number[] }>(`/activities/saved/${activityId}`, {
      method: 'POST'
    });
  }
};

// --- Packs API ---
export const packsApi = {
  async getAll() {
    return request<{ packs: any[] }>('/packs');
  },

  async create(packData: any) {
    return request<{ pack: any }>('/packs', {
      method: 'POST',
      body: JSON.stringify(packData)
    });
  },

  async update(id: number, updates: any) {
    return request<{ pack: any }>(`/packs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  async delete(id: number) {
    return request(`/packs/${id}`, {
      method: 'DELETE'
    });
  }
};

// --- Sessions API ---
export const sessionsApi = {
  async getAll(all: boolean = false) {
    return request<{ sessions: any[] }>(`/sessions${all ? '?all=true' : ''}`);
  },

  async getById(id: string) {
    return request<{ session: any }>(`/sessions/${id}`);
  },

  async create(sessionData: any) {
    return request<{ session: any }>('/sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData)
    });
  },

  async update(id: string, updates: any) {
    return request<{ session: any }>(`/sessions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  async delete(id: string) {
    return request(`/sessions/${id}`, {
      method: 'DELETE'
    });
  }
};
