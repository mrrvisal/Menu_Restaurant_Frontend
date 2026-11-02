<template>
  <Transition name="app-loader-fade">
    <div
      v-if="visible"
      class="app-loader"
      role="status"
      aria-live="polite"
      :aria-label="label"
    >
      <div class="app-loader-content">
        <div class="app-loader-image-wrap">
          <span v-if="!logoOnly" class="loader-ring" aria-hidden="true"></span>
          <img
            class="app-loader-image"
            :src="logo"
            alt=""
            aria-hidden="true"
          />
          <div class="wave-dots" aria-hidden="true">
            <span v-for="dot in 5" :key="dot" :style="{ '--dot-index': dot - 1 }"></span>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
defineProps({
  visible: {
    type: Boolean,
    default: true,
  },
  label: {
    type: String,
    default: "Loading menu...",
  },
  logoOnly: {
    type: Boolean,
    default: false,
  },
});

import logo from "@/assets/images/main-logo/digital-menu.png";
</script>

<style scoped>
.app-loader {
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: grid;
  place-items: center;
  min-height: 100dvh;
  overflow: hidden;
  background: linear-gradient(160deg, #f0fdf4 0%, #dcfce7 30%, #f0fdf4 60%, #e8f5e9 100%);
}

.app-loader-content {
  width: min(78vw, 280px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
}

.app-loader-image-wrap {
  position: relative;
  display: grid;
  place-items: center;
  width: 100%;
  aspect-ratio: 1;
}

.app-loader-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  animation: loader-breathe 1.8s ease-in-out infinite;
}

.loader-ring {
  position: absolute;
  inset: 16%;
  border-radius: 50%;
  border: 3px solid transparent;
  border-top-color: #ff9f1c;
  border-right-color: rgba(255, 159, 28, 0.45);
  animation: loader-spin 1.4s linear infinite;
}

.wave-dots {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 18px;
  position: absolute;
  left: 50%;
  bottom: 10px;
  transform: translateX(-50%);
}

.wave-dots span {
  width: 12px;
  height: 12px;
  flex: 0 0 auto;
  border-radius: 50%;
  background: #fd9f2a;
  animation: dot-wave 1.2s ease-in-out infinite;
  animation-delay: calc(var(--dot-index) * 100ms);
}

.app-loader-fade-enter-active,
.app-loader-fade-leave-active {
  transition: opacity 240ms ease;
}

.app-loader-fade-enter-from,
.app-loader-fade-leave-to {
  opacity: 0;
}

@keyframes loader-spin {
  to { transform: rotate(360deg); }
}

@keyframes loader-breathe {
  0%, 100% { transform: scale(0.96); }
  50% { transform: scale(1); }
}

@keyframes dot-wave {
  0%, 60%, 100% {
    transform: translateY(0) scale(0.85);
    opacity: 0.55;
  }
  30% {
    transform: translateY(-9px) scale(1);
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .app-loader-image,
  .loader-ring,
  .wave-dots span {
    animation-duration: 3s;
  }
}
</style>
