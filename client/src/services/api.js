import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ===== Auth API =====
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');
export const updateMe = (data) => API.put('/auth/me', data);

// ===== Requests API =====
export const getRequests = (params) => API.get('/requests', { params });
export const getRequestById = (id) => API.get(`/requests/${id}`);
export const createRequest = (data) => API.post('/requests', data);
export const updateRequest = (id, data) => API.put(`/requests/${id}`, data);
export const deleteRequest = (id) => API.delete(`/requests/${id}`);
export const getMyRequests = () => API.get('/requests/my/requests');

// ===== Volunteers API =====
export const getVolunteers = (params) => API.get('/volunteers', { params });
export const getVolunteerById = (id) => API.get(`/volunteers/${id}`);
export const updateSkills = (data) => API.put('/volunteers/skills', data);
export const updateAvailability = (data) => API.put('/volunteers/availability', data);

// ===== Matches API =====
export const createMatch = (data) => API.post('/matches', data);
export const getMyMatches = () => API.get('/matches/my/matches');
export const acceptMatch = (id) => API.put(`/matches/${id}/accept`);
export const rejectMatch = (id) => API.put(`/matches/${id}/reject`);
export const completeMatch = (id) => API.put(`/matches/${id}/complete`);

export default API;
