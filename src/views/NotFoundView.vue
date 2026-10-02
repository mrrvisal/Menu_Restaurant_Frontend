<!-- 404 Not Found View -->
<template>
  <div class="nf">
    <!-- decorative backdrop -->
    <div class="nf-grid" aria-hidden="true"></div>
    <div class="nf-glow g1" aria-hidden="true"></div>
    <div class="nf-glow g2" aria-hidden="true"></div>

    <!-- language switch — same pill used across the other public pages -->
    <button
      class="nf-lang"
      type="button"
      :title="i18n.locale === 'km' ? 'Switch to English' : 'ប្តូរទៅភាសាខ្មែរ'"
      @click="i18n.toggleLocale"
    >
      <AppIcon name="globe" :size="14" />
      {{ i18n.locale === "km" ? "EN" : "ខ្មែរ" }}
    </button>

    <main class="nf-inner">
      <!-- brand — logo + name -->
      <router-link to="/" class="nf-brand" :aria-label="`${i18n.t.app_name} home`">
        <img class="nf-logo" :src="DEMO_LOGO_URL" :alt="i18n.t.app_name" />
        <span class="nf-brand-name">{{ i18n.t.app_name }}</span>
      </router-link>

      <NotFoundIllustration />

      <h1 class="nf-title">{{ i18n.t.nf_title }}</h1>
      <p class="nf-desc">{{ i18n.t.nf_desc }}</p>

      <!-- auto-redirect countdown -->
      <div v-if="redirecting" class="nf-count" role="status" aria-live="polite">
        <svg class="nf-ring" viewBox="0 0 80 80" aria-hidden="true">
          <defs>
            <linearGradient id="nfRingGreen" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stop-color="#22c55e" />
              <stop offset="1" stop-color="#15803d" />
            </linearGradient>
          </defs>
          <circle class="nf-ring-track" cx="40" cy="40" r="34" />
          <circle
            class="nf-ring-bar"
            cx="40"
            cy="40"
            r="34"
            :style="{ strokeDashoffset: ringOffset }"
          />
        </svg>
        <span class="nf-count-num">{{ countdown }}</span>
      </div>
      <p v-if="redirecting" class="nf-redirect">{{ i18n.t.nf_redirect }}</p>

      <div class="nf-actions">
        <router-link to="/" class="nf-btn nf-btn-primary">{{ i18n.t.nf_gohome }}</router-link>
        <button v-if="redirecting" class="nf-btn nf-btn-ghost" type="button" @click="stayHere">
          {{ i18n.t.nf_stay }}
        </button>
      </div>

      <span class="nf-foot">© {{ year }} {{ i18n.t.app_name }}</span>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { useI18nStore } from "@/stores/i18n";
import NotFoundIllustration from "@/components/NotFoundIllustration.vue";
import AppIcon from "@/components/AppIcon.vue";
import { DEMO_LOGO_URL } from "@/data/demo";

const i18n = useI18nStore();
const router = useRouter();

// The reference design counts down, then sends the visitor home.
const REDIRECT_SECONDS = 15;
const countdown = ref(REDIRECT_SECONDS);
const redirecting = ref(true);
let timer = null;

// Progress-ring geometry — matches r="34" in the template.
const RING_RADIUS = 34;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const ringOffset = computed(
  () => RING_CIRCUMFERENCE * (1 - countdown.value / REDIRECT_SECONDS),
);

// "Stay here" — the visitor cancels the auto-redirect.
function stayHere() {
  redirecting.value = false;
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

onMounted(() => {
  timer = setInterval(() => {
    countdown.value -= 1;
    if (countdown.value <= 0) {
      stayHere();
      router.push("/");
    }
  }, 1000);
});

onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
});

// Stable year — avoids re-evaluating on every render.
const year = new Date().getFullYear();
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

/* language switch — same pill used on the other public pages */
.nf-lang {
  position: absolute;
  top: 20px;
  right: 22px;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 13px;
  border: 1.5px solid rgba(22, 101, 52, 0.16);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.85);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
  color: #33543b;
  font-family: inherit;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s, transform 0.2s;
}

.nf-lang:hover {
  border-color: #22c55e;
  color: #166534;
  transform: translateY(-1px);
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
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  animation: nfIn 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.nf-brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 18px 8px 8px;
  margin-bottom: 22px;
  border: 1px solid rgba(22, 101, 52, 0.1);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 8px 24px rgba(22, 101, 52, 0.08);
  text-decoration: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.nf-brand:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(22, 101, 52, 0.14);
}

.nf-logo {
  display: block;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  object-fit: cover;
}

.nf-brand-name {
  font-size: 15px;
  font-weight: 800;
  color: #14532d;
  letter-spacing: -0.01em;
  white-space: nowrap;
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

.nf-title {
  margin: 18px 0 12px;
  font-size: clamp(26px, 5.4vw, 40px);
  font-weight: 900;
  line-height: 1.15;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #166534, #22c55e);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.nf-desc {
  margin: 0 0 26px;
  font-size: 15px;
  line-height: 1.7;
  color: #4a6650;
}

/* auto-redirect countdown ring */
.nf-count {
  position: relative;
  width: 84px;
  height: 84px;
  display: grid;
  place-items: center;
  margin-bottom: 12px;
}

.nf-ring {
  width: 84px;
  height: 84px;
  transform: rotate(-90deg);
}

.nf-ring-track {
  fill: none;
  stroke: #e3efe6;
  stroke-width: 6;
}

.nf-ring-bar {
  fill: none;
  stroke: url(#nfRingGreen);
  stroke-width: 6;
  stroke-linecap: round;
  stroke-dasharray: 213.63;
  transition: stroke-dashoffset 1s linear;
}

.nf-count-num {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-size: 26px;
  font-weight: 900;
  color: #15803d;
}

.nf-redirect {
  margin: 0 0 26px;
  font-size: 13px;
  color: #6b7f70;
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
  font-family: inherit;
  font-size: 14px;
  font-weight: 800;
  text-decoration: none;
  cursor: pointer;
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

  .nf-lang {
    top: 14px;
    right: 14px;
  }

  .nf-actions {
    width: 100%;
    flex-direction: column;
  }

  .nf-btn {
    width: 100%;
    justify-content: center;
  }
}

@media (prefers-reduced-motion: reduce) {

  .nf-glow,
  .nf-inner {
    animation: none;
  }

  .nf-ring-bar {
    transition: none;
  }
}
</style>
