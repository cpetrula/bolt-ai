import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  // Calls
  async getCalls(limit = 50, offset = 0) {
    const response = await api.get('/calls', { params: { limit, offset } });
    return response.data;
  },

  async getActiveCalls() {
    const response = await api.get('/active-calls');
    return response.data;
  },

  // Leads
  async getLeads(limit = 50, offset = 0) {
    const response = await api.get('/leads', { params: { limit, offset } });
    return response.data;
  },

  // Make outbound call
  async makeOutboundCall(toNumber, metadata = {}) {
    const response = await api.post('/outbound-call', {
      to_number: toNumber,
      metadata: JSON.stringify(metadata),
    });
    return response.data;
  },

  // Health check
  async healthCheck() {
    const response = await api.get('/health');
    return response.data;
  },
};
