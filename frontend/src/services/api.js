// API service wrapper for CyberGuard AI Backend
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const getHeaders = (includeAuth = true) => {
  const headers = { 'Content-Type': 'application/json' };
  if (includeAuth) {
    const token = localStorage.getItem('cg_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
};

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data.message || (data.errors && data.errors.join(', ')) || `HTTP ${res.status} Error`;
    throw new Error(errorMsg);
  }
  return data;
};

export const api = {
  // Authentication
  auth: {
    login: async (credentials) => {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: getHeaders(false),
        body: JSON.stringify(credentials)
      });
      return handleResponse(res);
    },
    register: async (userData) => {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: getHeaders(false),
        body: JSON.stringify(userData)
      });
      return handleResponse(res);
    },
    me: async () => {
      const res = await fetch(`${BASE_URL}/auth/me`, {
        headers: getHeaders(true)
      });
      return handleResponse(res);
    },
    getUsers: async () => {
      const res = await fetch(`${BASE_URL}/auth/users`, {
        headers: getHeaders(true)
      });
      return handleResponse(res);
    }
  },

  // Network Traffic
  traffic: {
    getTraffic: async (limit = 30, protocol = '') => {
      const query = new URLSearchParams({ limit, ...(protocol ? { protocol } : {}) });
      const res = await fetch(`${BASE_URL}/traffic?${query}`);
      return handleResponse(res);
    },
    sendPacket: async (packet) => {
      const res = await fetch(`${BASE_URL}/traffic`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify(packet)
      });
      return handleResponse(res);
    },
    analyzeSandbox: async (packet) => {
      const res = await fetch(`${BASE_URL}/traffic/analyze`, {
        method: 'POST',
        headers: getHeaders(false),
        body: JSON.stringify(packet)
      });
      return handleResponse(res);
    },
    simulate: async () => {
      const res = await fetch(`${BASE_URL}/traffic/simulate`, {
        method: 'POST',
        headers: getHeaders(true)
      });
      return handleResponse(res);
    },
    deletePacket: async (id) => {
      const res = await fetch(`${BASE_URL}/traffic/${id}`, {
        method: 'DELETE',
        headers: getHeaders(true)
      });
      return handleResponse(res);
    }
  },

  // Threats & Analytics
  threats: {
    getThreats: async (severity = '') => {
      const query = severity ? `?severity=${severity}` : '';
      const res = await fetch(`${BASE_URL}/threats${query}`);
      return handleResponse(res);
    },
    getStats: async () => {
      const res = await fetch(`${BASE_URL}/threats/stats`);
      return handleResponse(res);
    }
  },

  // Alerts Management (CRUD)
  alerts: {
    getAlerts: async (status = '', severity = '') => {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (severity) params.append('severity', severity);
      const res = await fetch(`${BASE_URL}/alerts?${params}`);
      return handleResponse(res);
    },
    createAlert: async (alertData) => {
      const res = await fetch(`${BASE_URL}/alerts`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify(alertData)
      });
      return handleResponse(res);
    },
    updateAlert: async (id, updateData) => {
      const res = await fetch(`${BASE_URL}/alerts/${id}`, {
        method: 'PUT',
        headers: getHeaders(true),
        body: JSON.stringify(updateData)
      });
      return handleResponse(res);
    },
    blockIp: async (id) => {
      const res = await fetch(`${BASE_URL}/alerts/${id}/block-ip`, {
        method: 'POST',
        headers: getHeaders(true)
      });
      return handleResponse(res);
    },
    deleteAlert: async (id) => {
      const res = await fetch(`${BASE_URL}/alerts/${id}`, {
        method: 'DELETE',
        headers: getHeaders(true)
      });
      return handleResponse(res);
    }
  },

  // Security Logs
  logs: {
    getLogs: async (action = '') => {
      const query = action ? `?action=${action}` : '';
      const res = await fetch(`${BASE_URL}/logs${query}`);
      return handleResponse(res);
    },
    createLog: async (logData) => {
      const res = await fetch(`${BASE_URL}/logs`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify(logData)
      });
      return handleResponse(res);
    },
    clearLogs: async () => {
      const res = await fetch(`${BASE_URL}/logs`, {
        method: 'DELETE',
        headers: getHeaders(true)
      });
      return handleResponse(res);
    }
  }
};
