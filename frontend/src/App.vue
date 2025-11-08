<template>
  <div id="app" class="min-h-screen bg-gray-900">
    <nav class="bg-gray-800 border-b border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center">
            <router-link to="/" class="text-white text-xl font-bold">
              🤖 AI Phone System
            </router-link>
            <div class="ml-10 flex items-baseline space-x-4">
              <router-link
                to="/"
                class="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                active-class="bg-gray-900 text-white"
              >
                Dashboard
              </router-link>
              <router-link
                to="/calls"
                class="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                active-class="bg-gray-900 text-white"
              >
                Calls
              </router-link>
              <router-link
                to="/leads"
                class="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                active-class="bg-gray-900 text-white"
              >
                Leads
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup>
</script>

<style scoped>
</style>
