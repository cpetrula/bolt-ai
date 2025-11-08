<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-3xl font-bold text-white">Call History</h1>
      <button
        @click="refreshCalls"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2"
      >
        <i class="pi pi-refresh"></i>
        Refresh
      </button>
    </div>

    <div v-if="loading" class="text-center py-12">
      <div class="text-gray-400 text-lg">Loading calls...</div>
    </div>

    <div v-else-if="calls.length === 0" class="text-center py-12">
      <div class="text-gray-400 text-lg">No calls found</div>
    </div>

    <div v-else class="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-700">
          <thead class="bg-gray-900">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Direction
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                From
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                To
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Duration
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Started
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-gray-800 divide-y divide-gray-700">
            <tr v-for="call in calls" :key="call.id" class="hover:bg-gray-750">
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="flex items-center gap-2 text-white">
                  <i :class="call.direction === 'inbound' ? 'pi pi-arrow-down text-green-500' : 'pi pi-arrow-up text-blue-500'"></i>
                  {{ call.direction }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-300">
                {{ call.from_number || 'N/A' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-300">
                {{ call.to_number || 'N/A' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="px-2 py-1 rounded text-xs font-medium"
                  :class="getStatusClass(call.status)"
                >
                  {{ call.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-300">
                {{ formatDuration(call.duration) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-300">
                {{ formatDate(call.started_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <button
                  @click="viewDetails(call)"
                  class="text-blue-400 hover:text-blue-300 font-medium"
                >
                  View
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Call Details Modal -->
    <div
      v-if="selectedCall"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @click="closeDetails"
    >
      <div
        class="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-gray-700"
        @click.stop
      >
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-2xl font-bold text-white">Call Details</h2>
            <button
              @click="closeDetails"
              class="text-gray-400 hover:text-white"
            >
              <i class="pi pi-times text-xl"></i>
            </button>
          </div>

          <div class="space-y-4">
            <div>
              <label class="text-gray-400 text-sm">Call SID</label>
              <div class="text-white font-mono text-sm">{{ selectedCall.call_sid }}</div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-gray-400 text-sm">Direction</label>
                <div class="text-white">{{ selectedCall.direction }}</div>
              </div>
              <div>
                <label class="text-gray-400 text-sm">Status</label>
                <div>
                  <span
                    class="px-2 py-1 rounded text-xs font-medium"
                    :class="getStatusClass(selectedCall.status)"
                  >
                    {{ selectedCall.status }}
                  </span>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-gray-400 text-sm">From</label>
                <div class="text-white">{{ selectedCall.from_number || 'N/A' }}</div>
              </div>
              <div>
                <label class="text-gray-400 text-sm">To</label>
                <div class="text-white">{{ selectedCall.to_number || 'N/A' }}</div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-gray-400 text-sm">Started</label>
                <div class="text-white">{{ formatDate(selectedCall.started_at) }}</div>
              </div>
              <div>
                <label class="text-gray-400 text-sm">Duration</label>
                <div class="text-white">{{ formatDuration(selectedCall.duration) }}</div>
              </div>
            </div>

            <div v-if="selectedCall.transcript">
              <label class="text-gray-400 text-sm">Transcript</label>
              <div class="bg-gray-900 rounded p-4 text-gray-300 text-sm whitespace-pre-wrap max-h-60 overflow-y-auto">
                {{ selectedCall.transcript }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useCallStore } from '../stores/calls';

const callStore = useCallStore();
const selectedCall = ref(null);

const calls = computed(() => callStore.calls);
const loading = computed(() => callStore.loading);

onMounted(async () => {
  await callStore.fetchCalls();
});

async function refreshCalls() {
  await callStore.fetchCalls();
}

function viewDetails(call) {
  selectedCall.value = call;
}

function closeDetails() {
  selectedCall.value = null;
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

function formatDuration(seconds) {
  if (!seconds) return '0s';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString();
}
</script>
