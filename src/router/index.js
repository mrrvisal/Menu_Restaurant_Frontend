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
    meta: { guestOnly: true },
  },
  {
    path: "/login/super-admin",
    name: "SuperAdminLogin",
    component: () => import("@/views/SuperAdminLoginView.vue"),
    meta: { guestOnly: true },
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
    path: "/demo",
    name: "DemoMenu",
    component: () => import("@/views/DemoMenuView.vue"),
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
    // Kitchen Display System — a dedicated, chrome-free board for the
    // kitchen screen. Reuses the same SSE order stream as the dashboard.
    path: "/kds",
    name: "Kds",
    component: () => import("@/views/KdsView.vue"),
    meta: { requiresAuth: true },
  },
  {
    // Guest order tracking — live status of one order (public, token link)
    path: "/track",
    name: "Track",
    component: () => import("@/views/TrackView.vue"),
  },
  {
    path: "/super-admin",
    name: "SuperAdmin",
    component: () => import("@/views/SuperAdminView.vue"),
    meta: { requiresAuth: true, requiresSuperAdmin: true },
  },
  {
    // 404 — any path that doesn't match a route above lands here.
    // The :pathMatch syntax keeps the full unknown path available as
    // route.params.pathMatch (and route.fullPath) for display.
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/NotFoundView.vue"),
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

  // Signed-in users don't belong on the auth pages
  if (to.meta.guestOnly && auth.isLoggedIn) {
    return next(auth.isSuperAdmin ? "/super-admin" : "/dashboard");
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