import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '../views/Dashboard.vue';
import Calls from '../views/Calls.vue';
import Leads from '../views/Leads.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: Dashboard,
    },
    {
      path: '/calls',
      name: 'calls',
      component: Calls,
    },
    {
      path: '/leads',
      name: 'leads',
      component: Leads,
    },
  ],
});

export default router;
