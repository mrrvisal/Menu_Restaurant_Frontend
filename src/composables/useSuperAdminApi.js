// ─── SUPER ADMIN API ────────────────────────────────────────────
// Every platform-wide request the super-admin dashboard makes lives here, so
// the view only owns state + UI. Responses are normalised on the way out:
//
//   /admin/admins answers camelCase  { fullName, emailVerified, lastLoginAt }
//   /admin/users  answers SQL rows   { full_name, email_verified_at, … }
//
// Both are mapped to ONE member shape so lists, rows and drawers never have to
// ask which endpoint they came from (that mismatch used to render every admin
// as "not verified" and hide the restaurant columns).
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL;
const url = (path) => `${API_BASE}/api${path}`;

// {
//   id, email, fullName, role, status, verified,
//   lastLoginAt, createdAt, restaurantName, restaurantCount
// }
function normalizeMember(raw = {}) {
  return {
    id: raw.id,
    email: raw.email || "",
    fullName: raw.fullName || raw.full_name || "",
    role: raw.role || "owner",
    status: raw.status || "active",
    verified: raw.emailVerified ?? Boolean(raw.email_verified_at),
    lastLoginAt: raw.lastLoginAt || raw.last_login_at || null,
    createdAt: raw.createdAt || raw.created_at || null,
    restaurantName: raw.restaurantName || raw.restaurant_name || "",
    restaurantCount: raw.restaurantCount || 0,
  };
}

/* ── Reads ─────────────────────────────────────────────────── */
async function fetchDashboardStats() {
  const { data } = await axios.get(url("/admin/stats"));
  return data;
}

async function fetchUsers() {
  const { data } = await axios.get(url("/admin/users"));
  return (data || []).map(normalizeMember);
}

// role: "owner" | "super_admin" — one endpoint serves both admin tabs
async function fetchMembers(role) {
  const { data } = await axios.get(url("/admin/admins"), {
    params: { role, limit: 100 },
  });
  return (data?.admins || []).map(normalizeMember);
}

async function fetchMemberStats() {
  const { data } = await axios.get(url("/admin/admins/stats"));
  return data?.stats || null;
}

async function fetchRestaurants() {
  const { data } = await axios.get(url("/admin/restaurants"));
  return data || [];
}

async function fetchOrders(status) {
  const { data } = await axios.get(url("/admin/orders"), {
    params: status ? { status } : {},
  });
  return data || [];
}

async function fetchAccess() {
  const { data } = await axios.get(url("/admin/access"));
  return {
    stats: data?.stats || {},
    sessions: data?.sessions || [],
    logins: data?.logins || [],
    activities: data?.activities || [],
  };
}

async function fetchLoginHistory(userId) {
  const { data } = await axios.get(url(`/admin/users/${userId}/login-history`));
  return data || [];
}

/* ── Writes ────────────────────────────────────────────────── */
function createMember(payload) {
  return axios.post(url("/admin/admins"), payload);
}

function setMemberStatus(id, status) {
  return axios.patch(url(`/admin/admins/${id}`), { status });
}

function deleteMember(id) {
  return axios.delete(url(`/admin/admins/${id}`));
}

function setUserStatus(id, status) {
  return axios.patch(url(`/admin/users/${id}/status`), { status });
}

function setUserRole(id, role) {
  return axios.patch(url(`/admin/users/${id}/role`), { role });
}

function verifyUser(userId) {
  return axios.post(url(`/admin/users/${userId}/verify`));
}

function resendVerification(userId) {
  return axios.post(url(`/admin/users/${userId}/resend-verification`));
}

async function resetUserPassword(userId) {
  const { data } = await axios.post(url(`/admin/users/${userId}/reset-password`));
  return data?.tempPassword || "";
}

function deleteUser(userId) {
  return axios.delete(url(`/admin/users/${userId}`));
}

function setRestaurantStatus(id, status) {
  return axios.patch(url(`/admin/restaurants/${id}/status`), { status });
}

function setOrderStatus(id, status) {
  return axios.patch(url(`/orders/${id}/status`), { status });
}

export function useSuperAdminApi() {
  return {
    // reads
    fetchDashboardStats,
    fetchUsers,
    fetchMembers,
    fetchMemberStats,
    fetchRestaurants,
    fetchOrders,
    fetchAccess,
    fetchLoginHistory,
    // writes
    createMember,
    setMemberStatus,
    deleteMember,
    setUserStatus,
    setUserRole,
    verifyUser,
    resendVerification,
    resetUserPassword,
    deleteUser,
    setRestaurantStatus,
    setOrderStatus,
  };
}
