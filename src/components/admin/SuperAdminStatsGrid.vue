<template>
  <section class="stats-grid">
    <div class="stat-card stat-click" role="button" :title="t.admin_management" @click="emit('go-to-tab', 'admins')">
      <div class="stat-icon-wrap icon-teal">
        <AppIcon name="users" :size="20" />
      </div>
      <div class="stat-body">
        <span class="stat-num">{{ adminStats?.byRole?.owner?.total ?? 0 }}</span>
        <span class="stat-label">{{ t.admins }}</span>
      </div>
      <div class="stat-spark teal"></div>
    </div>
    <div class="stat-card stat-click" role="button" :title="t.super_admin_management"
      @click="emit('go-to-tab', 'super-admins')">
      <div class="stat-icon-wrap icon-amber">
        <AppIcon name="shield" :size="20" />
      </div>
      <div class="stat-body">
        <span class="stat-num">{{ adminStats?.byRole?.super_admin?.total ?? 0 }}</span>
        <span class="stat-label">{{ t.super_admins }}</span>
      </div>
      <div class="stat-spark amber"></div>
    </div>
    <div class="stat-card stat-click" role="button" :title="t.restaurants" @click="emit('go-to-tab', 'restaurants')">
      <div class="stat-icon-wrap icon-amber">
        <AppIcon name="store" :size="20" />
      </div>
      <div class="stat-body">
        <span class="stat-num">{{ adminStats?.totalRestaurants ?? stats.totalRestaurants }}</span>
        <span class="stat-label">{{ t.total_restaurants }}</span>
      </div>
      <div class="stat-spark amber"></div>
    </div>
    <div class="stat-card stat-click" role="button" :title="t.orders" @click="emit('go-to-tab', 'orders')">
      <div class="stat-icon-wrap icon-blue">
        <AppIcon name="clipboard" :size="20" />
      </div>
      <div class="stat-body">
        <span class="stat-num">{{ adminStats?.totalOrders ?? stats.totalOrders }}</span>
        <span class="stat-label">{{ t.total_orders }}</span>
      </div>
      <div class="stat-spark blue"></div>
    </div>
    <div class="stat-card stat-click" role="button" :title="t.foods" @click="emit('go-to-tab', 'restaurants')">
      <div class="stat-icon-wrap icon-green">
        <AppIcon name="food" :size="20" />
      </div>
      <div class="stat-body">
        <span class="stat-num">{{ stats.totalFoods }}</span>
        <span class="stat-label">{{ t.total_foods }}</span>
      </div>
      <div class="stat-spark green"></div>
    </div>
    <div class="stat-card stat-click" role="button" :title="t.orders_today" @click="emit('go-to-tab', 'orders')">
      <div class="stat-icon-wrap icon-blue">
        <AppIcon name="orders" :size="20" />
      </div>
      <div class="stat-body">
        <span class="stat-num">{{ stats.todayOrders ?? 0 }}</span>
        <span class="stat-label">{{ t.orders_today }}</span>
      </div>
      <div class="stat-spark blue"></div>
    </div>
    <div class="stat-card stat-click" role="button" :title="t.active_sessions" @click="emit('go-to-tab', 'admins')">
      <div class="stat-icon-wrap icon-blue">
        <AppIcon name="activity" :size="20" />
      </div>
      <div class="stat-body">
        <span class="stat-num">{{ adminStats?.activeSessions ?? 0 }}</span>
        <span class="stat-label">{{ t.active_sessions }}</span>
      </div>
      <div class="stat-spark blue"></div>
    </div>
    <div class="stat-card stat-click" role="button" :title="t.pending" @click="emit('go-to-tab', 'orders')">
      <div class="stat-icon-wrap icon-amber">
        <AppIcon name="clock" :size="20" />
      </div>
      <div class="stat-body">
        <span class="stat-num">{{ stats.pendingOrders ?? 0 }}</span>
        <span class="stat-label">{{ t.pending }}</span>
      </div>
      <div class="stat-spark amber"></div>
    </div>
    <div class="stat-card stat-click" role="button" :title="t.revenue_label" @click="emit('go-to-tab', 'orders')">
      <div class="stat-icon-wrap icon-green">
        <AppIcon name="cart" :size="20" />
      </div>
      <div class="stat-body">
        <span class="stat-num">{{ formatMoney(stats.revenue ?? 0) }}</span>
        <span class="stat-label">{{ t.revenue_label }}</span>
      </div>
      <div class="stat-spark green"></div>
    </div>
  </section>
</template>

<script setup>
import AppIcon from "@/components/AppIcon.vue";

defineProps(["adminStats", "stats", "t", "formatMoney"]);
const emit = defineEmits(["go-to-tab"]);
</script>

<style scoped>
/* auto-fit keeps 3–4 compact cards per row on desktop and folds down by
   itself (see the responsive block below for the 1-column mobile layout) */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border: 1px solid var(--sa-line, var(--border));
  border-radius: 14px;
  background: var(--white, var(--surface));
  box-shadow: var(--sa-shadow-sm, 0 1px 2px rgba(26, 74, 26, 0.06));
  position: relative;
  overflow: hidden;
  transition: box-shadow 0.18s var(--sa-ease, ease), transform 0.18s var(--sa-ease, ease);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--sa-shadow-md, 0 8px 24px rgba(20, 83, 45, 0.08));
}

.stat-icon-wrap {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Icon chips — green family first, blue / amber stay as accents */
.icon-teal {
  background: var(--green-pale, #e8f5e9);
  color: var(--green-mid, #2d7a2d);
}

.icon-green {
  background: var(--green-soft, #c8e6c9);
  color: var(--green-dark, #1a4a1a);
}

.icon-blue {
  background: #dbeafe;
  color: var(--blue);
}

.icon-amber {
  background: #fff1e0;
  color: var(--orange, var(--amber));
}

.stat-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-num {
  font-family: "Hanuman", serif;
  font-size: 22px;
  font-weight: 700;
  color: var(--green-dark, var(--ink));
  line-height: 1.15;
  font-variant-numeric: tabular-nums;
}

/* No text-transform: Khmer gains nothing from uppercase and it hurt wrapping */
.stat-label {
  font-size: 13px;
  line-height: 1.6;
  font-weight: 500;
  color: var(--text-light, var(--muted));
}

.stat-spark {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
}

.stat-spark.teal {
  background: var(--green-mid, var(--teal));
}

.stat-spark.amber {
  background: var(--orange, var(--amber));
}

.stat-spark.blue {
  background: var(--blue);
}

.stat-spark.green {
  background: var(--green-light, var(--green));
}

@media (max-width: 900px) {
  /* Mobile: one stat per row, compact enough that the grid stays scannable */
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .stat-card {
    padding: 12px 14px;
  }

  .stat-icon-wrap {
    width: 34px;
    height: 34px;
  }

  .stat-icon-wrap :deep(svg) {
    width: 17px;
    height: 17px;
  }

  .stat-num {
    font-size: 20px;
  }

  .stat-label {
    font-size: 12.5px;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    gap: 8px;
  }

  .stat-card {
    padding: 12px;
    gap: 10px;
  }

  .stat-icon-wrap {
    width: 32px;
    height: 32px;
    border-radius: 10px;
  }

  .stat-icon-wrap :deep(svg) {
    width: 16px;
    height: 16px;
  }

  .stat-num {
    font-size: 19px;
  }
}
</style>
