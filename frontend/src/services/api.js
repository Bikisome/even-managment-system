import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
};

// Events API
export const eventsAPI = {
  getAll: (params = {}) => api.get('/events', { params }),
  getById: (id) => api.get(`/events/${id}`),
  create: (eventData) => api.post('/events', eventData),
  update: (id, eventData) => api.put(`/events/${id}`, eventData),
  delete: (id) => api.delete(`/events/${id}`),
};

// Tickets API
export const ticketsAPI = {
  create: (ticketData) => api.post('/tickets', ticketData),
  getByEvent: (eventId) => api.get(`/tickets/event/${eventId}`),
  checkAvailability: (ticketId) => api.get(`/tickets/check-availability/${ticketId}`),
};

// Attendees API
export const attendeesAPI = {
  register: (registrationData) => api.post('/attendees/register', registrationData),
  getMyRegistrations: () => api.get('/attendees/my-registrations'),
  getEventAttendees: (eventId) => api.get(`/attendees/event/${eventId}`),
};

// Payments API
export const paymentsAPI = {
  process: (paymentData) => api.post('/payments/process', paymentData),
  getHistory: (params = {}) => api.get('/payments/history', { params }),
  refund: (paymentId, refundData) => api.post(`/payments/refund/${paymentId}`, refundData),
};

// Forums API
export const forumsAPI = {
  create: (postData) => api.post('/forums', postData),
  getByEvent: (eventId, params = {}) => api.get(`/forums/event/${eventId}`, { params }),
  update: (id, postData) => api.put(`/forums/${id}`, postData),
  delete: (id) => api.delete(`/forums/${id}`),
};

// Polls API
export const pollsAPI = {
  create: (pollData) => api.post('/polls', pollData),
  getByEvent: (eventId) => api.get(`/polls/event/${eventId}`),
  vote: (pollId, voteData) => api.post(`/polls/${pollId}/vote`, voteData),
};

// Q&A API
export const qaAPI = {
  ask: (questionData) => api.post('/qa', questionData),
  getByEvent: (eventId, params = {}) => api.get(`/qa/event/${eventId}`, { params }),
  answer: (questionId, answerData) => api.post(`/qa/${questionId}/answer`, answerData),
};

// Notifications API
export const notificationsAPI = {
  create: (notificationData) => api.post('/notifications', notificationData),
  getMyNotifications: (params = {}) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  getUnreadCount: () => api.get('/notifications/unread-count'),
};

// Users API
export const usersAPI = {
  getAll: (params = {}) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, userData) => api.put(`/users/${id}`, userData),
};

export default api; 