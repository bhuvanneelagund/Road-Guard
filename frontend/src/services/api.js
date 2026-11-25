import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('rg_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors cleanly
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized, clear invalid token
      // localStorage.removeItem('rg_token');
      // localStorage.removeItem('rg_user');
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  }
};

// Dashboard Services
export const dashboardService = {
  getStats: async () => {
    const res = await api.get('/dashboard/stats');
    return res.data;
  },
  getActivity: async () => {
    const res = await api.get('/dashboard/activity');
    return res.data;
  }
};

// AI Detection Services
export const detectionService = {
  uploadImage: async (formData) => {
    const res = await api.post('/detections/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  uploadVideo: async (formData, onProgress) => {
    const res = await api.post('/detections/video', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      }
    });
    return res.data;
  },
  listDetections: async (params) => {
    const res = await api.get('/detections', { params });
    return res.data;
  },
  getDetection: async (id) => {
    const res = await api.get(`/detections/${id}`);
    return res.data;
  },
  deleteDetection: async (id) => {
    const res = await api.delete(`/detections/${id}`);
    return res.data;
  }
};

// Roads & Road Health Passport
export const roadService = {
  listRoads: async (params) => {
    const res = await api.get('/roads', { params });
    return res.data;
  },
  getRoad: async (id) => {
    const res = await api.get(`/roads/${id}`);
    return res.data;
  },
  createRoad: async (roadData) => {
    const res = await api.post('/roads', roadData);
    return res.data;
  },
  getHealthPassport: async (id) => {
    const res = await api.get(`/roads/${id}/health`);
    return res.data;
  },
  getHistory: async (id) => {
    const res = await api.get(`/roads/${id}/history`);
    return res.data;
  }
};

// Priority & Accident Risk
export const priorityService = {
  getPriorities: async () => {
    const res = await api.get('/priority');
    return res.data;
  },
  calculatePriority: async (weights) => {
    const res = await api.post('/priority/calculate', weights);
    return res.data;
  }
};

// Complaints
export const complaintService = {
  submitComplaint: async (formData) => {
    const res = await api.post('/complaints', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  listComplaints: async (params) => {
    const res = await api.get('/complaints', { params });
    return res.data;
  },
  getComplaint: async (id) => {
    const res = await api.get(`/complaints/${id}`);
    return res.data;
  },
  updateStatus: async (id, statusData) => {
    const res = await api.put(`/complaints/${id}/status`, statusData);
    return res.data;
  }
};

// Repairs & Verification
export const repairService = {
  listRepairs: async (params) => {
    const res = await api.get('/repairs', { params });
    return res.data;
  },
  createRepair: async (repairData) => {
    const res = await api.post('/repairs', repairData);
    return res.data;
  },
  submitVerification: async (formData) => {
    const res = await api.post('/verification', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  getVerification: async (id) => {
    const res = await api.get(`/verification/${id}`);
    return res.data;
  },
  approveVerification: async (id, payload) => {
    const res = await api.put(`/verification/${id}/approve`, payload);
    return res.data;
  }
};

// Cost Estimator
export const costService = {
  estimateCost: async (params) => {
    const res = await api.post('/cost-estimator', params);
    return res.data;
  }
};

// Future Degradation Prediction
export const predictionService = {
  getPrediction: async (roadId) => {
    const res = await api.get(`/prediction/${roadId}`);
    return res.data;
  }
};

// Waterlogging
export const waterloggingService = {
  detect: async (formData) => {
    const res = await api.post('/waterlogging/detect', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  list: async () => {
    const res = await api.get('/waterlogging');
    return res.data;
  }
};

// Contractors
export const contractorService = {
  list: async () => {
    const res = await api.get('/contractors');
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/contractors', data);
    return res.data;
  }
};

// System Health
export const systemService = {
  getHealth: async () => {
    const res = await api.get('/health');
    return res.data;
  }
};

export default api;
