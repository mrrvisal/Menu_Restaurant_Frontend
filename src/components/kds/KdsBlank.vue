<template>
    <div class="kds-blank">
      <AppIcon name="chef" :size="42" />
      <p>{{ text }}</p>
      <RouterLink class="kds-btn kds-back" to="/dashboard">
        {{ i18n.t.kds_back }}
      </RouterLink>
    </div>
</template>

<script setup>
import { RouterLink } from "vue-router";
import { useI18nStore } from "@/stores/i18n";
import AppIcon from "@/components/AppIcon.vue";

const i18n = useI18nStore();

// One shared blank state — the view passes the resolved message.
defineProps({ text: { type: String, default: "" } });
</script>
<style scoped>
/* ─── Blank (no restaurant) ─── */
.kds-blank p {
  margin: 0;
  font-size: 15px;
}

.kds-blank {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  color: var(--text-dim);
}

.kds-blank p {
  margin: 0;
  font-size: 15px;
}
</style>
