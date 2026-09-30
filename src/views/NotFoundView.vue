<!-- 404 Not Found View -->
<template>
  <div class="nf">
    <!-- decorative backdrop -->
    <div class="nf-grid" aria-hidden="true"></div>
    <div class="nf-glow g1" aria-hidden="true"></div>
    <div class="nf-glow g2" aria-hidden="true"></div>

    <main class="nf-inner">
      <NotFoundIllustration />

      <h1 class="nf-code" aria-label="404">
        <span>4</span><span class="nf-hollow">0</span><span>4</span>
      </h1>

      <p class="nf-title">{{ i18n.t.nf_title }}</p>
      <p class="nf-desc">{{ i18n.t.nf_desc }}</p>

      <!-- the exact path the user tried to visit -->
      <code v-if="triedPath" class="nf-path">{{ triedPath }}</code>

      <div class="nf-actions">
        <router-link to="/" class="nf-btn nf-btn-primary">
          {{ i18n.t.nf_gohome }}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
            stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </router-link>
        <router-link to="/login" class="nf-btn nf-btn-ghost">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
            stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          {{ i18n.t.nf_login }}
        </router-link>
      </div>

      <span class="nf-foot">© {{ new Date().getFullYear() }} {{ i18n.t.app_name }}</span>
    </main>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRoute } from "vue-router";
import { useI18nStore } from "@/stores/i18n";
import NotFoundIllustration from "@/components/NotFoundIllustration.vue";

const i18n = useI18nStore();
const route = useRoute();
// Show what the user actually typed — helpful for typos in QR/track links
const triedPath = ref(route.fullPath === "/" ? "" : route.fullPath);
</script>

<style scoped>
.nf {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
  background:
    radial-gradient(1000px 600px at 80% -10%, rgba(34, 197, 94, 0.1) 0%, transparent 60%),
    radial-gradient(800px 500px at 10% 110%, rgba(20, 184, 166, 0.08) 0%, transparent 60%),
    #f6faf7;
  color: #1a2e1e;
  font-family: "Kantumruy Pro", "Hanuman", "Noto Sans Khmer", system-ui, sans-serif;
  position: relative;
  overflow: hidden;
}

/* dotted grid backdrop — like a chalk/kitchen board */
.nf-grid {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: radial-gradient(rgba(22, 163, 74, 0.18) 1px, transparent 1px);
  background-size: 26px 26px;
  mask-image: radial-gradient(70% 60% at 50% 40%, #000 0%, transparent 100%);
  -webkit-mask-image: radial-gradient(70% 60% at 50% 40%, #000 0%, transparent 100%);
}

/* soft glowing orbs */
.nf-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(70px);
  pointer-events: none;
  animation: nfDrift 12s ease-in-out infinite;
}

.g1 {
  width: 340px;
  height: 340px;
  background: rgba(20, 184, 166, 0.14);
  top: -120px;
  right: -60px;
}

.g2 {
  width: 280px;
  height: 280px;
  background: rgba(34, 197, 94, 0.12);
  bottom: -110px;
  left: -70px;
  animation-delay: 4s;
}

@keyframes nfDrift {

  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }

  50% {
    transform: translate(-24px, 18px) scale(1.06);
  }
}

/* centered column — no card, content floats on the board */
.nf-inner {
  position: relative;
  z-index: 1;
  max-width: 560px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  animation: nfIn 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes nfIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: none;
  }
}

/* gradient "404" — solid glowing digits with a hollow zero */
.nf-code {
  margin: 0 0 10px;
  font-size: clamp(84px, 22vw, 140px);
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.02em;
  display: flex;
  align-items: center;
}

.nf-code span {
  background: linear-gradient(135deg, #166534, #22c55e);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

/* the middle "0" is a hollow outline — a "missing" digit */
.nf-hollow {
  background: none !important;
  -webkit-background-clip: initial !important;
  background-clip: initial !important;
  color: transparent !important;
  -webkit-text-stroke: 3px rgba(22, 163, 74, 0.55);
  margin: 0 6px;
  animation: nfBlink 2.6s ease-in-out infinite;
}

@keyframes nfBlink {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.45;
  }
}

.nf-title {
  margin: 0 0 10px;
  font-size: clamp(20px, 4vw, 26px);
  font-weight: 900;
  color: #14532d;
  letter-spacing: -0.02em;
}

.nf-desc {
  margin: 0 0 18px;
  font-size: 14px;
  line-height: 1.7;
  color: #4a6650;
}

/* the path that doesn't exist, shown in mono for clarity */
.nf-path {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11.5px;
  color: #b45309;
  background: #fffbeb;
  border: 1px dashed #fcd34d;
  border-radius: 8px;
  padding: 5px 12px;
  margin-bottom: 28px;
}

.nf-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
}

.nf-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 800;
  text-decoration: none;
  transition: all 0.25s ease;
}

.nf-btn-primary {
  background: linear-gradient(135deg, #166534, #22c55e);
  color: #fff;
  box-shadow: 0 4px 16px rgba(22, 101, 52, 0.3);
}

.nf-btn-primary:hover {
  transform: translateY(-2px);
  background: linear-gradient(135deg, #15803d, #16a34a);
  box-shadow: 0 8px 28px rgba(22, 101, 52, 0.35);
}

.nf-btn-primary svg {
  transition: transform 0.25s ease;
}

.nf-btn-primary:hover svg {
  transform: translateX(3px);
}

.nf-btn-ghost {
  border: 1.5px solid #d1d5db;
  background: rgba(255, 255, 255, 0.7);
  color: #374151;
}

.nf-btn-ghost:hover {
  border-color: #22c55e;
  background: #fff;
  color: #166534;
}

.nf-foot {
  margin-top: 32px;
  font-size: 11px;
  color: #9ca3af;
}

/* ── responsive ── */
@media (max-width: 480px) {
  .nf {
    padding: 24px 16px;
  }

  .nf-actions {
    width: 100%;
  }

  .nf-btn {
    flex: 1;
    justify-content: center;
  }
}

@media (prefers-reduced-motion: reduce) {

  .nf-glow,
  .nf-hollow,
  .nf-inner {
    animation: none;
  }
}
</style>
