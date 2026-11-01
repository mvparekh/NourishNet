const TOKEN_KEY = "nourishnet_auth_token";
function getStoredToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}
function setStoredToken(token) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
  }
}
async function apiRequest(endpoint, options = {}) {
  const token = getStoredToken();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers || {}
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(endpoint, {
    ...options,
    headers
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }
  return data;
}
const ApiService = {
  async login(email, password) {
    const data = await apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    if (data.token) {
      setStoredToken(data.token);
    }
    return data;
  },
  async logout() {
    try {
      await apiRequest("/api/auth/logout", { method: "POST" });
    } catch {
    }
    setStoredToken(null);
  },
  async getMe() {
    return apiRequest("/api/auth/me");
  },
  async setupAccount(token, password) {
    const data = await apiRequest(
      "/api/auth/setup-account",
      {
        method: "POST",
        body: JSON.stringify({ token, password })
      }
    );
    if (data.token) {
      setStoredToken(data.token);
    }
    return data;
  },
  async fetchState() {
    return apiRequest("/api/state");
  },
  async createListing(listingData) {
    return apiRequest("/api/listings/create", {
      method: "POST",
      body: JSON.stringify(listingData)
    });
  },
  async claimReservation(listingId, requestedQuantity) {
    return apiRequest("/api/reservations/claim", {
      method: "POST",
      body: JSON.stringify({ listingId, requestedQuantity })
    });
  },
  async confirmPickup(pickupId, confirmationCode) {
    return apiRequest(
      "/api/handoff/confirm-pickup",
      {
        method: "POST",
        body: JSON.stringify({ pickupId, confirmationCode })
      }
    );
  },
  async confirmDelivery(pickupId) {
    return apiRequest(
      "/api/handoff/confirm-delivery",
      {
        method: "POST",
        body: JSON.stringify({ pickupId })
      }
    );
  },
  async cancelReservation(reservationId, reason) {
    return apiRequest("/api/reservations/cancel", {
      method: "POST",
      body: JSON.stringify({ reservationId, reason })
    });
  },
  async assignVolunteer(reservationId, volunteerId) {
    return apiRequest("/api/reservations/assign-volunteer", {
      method: "POST",
      body: JSON.stringify({ reservationId, volunteerId })
    });
  },
  async advanceRecoveryState(reservationId, toState, notes) {
    return apiRequest("/api/handoff/advance-state", {
      method: "POST",
      body: JSON.stringify({ reservationId, toState, notes })
    });
  },
  async verifyOtp(reservationId, enteredOtp, stage, pickupId) {
    return apiRequest("/api/verification/verify-otp", {
      method: "POST",
      body: JSON.stringify({ reservationId, enteredOtp, stage, pickupId })
    });
  },
  async verifyQr(pickupId, qrToken) {
    return apiRequest("/api/verification/verify-qr", {
      method: "POST",
      body: JSON.stringify({ pickupId, qrToken })
    });
  },
  async fallbackConfirm(reservationId, pickupId, reason) {
    return apiRequest("/api/verification/fallback-confirm", {
      method: "POST",
      body: JSON.stringify({ reservationId, pickupId, reason })
    });
  },
  async markNotificationRead(notificationId) {
    return apiRequest("/api/notifications/mark-read", {
      method: "POST",
      body: JSON.stringify({ notificationId })
    });
  },
  async markAllNotificationsRead() {
    return apiRequest("/api/notifications/mark-all-read", {
      method: "POST"
    });
  },
  async submitApplication(applicationData) {
    return apiRequest("/api/applications/submit", {
      method: "POST",
      body: JSON.stringify(applicationData)
    });
  },
  async reviewApplication(applicationId, decision, adminNotes, rejectionReason) {
    return apiRequest("/api/applications/review", {
      method: "POST",
      body: JSON.stringify({ applicationId, decision, adminNotes, rejectionReason })
    });
  },
  async inviteAdmin(adminData) {
    return apiRequest("/api/admin/invite", {
      method: "POST",
      body: JSON.stringify(adminData)
    });
  },
  async sendMessage(reservationId, text) {
    return apiRequest("/api/messages/send", {
      method: "POST",
      body: JSON.stringify({ reservationId, text })
    });
  },
  async getConfig() {
    return apiRequest("/api/config");
  },
  async resetDemo() {
    return apiRequest("/api/demo/reset", { method: "POST" });
  }
};
export {
  ApiService,
  getStoredToken,
  setStoredToken
};
