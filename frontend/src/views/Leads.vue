<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-3xl font-bold text-white">Leads</h1>
      <button
        @click="refreshLeads"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2"
      >
        <i class="pi pi-refresh"></i>
        Refresh
      </button>
    </div>

    <div v-if="loading" class="text-center py-12">
      <div class="text-gray-400 text-lg">Loading leads...</div>
    </div>

    <div v-else-if="leads.length === 0" class="text-center py-12">
      <div class="text-gray-400 text-lg">No leads found</div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="lead in leads"
        :key="lead.id"
        class="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-white">{{ lead.name || 'Unknown' }}</h3>
          <span
            class="px-2 py-1 rounded text-xs font-medium"
            :class="getLeadStatusClass(lead.status)"
          >
            {{ lead.status }}
          </span>
        </div>

        <div class="space-y-3 text-gray-300">
          <div v-if="lead.email" class="flex items-center gap-2">
            <i class="pi pi-envelope text-gray-400"></i>
            <a :href="`mailto:${lead.email}`" class="hover:text-blue-400">
              {{ lead.email }}
            </a>
          </div>

          <div v-if="lead.phone" class="flex items-center gap-2">
            <i class="pi pi-phone text-gray-400"></i>
            <a :href="`tel:${lead.phone}`" class="hover:text-blue-400">
              {{ lead.phone }}
            </a>
          </div>

          <div v-if="lead.business_type" class="flex items-center gap-2">
            <i class="pi pi-briefcase text-gray-400"></i>
            <span>{{ lead.business_type }}</span>
          </div>

          <div class="flex items-center gap-2">
            <i class="pi pi-calendar text-gray-400"></i>
            <span class="text-sm">{{ formatDate(lead.created_at) }}</span>
          </div>
        </div>

        <div v-if="lead.notes" class="mt-4 pt-4 border-t border-gray-700">
          <button
            @click="viewNotes(lead)"
            class="text-blue-400 hover:text-blue-300 text-sm font-medium"
          >
            View Notes
          </button>
        </div>
      </div>
    </div>

    <!-- Lead Notes Modal -->
    <div
      v-if="selectedLead"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @click="closeNotes"
    >
      <div
        class="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-gray-700"
        @click.stop
      >
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-2xl font-bold text-white">{{ selectedLead.name || 'Lead Details' }}</h2>
            <button
              @click="closeNotes"
              class="text-gray-400 hover:text-white"
            >
              <i class="pi pi-times text-xl"></i>
            </button>
          </div>

          <div class="space-y-4">
            <div v-if="selectedLead.email">
              <label class="text-gray-400 text-sm">Email</label>
              <div class="text-white">{{ selectedLead.email }}</div>
            </div>

            <div v-if="selectedLead.phone">
              <label class="text-gray-400 text-sm">Phone</label>
              <div class="text-white">{{ selectedLead.phone }}</div>
            </div>

            <div v-if="selectedLead.business_type">
              <label class="text-gray-400 text-sm">Business Type</label>
              <div class="text-white">{{ selectedLead.business_type }}</div>
            </div>

            <div>
              <label class="text-gray-400 text-sm">Status</label>
              <div>
                <span
                  class="px-2 py-1 rounded text-xs font-medium"
                  :class="getLeadStatusClass(selectedLead.status)"
                >
                  {{ selectedLead.status }}
                </span>
              </div>
            </div>

            <div>
              <label class="text-gray-400 text-sm">Created</label>
              <div class="text-white">{{ formatDate(selectedLead.created_at) }}</div>
            </div>

            <div v-if="selectedLead.call_sid">
              <label class="text-gray-400 text-sm">Call SID</label>
              <div class="text-white font-mono text-sm">{{ selectedLead.call_sid }}</div>
            </div>

            <div v-if="selectedLead.notes">
              <label class="text-gray-400 text-sm">Conversation Notes</label>
              <div class="bg-gray-900 rounded p-4 text-gray-300 text-sm whitespace-pre-wrap max-h-60 overflow-y-auto">
                {{ selectedLead.notes }}
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
const selectedLead = ref(null);

const leads = computed(() => callStore.leads);
const loading = computed(() => callStore.loading);

onMounted(async () => {
  await callStore.fetchLeads();
});

async function refreshLeads() {
  await callStore.fetchLeads();
}

function viewNotes(lead) {
  selectedLead.value = lead;
}

function closeNotes() {
  selectedLead.value = null;
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
