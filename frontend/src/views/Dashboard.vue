<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-3xl font-bold text-white mb-8">Dashboard</h1>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-400 text-sm">Total Calls</p>
            <p class="text-3xl font-bold text-white mt-2">{{ calls.length }}</p>
          </div>
          <i class="pi pi-phone text-4xl text-blue-500"></i>
        </div>
      </div>

      <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-400 text-sm">Active Calls</p>
            <p class="text-3xl font-bold text-white mt-2">{{ activeCalls.length }}</p>
          </div>
          <i class="pi pi-phone text-4xl text-green-500"></i>
        </div>
      </div>

      <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-400 text-sm">Total Leads</p>
            <p class="text-3xl font-bold text-white mt-2">{{ leads.length }}</p>
          </div>
          <i class="pi pi-users text-4xl text-purple-500"></i>
        </div>
      </div>
    </div>

    <!-- Make Outbound Call -->
    <div class="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
      <h2 class="text-xl font-bold text-white mb-4">Make Outbound Call</h2>
      <div class="flex gap-4">
        <input
          v-model="phoneNumber"
          type="tel"
          placeholder="Enter phone number (e.g., +1234567890)"
          class="flex-1 bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          @click="initiateCall"
          :disabled="calling || !phoneNumber"
          class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-md font-medium transition-colors flex items-center gap-2"
        >
          <i class="pi pi-phone"></i>
          {{ calling ? 'Calling...' : 'Call' }}
        </button>
      </div>
      <p v-if="callError" class="text-red-400 mt-2">{{ callError }}</p>
      <p v-if="callSuccess" class="text-green-400 mt-2">{{ callSuccess }}</p>
    </div>

    <!-- Recent Activity -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Recent Calls -->
      <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 class="text-xl font-bold text-white mb-4">Recent Calls</h2>
        <div v-if="loading" class="text-gray-400">Loading...</div>
        <div v-else-if="calls.length === 0" class="text-gray-400">No calls yet</div>
        <div v-else class="space-y-3">
          <div
            v-for="call in recentCalls"
            :key="call.id"
            class="bg-gray-700 rounded-lg p-4"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="text-white font-medium">
                {{ call.direction === 'inbound' ? '📞 Inbound' : '📱 Outbound' }}
              </span>
              <span
                class="px-2 py-1 rounded text-xs font-medium"
                :class="getStatusClass(call.status)"
              >
                {{ call.status }}
              </span>
            </div>
            <div class="text-gray-400 text-sm space-y-1">
              <div>From: {{ call.from_number }}</div>
              <div>To: {{ call.to_number }}</div>
              <div>{{ formatDate(call.started_at) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Leads -->
      <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 class="text-xl font-bold text-white mb-4">Recent Leads</h2>
        <div v-if="loading" class="text-gray-400">Loading...</div>
        <div v-else-if="leads.length === 0" class="text-gray-400">No leads yet</div>
        <div v-else class="space-y-3">
          <div
            v-for="lead in recentLeads"
            :key="lead.id"
            class="bg-gray-700 rounded-lg p-4"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="text-white font-medium">{{ lead.name || 'Unknown' }}</span>
              <span
                class="px-2 py-1 rounded text-xs font-medium"
                :class="getLeadStatusClass(lead.status)"
              >
                {{ lead.status }}
              </span>
            </div>
            <div class="text-gray-400 text-sm space-y-1">
              <div v-if="lead.email">📧 {{ lead.email }}</div>
              <div v-if="lead.phone">📞 {{ lead.phone }}</div>
              <div v-if="lead.business_type">🏢 {{ lead.business_type }}</div>
              <div>{{ formatDate(lead.created_at) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useCallStore } from '../stores/calls';

const callStore = useCallStore();
const phoneNumber = ref('');
const calling = ref(false);
const callError = ref('');
const callSuccess = ref('');

const calls = computed(() => callStore.calls);
const activeCalls = computed(() => callStore.activeCalls);
const leads = computed(() => callStore.leads);
const loading = computed(() => callStore.loading);

const recentCalls = computed(() => calls.value.slice(0, 5));
const recentLeads = computed(() => leads.value.slice(0, 5));

let refreshInterval;

onMounted(async () => {
  await Promise.all([
    callStore.fetchCalls(),
    callStore.fetchActiveCalls(),
    callStore.fetchLeads(),
  ]);

  // Auto-refresh every 5 seconds
  refreshInterval = setInterval(async () => {
    await callStore.fetchActiveCalls();
  }, 5000);
});

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});

async function initiateCall() {
  if (!phoneNumber.value) return;

  calling.value = true;
  callError.value = '';
  callSuccess.value = '';

  try {
    const result = await callStore.makeOutboundCall(phoneNumber.value);
    callSuccess.value = `Call initiated successfully! Call SID: ${result.call_sid}`;
    phoneNumber.value = '';
    
    // Refresh active calls
    await callStore.fetchActiveCalls();
  } catch (error) {
    callError.value = error.message || 'Failed to initiate call';
  } finally {
    calling.value = false;
  }
}

function getStatusClass(status) {
  const classes = {
    initiated: 'bg-blue-900 text-blue-200',
    ringing: 'bg-yellow-900 text-yellow-200',
    answered: 'bg-green-900 text-green-200',
    completed: 'bg-gray-600 text-gray-200',
    'in-progress': 'bg-purple-900 text-purple-200',
  };
  return classes[status] || 'bg-gray-600 text-gray-200';
}

function getLeadStatusClass(status) {
  const classes = {
    new: 'bg-blue-900 text-blue-200',
    contacted: 'bg-yellow-900 text-yellow-200',
    qualified: 'bg-green-900 text-green-200',
    converted: 'bg-purple-900 text-purple-200',
  };
  return classes[status] || 'bg-gray-600 text-gray-200';
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString();
}
</script>
