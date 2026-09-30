<template>
          <div class="modal-overlay" @click.self="$emit('close')">
            <div class="modal-card success-card">
              <div class="modal-drag-handle"></div>
              <button class="modal-close" @click="$emit('close')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                  stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
              <div class="success-body">
                <div class="success-icon">
                  <AppIcon name="check-circle" :size="46" />
                </div>
                <h2 class="detail-name">{{ i18n.t.demo_success_title }}</h2>
                <p class="success-desc">{{ i18n.t.demo_success_desc }}</p>
                <div class="success-code">
                  {{ i18n.t.demo_order_code }}: <b>{{ lastOrder.code }}</b>
                  · {{ i18n.t.table }} <b>{{ lastOrder.tableNo }}</b>
                </div>
                <ul class="success-items">
                  <li v-for="item in lastOrder.items" :key="item.id">
                    <span>{{ item.name }} × {{ item.qty }}</span>
                    <span>{{ (item.price * item.qty).toLocaleString() }}៛</span>
                  </li>
                </ul>
                <div class="cart-total-row">
                  <span>{{ i18n.t.total }}</span>
                  <b>{{ lastOrder.total.toLocaleString() }}៛</b>
                </div>
                <div class="cart-actions">
                  <button class="ghost-btn" @click="$emit('reset')">{{ i18n.t.demo_new_order }}</button>
                  <router-link to="/register" class="add-cart-big register-cta">{{ i18n.t.get_started_free
                    }}</router-link>
                </div>
              </div>
            </div>
          </div>
</template>

<script setup>
import { useI18nStore } from "@/stores/i18n";
import AppIcon from "@/components/AppIcon.vue";

const i18n = useI18nStore();

// Shows the simulated order from useDemoCart (v-if lives in the view).
defineProps({ lastOrder: { type: Object, default: null } });
defineEmits(["close", "reset"]);
</script>
<style scoped>
/* ORDER SUCCESS (simulated demo order) */
.success-body {
  padding: 26px 22px 28px;
  text-align: center;
}

@media (max-width: 480px) {
  .success-body {
    padding: 20px 16px 24px;
  }
}

.success-icon {
  width: 78px;
  height: 78px;
  margin: 0 auto 14px;
  border-radius: 50%;
  background: var(--green-pale);
  color: var(--green-mid);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: checkPop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

@keyframes checkPop {
  from {
    transform: scale(0.4);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}

.success-desc {
  margin: 6px 0 14px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-light);
}

.success-code {
  display: block;
  padding: 10px 14px;
  border-radius: 12px;
  margin-bottom: 14px;
  background: var(--green-pale);
  border: 1px dashed var(--green-soft);
  font-size: 12px;
  font-weight: 600;
  color: var(--green-dark);
}

.success-code b {
  font-size: 15px;
  letter-spacing: 0.03em;
}

.success-items {
  list-style: none;
  margin: 0 0 4px;
  padding: 0 2px;
  text-align: left;
}

.success-items li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 7px 0;
  font-size: 12.5px;
  color: var(--text-dark);
}

.success-items li+li {
  border-top: 1px solid var(--green-pale);
}

.success-card .cart-actions {
  margin-top: 14px;
}

.success-card .register-cta {
  justify-content: center;
}


</style>
