<!-- Mobile top bar (visible below 900px — see the media query below) -->
<template>
  <header class="mob">
    <div class="mob-info">
      <div class="mob-av">
        <img v-if="restaurantLogo" :src="restaurantLogo" alt="" @error="$emit('logo-error')" />
        <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </div>
      <span class="mob-label">{{ auth.restaurant?.name || "ភោជនីយដ្ឋាន" }}</span>
    </div>
    <!-- Install app — when the app is already installed the icon shows ✓ and
         the tooltip says so, but the button stays ENABLED: the owner can
         still install again (another browser/device, or after removing it). -->
    <button class="mob-btn mob-install" v-if="installAvailable" :title="installEntryLabel"
      :aria-label="installEntryLabel" @click="openInstall">
      <AppIcon :name="isInstalled ? 'check-circle' : 'download'" :size="18" />
    </button>
    <button class="mob-btn" @click="$emit('toggle-menu')" aria-label="Menu" :aria-expanded="showMobile"
      aria-controls="admin-sidebar">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    </button>
  </header>
</template>

<script setup>
import { useAuthStore } from "@/stores/auth";
import { usePwaInstall } from "@/utils/pwaInstall";
import { useInstallUi } from "@/composables/useInstallUi";
import AppIcon from "@/components/AppIcon.vue";

defineProps({
  restaurantLogo: { type: String, default: "" },
  showMobile: { type: Boolean, default: false },
});
defineEmits(["toggle-menu", "logo-error"]);

const auth = useAuthStore();
const { installAvailable, isInstalled } = usePwaInstall();
const { installEntryLabel, openInstall } = useInstallUi();
</script>

<style scoped>
.mob {
  display: none;
}

/* Mobile Header — the height is exact (and border-box) so the sticky .hdr
   below it can offset by precisely --mob-h instead of guessing */
@media (max-width: 900px) {
  .mob {
    display: flex;
    align-items: center;
    gap: 8px;
    /* reduced from 10px */
    box-sizing: border-box;
    height: var(--mob-h);
    padding: 0 12px;
    /* reduced from 14px */
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    position: sticky;
    top: 0;
    z-index: 90;
  }

  .mob-btn {
    width: 28px;
    /* reduced from 32px */
    height: 28px;
    /* reduced from 32px */
    border-radius: 6px;
    /* reduced from 8px */
    border: 1px solid var(--border);
    background: var(--surface);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--ink);
    position: relative;
    flex-shrink: 0;
  }

  .mob-btn:hover {
    border-color: var(--primary-strong, var(--primary));
  }

  .mob-info {
    display: flex;
    align-items: center;
    gap: 8px;
    /* reduced from 10px */
    flex: 1;
    min-width: 0;
  }

  .mob-av {
    width: 24px;
    /* reduced from 28px */
    height: 24px;
    /* reduced from 28px */
    border-radius: 5px;
    /* reduced from 6px */
    overflow: hidden;
    border: 1px solid var(--border-green);
    flex-shrink: 0;
    background: var(--surface-green);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--primary);
  }

  .mob-av img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .mob-label {
    font-size: 12px;
    /* reduced from 13px */
    font-weight: 700;
    color: var(--ink);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

/* PWA install entry (owners "download the web as an app") */
.mob-install {
  color: var(--primary-strong, var(--primary));
}
</style>
