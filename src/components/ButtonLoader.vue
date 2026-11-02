<template>
  <span class="button-loader" role="status" aria-label="Loading">
    <span v-for="dot in 3" :key="dot" :style="{ '--dot-index': dot - 1 }"></span>
  </span>
</template>

<style scoped>
.button-loader {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: 1em;
}

.button-loader span {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
  animation: button-loader-wave 900ms ease-in-out infinite;
  animation-delay: calc(var(--dot-index) * 120ms);
}

@keyframes button-loader-wave {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.55;
  }
  30% {
    transform: translateY(-4px);
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .button-loader span {
    animation: none;
  }
}
</style>
