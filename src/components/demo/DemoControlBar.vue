<template>
      <div class="control-bar">
        <div class="tabs-wrap">
          <div class="tabs">
            <button v-for="c in demoCategories" :key="c.id" class="tab" :class="{ active: catId === c.id }"
              @click="$emit('update:cat-id', c.id)">
              <AppIcon v-if="c.icon" :name="c.icon" :size="14" />
              <AppIcon v-else name="category" :size="14" />
              <span class="tab-label">{{ i18n.locale === "km" ? c.label_km : c.label_en }}</span>
            </button>
          </div>
        </div>
        <div class="search-bar">
          <div class="search-inner">
            <svg class="search-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8">
              <circle cx="8.5" cy="8.5" r="5.5" />
              <path d="M15 15l-3-3" />
            </svg>
            <input :value="searchQ" @input="$emit('update:search-q', $event.target.value)"
              :placeholder="i18n.t.demo_search_placeholder" />
            <button v-if="searchQ" class="search-clear" @click="$emit('update:search-q', '')">
              <AppIcon name="x" :size="14" />
            </button>
          </div>
        </div>
      </div>
</template>

<script setup>
import { useI18nStore } from "@/stores/i18n";
import { demoCategories } from "@/data/demo";
import AppIcon from "@/components/AppIcon.vue";

const i18n = useI18nStore();

// Tab + search live in the parent (they drive the food filtering) and
// sync back through update:* events — markup is otherwise unchanged.
defineProps({
  catId: { default: "" },
  searchQ: { type: String, default: "" },
});
defineEmits(["update:cat-id", "update:search-q"]);
</script>
<style scoped>
/* CONTROL BAR — MenuView sticky floating card */
.control-bar {
  position: sticky;
  top: 12px;
  z-index: 50;
  margin: -28px 12px 0;
  background: var(--white);
  border-radius: 22px;
  box-shadow: 0 20px 50px var(--shadow-tint, rgba(16, 24, 20, 0.16));
  border: 1px solid var(--green-soft, #eaf5ed);
  overflow: hidden;
}

@media (max-width: 480px) {
  .control-bar {
    margin: -22px 8px 0;
    border-radius: 18px;
  }
}

.tabs-wrap {
  overflow-x: auto;
  scrollbar-width: none;
  border-bottom: 1px solid var(--green-pale, #eef7f0);
}

.tabs-wrap::-webkit-scrollbar {
  display: none;
}

.tabs {
  display: flex;
  min-width: max-content;
  padding: 10px 12px;
  gap: 6px;
}

.tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 16px;
  font-size: 13px;
  font-family: inherit;
  font-weight: 600;
  color: var(--text-light);
  border: none;
  background: transparent;
  cursor: pointer;
  white-space: nowrap;
  border-radius: 999px;
  transition: all 0.2s ease;
}

@media (max-width: 480px) {
  .tab {
    padding: 8px 13px;
    font-size: 12px;
  }
}

.tab-label {
  letter-spacing: 0.01em;
}

.tab.active {
  color: var(--on-primary, #fff);
  font-weight: 700;
  background: linear-gradient(135deg, var(--green-mid), var(--green-light));
  box-shadow: 0 4px 12px var(--glow-strong, rgba(22, 163, 74, 0.3));
}

.tab:hover:not(.active) {
  color: var(--green-dark);
  background: var(--green-pale);
}

.search-bar {
  padding: 12px 14px 14px;
}

.search-inner {
  position: relative;
  max-width: 100%;
  margin: 0 auto;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 17px;
  height: 17px;
  color: #9ca3af;
  pointer-events: none;
}

.search-bar input {
  width: 100%;
  padding: 12px 40px 12px 42px;
  border: 1.5px solid var(--green-soft, #e3f5e8);
  border-radius: 16px;
  font-size: 14px;
  font-family: inherit;
  background: var(--green-pale, #f6fdf8);
  color: var(--text-dark);
  outline: none;
  transition: all 0.2s;
  box-sizing: border-box;
}

.search-bar input:focus {
  border-color: var(--green-strong, var(--green-light));
  background: #fff;
  box-shadow: 0 0 0 4px var(--glow-soft, rgba(74, 222, 128, 0.14));
}

.search-bar input::placeholder {
  color: #9ca3af;
}

.search-clear {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: #d1d5db;
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}

.search-clear:hover {
  background: #9ca3af;
}

</style>
