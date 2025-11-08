import { defineStore } from 'pinia';
import { apiService } from '../services/api';

export const useCallStore = defineStore('calls', {
  state: () => ({
    calls: [],
    activeCalls: [],
    leads: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchCalls() {
      this.loading = true;
      this.error = null;
      try {
        const data = await apiService.getCalls();
        this.calls = data.calls || [];
      } catch (error) {
        this.error = error.message;
        console.error('Error fetching calls:', error);
      } finally {
        this.loading = false;
      }
    },

    async fetchActiveCalls() {
      try {
        const data = await apiService.getActiveCalls();
        this.activeCalls = data.active_calls || [];
      } catch (error) {
        console.error('Error fetching active calls:', error);
      }
    },

    async fetchLeads() {
      this.loading = true;
      this.error = null;
      try {
        const data = await apiService.getLeads();
        this.leads = data.leads || [];
      } catch (error) {
        this.error = error.message;
        console.error('Error fetching leads:', error);
      } finally {
        this.loading = false;
      }
    },

    async makeOutboundCall(toNumber, metadata = {}) {
      try {
        const result = await apiService.makeOutboundCall(toNumber, metadata);
        // Refresh calls after initiating
        await this.fetchCalls();
        return result;
      } catch (error) {
        this.error = error.message;
        console.error('Error making outbound call:', error);
        throw error;
      }
    },
  },
});
