// frontend/src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const routes = [
  {
    path: "/",
    name: "Landing",
    component: () => import("@/views/LandingView.vue"),
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/LoginView.vue"),
  },
  {
    path: "/register",
    name: "Register",
    component: () => import("@/views/RegisterView.vue"),
  },
  {
    path: "/forgot-password",
    name: "ForgotPassword",
    component: () => import("@/views/ForgotPasswordView.vue"),
  },
  {
    path: "/reset-password",
    name: "ResetPassword",
    component: () => import("@/views/ResetPasswordView.vue"),
  },
  {
    path: "/verify-email",
    name: "VerifyEmail",
    component: () => import("@/views/VerifyEmailView.vue"),
  },
  {
    path: "/menu",
    name: "MenuPublic",
    component: () => import("@/views/MenuView.vue"),
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: () => import("@/views/AdminView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/admin",
    redirect: "/dashboard",
  },
  {
    path: "/super-admin",
    name: "SuperAdmin",
    component: () => import("@/views/SuperAdminView.vue"),
    meta: { requiresAuth: true, requiresSuperAdmin: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const auth = useAuthStore();

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return next("/login");
  }

  // Block unverified users from accessing protected pages
  if (to.meta.requiresAuth && auth.isLoggedIn && !auth.isEmailVerified) {
    return next(`/verify-email?email=${encodeURIComponent(auth.user?.email || "")}`);
  }

  if (to.meta.requiresSuperAdmin && !auth.isSuperAdmin) {
    return next("/admin");
  }

  next();
});

export default router;