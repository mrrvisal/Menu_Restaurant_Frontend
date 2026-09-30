// ─── ACTIVE TAB (persists across page refresh) ─────────────
// The selected sidebar tab is mirrored into the URL as ?tab=… so a
// refresh (F5 / pull-to-refresh) — or a shared link — lands back on the
// exact same view instead of resetting to "Foods".
// The watcher lives at module level (the router is imported directly, so no
// setup context is needed) — it survives AdminView remounts exactly like
// the original per-mount watch did. The refs are singletons: the sidebar,
// the SSE stream and sibling composables all read the same source.
import { ref, watch } from "vue";
import router from "@/router";

export const VALID_TABS = ["foods", "categories", "orders", "reports"];
export const adminTab = ref("foods");

watch(adminTab, (tab) => {
  router
    .replace({ query: { ...router.currentRoute.value.query, tab } })
    .catch(() => { }); // duplicate navigation is harmless
});

export function useAdminTab() {
  // Same as the original setup line: every mount reads the tab from the URL
  // (a remount after navigating away restores ?tab=… again).
  adminTab.value = VALID_TABS.includes(router.currentRoute.value.query.tab)
    ? router.currentRoute.value.query.tab
    : "foods";
  return { VALID_TABS, adminTab };
}

