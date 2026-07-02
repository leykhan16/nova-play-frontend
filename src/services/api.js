import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto refresh token on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        const res = await axios.post(`${BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefresh } = res.data.data;
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", newRefresh);

        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch (err) {
        localStorage.clear();
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

// Auth
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  verifyOTP: (data) => api.post("/auth/verify-otp", data),
  resendOTP: (data) => api.post("/auth/resend-otp", data),
  refresh: (data) => api.post("/auth/refresh", data),
  logout: (data) => api.post("/auth/logout", data),
};

// Wallet
export const walletAPI = {
  getWallet: () => api.get("/wallet"),
  getTransactions: () => api.get("/wallet/transactions"),
  withdraw: (data) => api.post("/wallet/withdraw", data),
};

// Payments
export const paymentsAPI = {
  initiate: (data) => api.post("/payments/initiate", data),
  confirmSent: (id) => api.post(`/payments/${id}/confirm-sent`),
  getPayments: () => api.get("/payments"),
  getPending: () => api.get("/payments/pending"),
  sendDetails: (id, data) => api.post(`/payments/${id}/send-details`, data),
  approve: (id) => api.post(`/payments/${id}/approve`),
  reject: (id, data) => api.post(`/payments/${id}/reject`, data),
};

// Games
export const gamesAPI = {
  getHistory: () => api.get("/games/history"),
  placeBet: (gameId, data) => api.post(`/games/${gameId}/bet`, data),
  cashOut: (betId, data) => api.post(`/games/bet/${betId}/cashout`, data),
  spin: (data) => api.post("/games/spin", data),
  getSpinHistory: () => api.get("/games/spin/history"),
  getBonuses: () => api.get("/games/bonuses"),
  createGame: () => api.post("/games/create"),
  startGame: (id) => api.post(`/games/${id}/start`),
  endGame: (id, data) => api.post(`/games/${id}/end`, data),
};

export default api;
