// frontend/src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const routes = [
  {
    path: '/',
    component: () => import('@/views/MenuView.vue'),
    meta: { title: 'ម៉ឺនុយ' },
  },
  {
    path: '/admin',
    component: () => import('@/views/AdminView.vue'),
    meta: { title: 'Admin', requiresAuth: true },
  },
  {
    path: '/login',
    component: () => import('@/views/LoginView.vue'),
    meta: { title: 'Login' },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const auth = useAuthStore();
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return { path: '/login', query: { redirect: to.fullPath } };
  }
});

export default router;
