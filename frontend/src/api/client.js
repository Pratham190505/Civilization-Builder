import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor for handling 401/403 errors and refreshing tokens
client.interceptors.response.use(
  (response) => {
    if (["post", "put", "patch", "delete"].includes(response.config?.method)) {
      window.dispatchEvent(new CustomEvent("gds:data-changed", {
        detail: { method: response.config.method, url: response.config.url }
      }));
    }
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 Unauthorized and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return client(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        handleLogoutRedirect();
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        if (refreshResponse.data?.success) {
          const { accessToken: newAccess, refreshToken: newRefresh } = refreshResponse.data.data;
          localStorage.setItem("accessToken", newAccess);
          localStorage.setItem("refreshToken", newRefresh);

          client.defaults.headers.common["Authorization"] = `Bearer ${newAccess}`;
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;

          processQueue(null, newAccess);
          isRefreshing = false;
          return client(originalRequest);
        } else {
          throw new Error("Refresh token expired or invalid");
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        handleLogoutRedirect();
        isRefreshing = false;
        return Promise.reject(refreshError);
      }
    }

    // Return the response data even for errors if formatting is unified
    return Promise.reject(error.response?.data || error);
  }
);

function handleLogoutRedirect() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  localStorage.setItem("authenticated", "false");
  localStorage.removeItem("role");
  
  // Only redirect if not already on the login/signup page
  if (window.location.pathname !== "/" && window.location.pathname !== "/login" && window.location.pathname !== "/signup") {
    window.location.href = "/login?expired=true";
  }
}

export default client;
