<!-- One row-shaped loading placeholder (avatar + two text lines + badge).
     Used by <AdminList> while the first page of a list is loading. -->
<template>
  <div class="skeleton-row" aria-hidden="true">
    <span class="sk sk-avatar"></span>
    <span class="sk sk-line"></span>
    <span class="sk sk-line sk-short"></span>
    <span class="sk sk-badge"></span>
  </div>
</template>

<style scoped>
.skeleton-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  border-bottom: 1px solid var(--sa-line, #dfeadc);
}

.skeleton-row:last-child {
  border-bottom: none;
}

.sk {
  display: inline-block;
  background: linear-gradient(90deg, #e8f0e6, #f5faf3, #e8f0e6);
  background-size: 200% 100%;
  animation: sk-shimmer 1.3s ease-in-out infinite;
}

@keyframes sk-shimmer {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}

.sk-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  flex-shrink: 0;
}

.sk-line {
  flex: 1;
  height: 11px;
  max-width: 190px;
  border-radius: 6px;
}

.sk-short {
  max-width: 130px;
  opacity: 0.75;
}

.sk-badge {
  width: 84px;
  height: 24px;
  border-radius: 999px;
  flex-shrink: 0;
}

/* Phones: same stacked rhythm as a real row, no badge placeholder */
@media (max-width: 900px) {
  .skeleton-row {
    flex-wrap: wrap;
    gap: 10px;
    padding: 16px;
  }

  .sk-badge {
    display: none;
  }

  .sk-line {
    max-width: none;
    flex-basis: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .sk {
    animation: none;
  }
}
</style>
