import axios from 'axios';

// Create axios instance
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
  withCredentials: true, // Important for sending cookies
});

// Response interceptor to handle rate limiting and authentication errors
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 429) {
      // Rate limit exceeded, show user-friendly message
      console.error('Rate limit exceeded. Please try again later.');
    } else if (error.response?.status === 401) {
      // Authentication error - this might indicate an expired or invalid token
      console.error('Authentication failed. Token may be expired or invalid.');
      // Clear any stored user data to prevent showing stale data
      localStorage.removeItem('user');
      // This will be handled by AuthContext which will redirect to login
    }
    // The promise will be rejected, and can be caught by the calling function.
    // This is especially important for 401 errors, which AuthContext will handle.
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => API.post('/auth/register', userData),
  login: (credentials) => API.post('/auth/login', credentials),
  logout: () => API.post('/auth/logout'),
  getMe: () => API.get('/auth/me'),
  updateDetails: (userData) => API.put('/auth/updatedetails', userData),
  updatePassword: (passwordData) => API.put('/auth/updatepassword', passwordData),
  forgotPassword: (email) => API.post('/auth/forgotpassword', { email }),
  verifyResetCode: (data) => API.post('/auth/verify-reset-code', data),
  resetPassword: (data) => API.put('/auth/resetpassword', data),
  verifyUser: (verificationData) => API.post('/auth/verify', verificationData),
  resendVerification: (emailData) => API.post('/auth/resend-verification', emailData)
};

// User API calls
export const userAPI = {
  getUsers: () => API.get('/users'),
  getUser: (id) => API.get(`/users/${id}`),
  updateUser: (id, userData) => API.put(`/users/${id}`, userData),
  deleteUser: (id) => API.delete(`/users/${id}`)
};

// Theme API calls
export const themeAPI = {
  getTheme: () => API.get('/theme'),
  updateTheme: (data) => API.put('/theme', data)
};

// Service API calls
export const serviceAPI = {
  getServices: () => API.get('/services'),
  getService: (id) => API.get(`/services/${id}`),
  getServiceReviews: (serviceId) => API.get(`/services/${serviceId}/reviews`),
  addReview: (serviceId, reviewData) => API.post(`/services/${serviceId}/reviews`, reviewData),
  createService: (serviceData) => {
    const formData = new FormData();

    // Add only the fields that should be created to form data
    const fieldsToInclude = ['name', 'description', 'duration', 'price', 'category', 'branchId', 'isActive'];
    fieldsToInclude.forEach(key => {
      if (serviceData[key] !== undefined && serviceData[key] !== null) {
        formData.append(key, serviceData[key]);
      }
    });

    // Add image file if it exists
    if (serviceData.imageFile) {
      formData.append('image', serviceData.imageFile);
    }

    return API.post('/services', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  updateService: (id, serviceData) => {
    const formData = new FormData();

    // Add only the fields that should be updated to form data (excluding imageFile and the original image field)
    const fieldsToInclude = ['name', 'description', 'duration', 'price', 'category', 'branchId', 'isActive', 'position'];
    fieldsToInclude.forEach(key => {
      if (serviceData[key] !== undefined && serviceData[key] !== null) {
        formData.append(key, serviceData[key]);
      }
    });

    // Add image file if it exists (this means a new image is being uploaded)
    if (serviceData.imageFile) {
      formData.append('image', serviceData.imageFile);
    }

    return API.put(`/services/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  deleteService: (id) => API.delete(`/services/${id}`),
  getServicesByBranch: (branchId) => API.get(`/services/branch/${branchId}`)
};

// Appointment API calls
export const appointmentAPI = {
  getAppointments: () => API.get('/appointments'),
  getAppointment: (id) => API.get(`/appointments/${id}`),
  createAppointment: (appointmentData) => API.post('/appointments', appointmentData),
  updateAppointment: (id, appointmentData) => API.put(`/appointments/${id}`, appointmentData),
  updateAppointmentStatus: (id, status) => API.put(`/appointments/${id}/status`, { status }),
  deleteAppointment: (id) => API.delete(`/appointments/${id}`),
  getAvailableSlots: (serviceId, staffId, date) =>
    API.get(`/appointments/available-slots?serviceId=${serviceId}&staffId=${staffId}&date=${date}`)
};

// Staff API calls
export const staffAPI = {
  getStaff: () => API.get('/staff'),
  getStaffMember: (id) => API.get(`/staff/${id}`),
  createStaff: (staffData) => API.post('/staff', staffData),
  updateStaff: (id, staffData) => API.put(`/staff/${id}`, staffData),
  deleteStaff: (id) => API.delete(`/staff/${id}`),
  getStaffAppointments: (id) => API.get(`/staff/${id}/appointments`),
  getStaffByBranch: (branchId) => API.get(`/staff/branch/${branchId}`),
  getStaffSchedule: (id) => API.get(`/staff/${id}/schedule`),
  updateStaffSchedule: (id, schedules) => API.put(`/staff/${id}/schedule`, { schedules })
};

// Payment API calls (now promotion-focused)
export const paymentAPI = {
  applyPromotion: (promotionData) => API.post('/payments/apply-promotion', promotionData),
  redeemPoints: (data) => API.post('/payments/redeem-points', data),
  getPayments: () => API.get('/payments'),
  getPayment: (id) => API.get(`/payments/${id}`),
  getPaymentReceipt: (id) => API.get(`/payments/${id}/receipt`)
};

// Promotion API calls
export const promotionAPI = {
  getPromotions: () => API.get('/promotions'),
  createPromotion: (promoData) => API.post('/promotions', promoData),
  updatePromotion: (id, promoData) => API.put(`/promotions/${id}`, promoData),
  deletePromotion: (id) => API.delete(`/promotions/${id}`),
  validatePromotion: (code) => API.post('/promotions/validate', { code })
};

// Gallery API calls
export const galleryAPI = {
  getGalleryItems: () => API.get('/gallery'),
  createGalleryItem: (galleryData) => {
    const formData = new FormData();
    formData.append('title', galleryData.title);
    formData.append('description', galleryData.description);
    if (galleryData.categoryId) {
      formData.append('categoryId', galleryData.categoryId);
    }
    if (galleryData.images && galleryData.images.length > 0) {
      // Append multiple images
      for (let i = 0; i < galleryData.images.length; i++) {
        formData.append('images', galleryData.images[i]);
      }
    }
    return API.post('/gallery', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  updateGalleryItem: (id, galleryData) => {
    const formData = new FormData();
    formData.append('title', galleryData.title);
    formData.append('description', galleryData.description);
    if (galleryData.categoryId) {
      formData.append('categoryId', galleryData.categoryId);
    }
    if (galleryData.images && galleryData.images.length > 0) {
      // Append multiple images
      for (let i = 0; i < galleryData.images.length; i++) {
        formData.append('images', galleryData.images[i]);
      }
    }
    return API.put(`/gallery/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  deleteGalleryItem: (id) => API.delete(`/gallery/${id}`)
};

// Categories API calls
export const categoryAPI = {
  getCategories: () => API.get('/categories'),
  createCategory: (categoryData) => API.post('/categories', categoryData),
  updateCategory: (id, categoryData) => API.put(`/categories/${id}`, categoryData),
  deleteCategory: (id) => API.delete(`/categories/${id}`)
};

// Notification API calls
export const notificationAPI = {
  getNotifications: () => API.get('/notifications'),
  getNotification: (id) => API.get(`/notifications/${id}`),
  updateNotification: (id) => API.put(`/notifications/${id}`),
  deleteNotification: (id) => API.delete(`/notifications/${id}`),
  sendNotification: (notificationData) => API.post('/notifications', notificationData),
  sendAppointmentReminder: (reminderData) => API.post('/notifications/appointment-reminder', reminderData),
  markAllAsRead: () => API.put('/notifications/mark-all-read'),
  getUnreadCount: () => API.get('/notifications/unread-count')
};

// Newsletter API calls
export const newsletterAPI = {
  subscribe: (email) => API.post('/newsletter/subscribe', { email }),
  unsubscribe: (email) => API.post('/newsletter/unsubscribe', { email })
};

// Calendar API calls
export const calendarAPI = {
  getStatus: () => API.get('/calendar/status'),
  getSettings: () => API.get('/calendar/settings'),
  updateSettings: (settings) => API.put('/calendar/settings', settings),
  syncAppointment: (appointmentId, platforms) => API.post(`/calendar/sync/${appointmentId}`, { platforms })
};

// Webhook API calls
export const webhookAPI = {
  getWebhooks: () => API.get('/webhooks'),
  getWebhook: (id) => API.get(`/webhooks/${id}`),
  createWebhook: (webhookData) => API.post('/webhooks', webhookData),
  updateWebhook: (id, webhookData) => API.put(`/webhooks/${id}`, webhookData),
  deleteWebhook: (id) => API.delete(`/webhooks/${id}`),
  testWebhook: (id) => API.post(`/webhooks/${id}/test`)
};

// Waiting List API calls
export const waitingListAPI = {
  join: (data) => API.post('/waiting-list/join', data),
  getList: () => API.get('/waiting-list'),
  leave: (id) => API.delete(`/waiting-list/${id}`)
};

// Settings API calls
export const settingsAPI = {
  getSettings: () => API.get('/settings'),
  getSetting: (key) => API.get(`/settings/${key}`),
  updateSetting: (key, data) => API.put(`/settings/${key}`, data)
};

// Schedule API calls
export const scheduleAPI = {
  getStoreHours: () => API.get('/schedule/hours'),
  updateStoreHours: (hours) => API.put('/schedule/hours', { hours }),
  getStoreExceptions: () => API.get('/schedule/exceptions'),
  createStoreException: (data) => API.post('/schedule/exceptions', data),
  updateStoreException: (id, data) => API.put(`/schedule/exceptions/${id}`, data),
  deleteStoreException: (id) => API.delete(`/schedule/exceptions/${id}`)
};

export default API;