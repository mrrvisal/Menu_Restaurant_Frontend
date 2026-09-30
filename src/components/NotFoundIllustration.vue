<template>
  <div class="nf-art" aria-hidden="true">
    <svg viewBox="0 0 140 140" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"
      stroke-linejoin="round">
      <ellipse cx="66" cy="84" rx="50" ry="19" />
      <ellipse cx="66" cy="79" rx="32" ry="11" opacity=".5" />
      <path d="M48 72l8 9-5 6 9 7" opacity=".75" />
      <path d="M98 30v16m-6-16v9a6 6 0 0 0 12 0v-9" />
      <path d="M98 46v18" />
      <path d="M114 30c5 8 5 18 0 26v20" />
    </svg>
    <span class="nf-q">?</span>
  </div>
</template>

<style scoped>
.nf-art {
  position: relative;
  color: #16a34a;
  filter: drop-shadow(0 10px 14px rgba(22, 163, 74, 0.18));
  animation: nfBob 4.5s ease-in-out infinite;
  margin-bottom: 4px;
}

.nf-art svg {
  width: 132px;
  height: 132px;
}

@keyframes nfBob {

  0%,
  100% {
    transform: translateY(0) rotate(-3deg);
  }

  50% {
    transform: translateY(-10px) rotate(3deg);
  }
}

.nf-q {
  position: absolute;
  top: -4px;
  right: -2px;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #f59e0b;
  color: #fff;
  font-size: 18px;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.18), 0 6px 18px rgba(180, 83, 9, 0.25);
  animation: nfBob 4.5s ease-in-out infinite reverse;
}

@media (max-width: 480px) {
  .nf-art svg {
    width: 108px;
    height: 108px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .nf-art,
  .nf-q {
    animation: none;
  }
}
</style>
