<template>
    <header class="kds-top">
      <div class="kds-brand">
        <AppIcon name="chef" :size="22" />
        <strong class="kds-name">{{
          auth.restaurant?.name || i18n.t.kds_title
          }}</strong>
        <span class="kds-live" :class="{ off: !connected }">
          <i></i>{{ connected ? i18n.t.kds_live : i18n.t.kds_offline }}
        </span>
      </div>
      <div class="kds-acts">
        <button class="kds-btn kds-icon-btn" :title="lightMode ? 'Dark mode' : 'Light mode'"
          :aria-label="lightMode ? 'Dark mode' : 'Light mode'" @click="$emit('toggle-mode')">
          <AppIcon :name="lightMode ? 'moon' : 'sun'" :size="16" />
        </button>
        <!-- KH / EN switcher — the kitchen board speaks both languages -->
        <button class="kds-btn kds-lang" :title="i18n.locale === 'km' ? 'English' : 'ភាសាខ្មែរ'"
          @click="i18n.toggleLocale">
          {{ i18n.locale === "km" ? "EN" : "ខ្មែរ" }}
        </button>
        <AppSelect v-if="auth.restaurants.length > 1" class="kds-rest" size="md" tone="plain" variant="teal"
          radius="10px" :model-value="auth.restaurantId" :options="auth.restaurants" option-value="id"
          option-label="name" @update:model-value="$emit('switch-restaurant', $event)" />
        <button class="kds-btn" @click="$emit('toggle-show-done')">
          {{ showDone ? i18n.t.kds_hide_done : i18n.t.kds_show_done }}
        </button>
        <button class="kds-btn" @click="$emit('toggle-fullscreen')">
          <AppIcon :name="isFullscreen ? 'minimize' : 'expand'" :size="14" />
          {{ i18n.t.kds_fullscreen }}
        </button>
        <RouterLink class="kds-btn kds-back" to="/dashboard">
          {{ i18n.t.kds_back }}
        </RouterLink>
      </div>
    </header>
</template>

<script setup>
import { RouterLink } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useI18nStore } from "@/stores/i18n";
import AppIcon from "@/components/AppIcon.vue";
import AppSelect from "@/components/AppSelect.vue";

// Stores are Pinia singletons — same instances the view uses.
const auth = useAuthStore();
const i18n = useI18nStore();

// Board state lives in the view; mutations come back as events.
defineProps({
  connected: { type: Boolean, default: false },
  lightMode: { type: Boolean, default: false },
  showDone: { type: Boolean, default: true },
  isFullscreen: { type: Boolean, default: false },
});
defineEmits(["toggle-mode", "toggle-show-done", "toggle-fullscreen", "switch-restaurant"]);
</script>
<style scoped>
/* ─── Top bar ─── */
.kds-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 16px;
  background: var(--bg-soft);
  border-bottom: 1px solid var(--border);
  flex-wrap: wrap;
}

.kds-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  color: var(--primary-light, #5eead4);
}

.kds-name {
  font-size: 16px;
  color: var(--text-strong);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.kds-live {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
}

.kds-live i {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4ade80;
  animation: kds-blink 1.5s ease-in-out infinite;
}

.kds-live.off {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
}

.kds-live.off i {
  background: #f87171;
}

@keyframes kds-blink {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.3;
  }
}

.kds-acts {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

/* Restaurant switcher (AppSelect) — dark-board tokens.
   The closed control reads --surface/--border/--text from here; the
   teleported option menu keeps AppSelect's white popup (readable on
   the dark board) with the teal brand accents. */
.kds-rest {
  --as-border: var(--border-line);
  --as-ink: var(--text);
  --surface: var(--bg-card);
  max-width: 200px;
  max-width: 60vw;
}
/* ── Top-bar controls: uniform size ──────────────────────────
   Fixed height + centered flex so every control (sun/moon,
   KH/EN, restaurant select, Hide done, Fullscreen, Back) is
   exactly the same height and radius — Khmer text has a taller
   line box and bare icons are shorter, which made them uneven. */
.kds-acts .kds-btn {
  height: 38px;
  min-height: 38px;
  box-sizing: border-box;
  padding: 0 14px;
  border-radius: 10px;
}

/* Icon-only button (dark/light toggle) — narrower, same height */
.kds-acts .kds-icon-btn {
  padding: 0 12px;
}

/* Language pill — KH/EN */
.kds-acts .kds-lang {
  min-width: 54px;
  padding: 0 12px;
  font-weight: 800;
  letter-spacing: 0.3px;
}

/* Restaurant select — same 38px height as the other top-bar controls */
.kds-acts .kds-rest :deep(.as-control) {
  height: 38px;
  font-weight: 600;
}
</style>
