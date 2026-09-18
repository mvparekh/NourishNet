// Client API service communicating with authoritative backend server
const TOKEN_KEY = 'nourishnet_auth_token';

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // Ignore storage issues
  }
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }

  return data as T;
}

export const ApiService = {
  async login(email: string, password: string) {
    const data = await apiRequest<{ success: boolean; user: any; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) {
      setStoredToken(data.token);
    }
    return data;
  },

  async logout() {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors during logout
    }
    setStoredToken(null);
  },

  async getMe() {
    return apiRequest<{ success: boolean; user: any }>('/api/auth/me');
  },

  async setupAccount(token: string, password: string) {
    const data = await apiRequest<{ success: boolean; message: string; user: any; token: string }>(
      '/api/auth/setup-account',
      {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      }
    );
    if (data.token) {
      setStoredToken(data.token);
    }
    return data;
  },

  async fetchState() {
    return apiRequest<any>('/api/state');
  },

  async createListing(listingData: any) {
    return apiRequest<{ success: boolean; listing: any }>('/api/listings/create', {
      method: 'POST',
      body: JSON.stringify(listingData),
    });
  },

  async claimReservation(listingId: string, requestedQuantity: number) {
    return apiRequest<{
      success: boolean;
      reservation: any;
      pickup: any;
      listing: any;
      confirmationCode: string;
    }>('/api/reservations/claim', {
      method: 'POST',
      body: JSON.stringify({ listingId, requestedQuantity }),
    });
  },

  async confirmPickup(pickupId: string, confirmationCode?: string) {
    return apiRequest<{ success: boolean; message: string; pickup: any; reservation: any }>(
      '/api/handoff/confirm-pickup',
      {
        method: 'POST',
        body: JSON.stringify({ pickupId, confirmationCode }),
      }
    );
  },

  async confirmDelivery(pickupId: string) {
    return apiRequest<{ success: boolean; message: string; pickup: any; reservation: any }>(
      '/api/handoff/confirm-delivery',
      {
        method: 'POST',
        body: JSON.stringify({ pickupId }),
      }
    );
  },

  async cancelReservation(reservationId: string, reason?: string) {
    return apiRequest<{ success: boolean; message: string }>('/api/reservations/cancel', {
      method: 'POST',
      body: JSON.stringify({ reservationId, reason }),
    });
  },

  async submitApplication(applicationData: any) {
    return apiRequest<{ success: boolean; applicationId: string }>('/api/applications/submit', {
      method: 'POST',
      body: JSON.stringify(applicationData),
    });
  },

  async reviewApplication(applicationId: string, decision: 'APPROVED' | 'REJECTED', adminNotes?: string, rejectionReason?: string) {
    return apiRequest<{ success: boolean; message: string; setupToken?: string }>('/api/applications/review', {
      method: 'POST',
      body: JSON.stringify({ applicationId, decision, adminNotes, rejectionReason }),
    });
  },

  async inviteAdmin(adminData: any) {
    return apiRequest<{ success: boolean; message: string; setupToken: string }>('/api/admin/invite', {
      method: 'POST',
      body: JSON.stringify(adminData),
    });
  },

  async sendMessage(reservationId: string, text: string) {
    return apiRequest<{ success: boolean; message: any }>('/api/messages/send', {
      method: 'POST',
      body: JSON.stringify({ reservationId, text }),
    });
  },
};
