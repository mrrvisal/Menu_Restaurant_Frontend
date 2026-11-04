<template>
  <span class="button-loader" role="status" :aria-label="text">
    <span class="button-loader-mark" aria-hidden="true">
      <span class="button-loader-ring"></span>
      <span class="button-loader-badge">
        <img class="button-loader-logo" :src="logoUrl" alt="" />
      </span>
    </span>
    <span class="button-loader-text">{{ text }}</span>
  </span>
</template>

<script setup>
import logoUrl from "@/assets/images/main-logo/digital-menu.png";

defineProps({
  text: {
    type: String,
    default: "Loading",
  },
});
</script>

<style scoped>
.button-loader {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-shrink: 0;
  color: inherit; /* ring follows the button's text color */
}

.button-loader-mark {
  position: relative;
  width: 1.5em;
  height: 1.5em;
  flex-shrink: 0;
}

/* spinning arc */
.button-loader-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    transparent 0deg,
    color-mix(in srgb, currentColor 15%, transparent) 60deg,
    currentColor 300deg,
    transparent 360deg
  );
  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 1px));
  mask: radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 1px));
  animation: button-loader-spin 900ms linear infinite;
}

/* white disc keeps the logo readable on any button color */
.button-loader-badge {
  position: absolute;
  inset: 3px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #fff;
}

.button-loader-logo {
  width: 0.85em;
  height: 0.85em;
  object-fit: contain; /* use a square logo/icon file */
}

.button-loader-text {
  font-size: inherit;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
  color: inherit;
}

@keyframes button-loader-spin {
  to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
  .button-loader-ring {
    animation-duration: 2.5s; /* slower, but still shows it is working */
  }
}
</style>