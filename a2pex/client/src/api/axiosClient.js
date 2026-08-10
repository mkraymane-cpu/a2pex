import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const axiosClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach the admin JWT (if present) to every request.
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('a2pex_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On a 401 from a protected admin route, clear the stale session so the
// UI can redirect to /admin/login instead of looping on failed requests.
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname.startsWith('/admin')) {
      localStorage.removeItem('a2pex_admin_token');
      localStorage.removeItem('a2pex_admin');
      if (!window.location.pathname.includes('/admin/login')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
