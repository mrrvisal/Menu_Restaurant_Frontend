<!-- frontend/src/components/ShareMenu.vue -->
<!-- ───────────────────────────────────────────────────────────
   ShareMenu — trigger button + share sheet.

   Drop it anywhere:  <ShareMenu :url="…" :text="…" label="ចែករំលែក" />

   The sheet lists every platform (ShareGrid) and teleports to <body>
   so it always sits above the page chrome.
   ─────────────────────────────────────────────────────────── -->
<template>
  <button
    type="button"
    class="sm-trigger"
    :class="triggerClass"
    :aria-label="label || i18n.t.share"
    :title="label || i18n.t.share"
    @click.stop="open"
  >
    <AppIcon :name="icon" :size="iconSize" />
    <span v-if="label" class="sm-trigger-label">{{ label }}</span>
  </button>

  <Teleport to="body">
    <Transition name="sm-fade">
      <div
        v-if="visible"
        class="sm-overlay"
        role="dialog"
        aria-modal="true"
        @click.self="close"
      >
        <div class="sm-sheet">
          <span class="sm-handle"></span>
          <div class="sm-head">
            <span class="sm-head-title">
              <AppIcon name="share" :size="16" />
              {{ title || i18n.t.share_title }}
            </span>
            <button
              type="button"
              class="sm-close"
              :aria-label="i18n.t.close"
              @click="close"
            >
              <AppIcon name="x" :size="15" />
            </button>
          </div>
          <div class="sm-body">
            <ShareGrid
              :show-header="false"
              :url="url"
              :text="text"
              :image="image"
              :accent="accent"
              :title="title"
              @shared="close"
            />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, onUnmounted } from "vue";
import AppIcon from "@/components/AppIcon.vue";
import ShareGrid from "@/components/ShareGrid.vue";
import { useI18nStore } from "@/stores/i18n";

const props = defineProps({
  // Link that goes into the chat (share card when the API provides one).
  url: { type: String, default: "" },
  // Message sent together with the link.
  text: { type: String, default: "" },
  image: { type: String, default: "" },
  // Sheet heading.
  title: { type: String, default: "" },
  // Trigger label — leave empty for an icon-only button.
  label: { type: String, default: "" },
  icon: { type: String, default: "share" },
  iconSize: { type: Number, default: 18 },
  // Extra classes for the trigger (so it can reuse an existing button style).
  triggerClass: { type: [String, Array, Object], default: "" },
  accent: { type: String, default: "" },
});

const i18n = useI18nStore();
const visible = ref(false);

function open() {
  if (!props.url) return;
  visible.value = true;
}

function close() {
  visible.value = false;
}

function onKey(event) {
  if (event.key === "Escape") close();
}

// While the sheet is open: lock the page scroll behind it and close on Esc.
watch(visible, (isOpen) => {
  if (isOpen) {
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
  } else {
    document.removeEventListener("keydown", onKey);
    document.body.style.overflow = "";
  }
});

onUnmounted(() => {
  document.removeEventListener("keydown", onKey);
  document.body.style.overflow = "";
});

defineExpose({ open, close });
</script>

<style scoped>
/* ── trigger ── */
.sm-trigger {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  border: 0;
  background: transparent;
  color: inherit;
}

/* ── sheet ── */
.sm-overlay {
  position: fixed;
  inset: 0;
  z-index: 900;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: rgba(8, 20, 14, 0.5);
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
}
.sm-sheet {
  position: relative;
  width: 100%;
  max-width: 460px;
  max-height: 88vh;
  overflow-y: auto;
  background: #fff;
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.22);
  animation: sm-up 0.26s cubic-bezier(0.34, 1.4, 0.64, 1) both;
  padding-bottom: 8px;
}
@keyframes sm-up {
  from {
    transform: translateY(18px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
.sm-handle {
  display: block;
  width: 42px;
  height: 4px;
  margin: 10px auto 4px;
  border-radius: 999px;
  background: #d1d5db;
}
.sm-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 16px 10px;
  border-bottom: 1px solid #f1f5f3;
}
.sm-head-title {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 14px;
  font-weight: 700;
  color: var(--ink, #111827);
}
.sm-close {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #6b7280;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.sm-close:hover {
  background: #f3f4f6;
}
.sm-body {
  padding: 14px 16px 6px;
}
.sm-sub {
  margin: 8px 16px 0;
  font-size: 11.5px;
  line-height: 1.6;
  color: #6b7280;
}

/* Narrow screens: the trigger becomes icon-only (the label would not fit the
   menu header / dashboard rows) */

/* Desktop: a centered card instead of a bottom sheet */
@media (min-width: 560px) {
  .sm-overlay {
    align-items: center;
  }
  .sm-sheet {
    border-radius: 20px;
    margin: 16px;
    animation: none;
  }
  .sm-handle {
    display: none;
  }
  .sm-head {
    padding-top: 14px;
  }
}

.sm-fade-enter-active,
.sm-fade-leave-active {
  transition: opacity 0.18s ease;
}
.sm-fade-enter-from,
.sm-fade-leave-to {
  opacity: 0;
}
</style>
