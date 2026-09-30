<template>
  <div class="trk-card">
    <div class="trk-head">
      <span class="trk-oid">#{{ order.orderId }}</span>
      <span class="trk-table">
        <AppIcon name="qr" :size="13" /> {{ i18n.t.table }}
        {{ order.tableNo }}
      </span>
      <span class="trk-time">{{ formatTime(order.createdAt) }}</span>
    </div>

    <div v-if="isCancelled" class="trk-cancelled">
      <AppIcon name="x-circle" :size="18" />
      {{ i18n.t.track_cancelled }}
    </div>

    <div v-else class="trk-steps">
      <template v-for="(step, index) in steps" :key="index">
        <div class="trk-step" :class="{ done: currentStep >= index, now: currentStep === index }">
          <div class="step-dot">
            <AppIcon :name="step.icon" :size="16" />
          </div>
          <span class="step-label">{{ step.label }}</span>
        </div>
        <div v-if="index < steps.length - 1" class="step-line" :class="{ filled: currentStep > index }"></div>
      </template>
    </div>

    <div class="trk-items">
      <div class="trk-items-h">{{ i18n.t.kds_items }}</div>
      <div v-for="(item, index) in parseItems(order.items)" :key="index" class="trk-item">
        <span class="qty">{{ item.qty }}×</span>
        <span class="name">{{ item.name }}</span>
        <span class="price">
          {{ currencyStore.fmt(Number(item.price) * Number(item.qty || 1)) }}
        </span>
      </div>
      <div v-if="order.note" class="trk-note">
        <AppIcon name="note" :size="13" />
        {{ order.note }}
      </div>
    </div>

    <div class="trk-total">
      <span>{{ i18n.t.kds_total }}</span>
      <strong>{{ currencyStore.fmt(order.total) }}</strong>
    </div>
  </div>
</template>

<script setup>
import AppIcon from "@/components/AppIcon.vue";

defineProps([
  "order",
  "steps",
  "currentStep",
  "isCancelled",
  "formatTime",
  "parseItems",
  "currencyStore",
  "i18n",
]);
</script>

<style scoped>
.trk-card {
  width: 100%;
  max-width: 460px;
  margin: 0 auto;
  background: #fff;
  border-radius: 22px;
  border: 1px solid var(--green-soft, #e8f5e9);
  box-shadow: 0 20px 50px var(--shadow-tint, rgba(16, 24, 20, 0.12));
  padding: 18px 18px 22px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: trk-in 0.45s ease both;
}

@keyframes trk-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: none;
  }
}

.trk-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}

.trk-oid {
  font-size: 17px;
  font-weight: 800;
  color: var(--primary-strong, var(--primary));
}

.trk-table {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 11px;
  border-radius: 999px;
  background: var(--green-pale, #f0fdf4);
  color: var(--green-dark, #14532d);
}

.trk-time {
  font-size: 11px;
  color: var(--text-light, #6b7280);
  white-space: nowrap;
}

.trk-cancelled {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  border-radius: 14px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
  font-size: 14px;
  font-weight: 700;
}

.trk-steps {
  display: flex;
  align-items: flex-start;
}

.trk-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
  min-width: 58px;
}

.step-dot {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--green-pale, #f0fdf4);
  color: var(--text-light, #9ca3af);
  border: 2px solid var(--green-soft, #e5efe9);
  transition: all 0.3s ease;
}

.step-label {
  font-size: 10.5px;
  font-weight: 700;
  color: var(--text-light, #9ca3af);
  text-align: center;
  line-height: 1.25;
  white-space: nowrap;
}

.trk-step.done .step-dot {
  background: var(--primary);
  border-color: var(--primary);
  color: var(--on-primary, #fff);
}

.trk-step.done .step-label {
  color: var(--primary-strong, var(--primary));
}

.trk-step.now .step-dot {
  animation: trk-pulse 1.8s ease-in-out infinite;
}

@keyframes trk-pulse {

  0%,
  100% {
    box-shadow: 0 0 0 4px var(--glow-soft, rgba(74, 222, 128, 0.2));
  }

  50% {
    box-shadow: 0 0 0 8px var(--glow-soft, rgba(74, 222, 128, 0.08));
  }
}

.step-line {
  flex: 1;
  height: 3px;
  border-radius: 3px;
  background: var(--green-soft, #e5efe9);
  margin-top: 18px;
  min-width: 12px;
  transition: background 0.3s ease;
}

.step-line.filled {
  background: var(--primary);
}

.trk-items {
  border-top: 1px dashed var(--green-soft, #e5efe9);
  padding-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.trk-items-h {
  font-size: 10.5px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: var(--text-light, #9ca3af);
}

.trk-item {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 14px;
}

.trk-item .qty {
  color: var(--primary-strong, var(--primary));
  font-weight: 800;
  min-width: 28px;
  text-align: right;
}

.trk-item .name {
  flex: 1;
  min-width: 0;
}

.trk-item .price {
  font-weight: 600;
  color: var(--text-light, #4b5563);
  font-size: 12.5px;
  white-space: nowrap;
}

.trk-note {
  margin-top: 4px;
  font-size: 12px;
  color: #92400e;
  background: rgba(245, 158, 11, 0.08);
  border: 1px dashed rgba(245, 158, 11, 0.35);
  border-radius: 10px;
  padding: 7px 10px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.trk-total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 2px solid var(--green-soft, #e5efe9);
  padding-top: 12px;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-light, #6b7280);
}

.trk-total strong {
  font-size: 20px;
  font-weight: 800;
  color: var(--primary-strong, var(--primary));
}

@media (max-width: 420px) {
  .step-label {
    font-size: 9.5px;
  }

  .trk-card {
    padding: 15px 14px 18px;
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
</style>
