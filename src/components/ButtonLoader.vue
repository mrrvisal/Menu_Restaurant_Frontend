<template>
  <span class="button-loader" role="status" :aria-label="text">
    <span class="button-loader-ring"></span>
    <img class="button-loader-logo" :src="logoUrl" alt="" aria-hidden="true" />
    <span class="button-loader-text">{{ text }}</span>
  </span>
</template>

<script setup>
import logoUrl from "@/assets/digital-menu-logo.svg";

defineProps({
  text: {
    type: String,
    default: "Loading",
  },
});
</script>

<style scoped>
.button-loader {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  height: 34px;
  flex-shrink: 0;
}

.button-loader-ring {
  position: absolute;
  left: 0;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    transparent 0deg,
    rgba(255, 112, 67, 0.08) 55deg,
    rgba(255, 112, 67, 0.5) 150deg,
    #ff7043 270deg,
    #ff7043 310deg,
    transparent 360deg
  );
  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px));
  mask: radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px));
  animation: button-loader-spin 900ms linear infinite;
}

.button-loader-logo {
  position: relative;
  width: 77px;
  height: 22px;
  object-fit: contain;
  object-position: left center;
  clip-path: inset(0 71% 0 0);
  filter: drop-shadow(0 1px 2px rgba(45, 122, 45, 0.18));
}

.button-loader-text {
  font-size: 1em;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
}

@keyframes button-loader-spin {
  to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
  .button-loader-ring {
    animation: none;
  }
}
</style>
