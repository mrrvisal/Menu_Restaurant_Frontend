<!-- frontend/src/components/ShareGrid.vue -->
<!-- ───────────────────────────────────────────────────────────
   ShareGrid — the platform picker used by every share surface
   (customer menu sheet, owner dashboard, …).

   Platforms: Web Share (any installed app) · Facebook · Messenger ·
   Telegram · WhatsApp · Instagram · WeChat · LINE · Viber · LinkedIn ·
   X · Reddit · Pinterest · Email · SMS, plus copy-link and a QR panel
   (scan from another phone — the WeChat route on desktop).
   ─────────────────────────────────────────────────────────── -->
<template>
  <div class="sg" :style="accent ? { '--sg-accent': accent } : null">
    <div v-if="showHeader" class="sg-head">
      <span class="sg-title">{{ title || i18n.t.share_title }}</span>
      <span class="sg-sub">{{ i18n.t.share_subtitle }}</span>
    </div>

    <div class="sg-tiles">
      <button
        v-for="target in targets"
        :key="target.key"
        type="button"
        class="sg-tile"
        :style="{ '--tone': target.tone || 'var(--sg-accent)' }"
        :title="labelFor(target)"
        @click="pick(target)"
      >
        <span class="sg-ic">
          <AppIcon :name="target.icon" :size="20" />
        </span>
        <span class="sg-label">{{ labelFor(target) }}</span>
      </button>

      <!-- Copy link -->
      <button
        type="button"
        class="sg-tile sg-tile-act"
        :class="{ done: copied }"
        :title="i18n.t.copy_link"
        @click="copyLink"
      >
        <span class="sg-ic">
          <AppIcon :name="copied ? 'clipboard-check' : 'copy'" :size="20" />
        </span>
        <span class="sg-label">{{
          copied ? i18n.t.link_copied : i18n.t.copy_link
        }}</span>
      </button>

      <!-- QR -->
      <button
        type="button"
        class="sg-tile sg-tile-act"
        :class="{ done: showQr }"
        :title="i18n.t.share_qr"
        @click="toggleQr"
      >
        <span class="sg-ic"><AppIcon name="qr" :size="20" /></span>
        <span class="sg-label">{{ i18n.t.share_qr }}</span>
      </button>
    </div>

    <!-- Platform-specific guidance (Instagram / WeChat / Messenger / Viber) -->
    <p v-if="hint" class="sg-hint">
      <AppIcon name="info" :size="13" />
      <span>{{ hint }}</span>
    </p>

    <!-- ─── QR PANEL (scan with another phone / WeChat) ─── -->
    <div v-if="showQr" class="sg-qr">
      <div class="sg-qr-box">
        <img
          v-if="qrSrc && !qrFailed"
          :src="qrSrc"
          :alt="i18n.t.share_qr"
          class="sg-qr-img"
          @error="onQrError"
        />
        <div v-else class="sg-qr-fallback">
          <AppIcon name="qr" :size="34" />
        </div>
      </div>
      <p class="sg-qr-hint">{{ qrFailed ? i18n.t.share_qr_failed : i18n.t.share_qr_hint }}</p>
      <button type="button" class="sg-qr-copy" @click="copyLink">
        <AppIcon name="copy" :size="14" />
        {{ copied ? i18n.t.link_copied : i18n.t.copy_link }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import AppIcon from "@/components/AppIcon.vue";
import { useI18nStore } from "@/stores/i18n";
import {
  buildShareTargets,
  canNativeShare,
  copyToClipboard,
  qrImageUrl,
  runShareTarget,
} from "@/utils/share.mjs";

const props = defineProps({
  // The link that is pasted into chats (share card when available).
  url: { type: String, default: "" },
  // What the QR should encode — normally the direct SPA menu link, so a camera
  // scan opens the menu without the share-card bounce. Defaults to `url`.
  qrUrl: { type: String, default: "" },
  // Message that goes with the link.
  text: { type: String, default: "" },
  // Image for Pinterest (absolute URL, optional).
  image: { type: String, default: "" },
  // Heading override.
  title: { type: String, default: "" },
  // Restaurant theme color used for the copy / QR tiles.
  accent: { type: String, default: "" },
  showHeader: { type: Boolean, default: true },
});

const emit = defineEmits(["shared", "copied"]);

const i18n = useI18nStore();

const copied = ref(false);
const showQr = ref(false);
const qrFailed = ref(false);
const hint = ref("");

// `native` only exists where the Web Share API does; Pinterest needs an image.
const targets = computed(() =>
  buildShareTargets({
    url: props.url,
    text: props.text,
    image: props.image,
  }).filter((t) => (t.key === "native" ? canNativeShare() : true)),
);

// QR sources, tried in order: `qrUrl` (the direct SPA menu link) and then
// `url` (the share card). The API renders the PNG (/s/qr.png) only for hosts
// it trusts, so when one of the two is rejected the other is used before the
// panel gives up — no more empty QR box in production.
const qrCandidates = computed(() => {
  const list = [props.qrUrl, props.url].filter(Boolean);
  return [...new Set(list)];
});
const qrIndex = ref(0);
const qrSrc = computed(() => {
  const target = qrCandidates.value[qrIndex.value];
  return target ? qrImageUrl(target, { size: 280 }) : "";
});

// A rejected image (403/400 from the API, offline CDN, …) must not leave the
// panel empty: step to the next candidate and only give up on the last one.
function onQrError() {
  if (qrIndex.value < qrCandidates.value.length - 1) qrIndex.value += 1;
  else qrFailed.value = true;
}

function labelFor(target) {
  return i18n.t[`share_${target.key}`] || target.key;
}

function flashCopied() {
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 2000);
}

async function copyLink() {
  const ok = await copyToClipboard(props.url);
  if (ok) {
    flashCopied();
    hint.value = "";
    emit("copied", props.url);
  } else {
    hint.value = i18n.t.share_copy_failed;
  }
}

function toggleQr() {
  showQr.value = !showQr.value;
  qrFailed.value = false;
  qrIndex.value = 0;
  if (showQr.value) hint.value = "";
}

async function pick(target) {
  hint.value = "";
  const result = await runShareTarget(target, {
    url: props.url,
    text: props.text,
    title: props.title || props.text,
  });

  if (result.status === "qr") {
    showQr.value = true;
    qrFailed.value = false;
    qrIndex.value = 0;
    // The QR *is* the WeChat / cross-device path — explain it.
    hint.value = i18n.t[target.hint] || i18n.t.share_wechat_hint;
    return;
  }

  if (result.status === "copied") {
    flashCopied();
    if (result.hint) hint.value = i18n.t[result.hint] || "";
    return;
  }

  if (result.status === "shared" || result.status === "opened") {
    emit("shared", result, target);
  }
}

// A new URL (another restaurant / table) resets the panel state.
watch(
  () => [props.url, props.qrUrl],
  () => {
    hint.value = "";
    showQr.value = false;
    qrFailed.value = false;
    qrIndex.value = 0;
    copied.value = false;
  },
);
</script>

<style scoped>
.sg {
  --sg-accent: var(--primary, #16a34a);
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.sg-head {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.sg-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--ink, #111827);
}
.sg-sub {
  font-size: 12px;
  line-height: 1.5;
  color: var(--muted, #6b7280);
}

/* ── platform tiles ── */
.sg-tiles {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px 6px;
}
.sg-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 8px 2px;
  border: 0;
  border-radius: 14px;
  background: transparent;
  color: var(--tone);
  transition:
    background 0.16s ease,
    transform 0.16s ease;
}
.sg-tile:hover {
  background: color-mix(in srgb, var(--tone) 8%, transparent);
  transform: translateY(-1px);
}
.sg-tile:active {
  transform: scale(0.96);
}
.sg-ic {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--tone) 13%, #fff);
  border: 1px solid color-mix(in srgb, var(--tone) 22%, transparent);
}
.sg-tile.done .sg-ic {
  background: color-mix(in srgb, var(--sg-accent) 20%, #fff);
  border-color: color-mix(in srgb, var(--sg-accent) 40%, transparent);
}
.sg-tile-act {
  --tone: var(--sg-accent);
}
.sg-label {
  font-size: 10.5px;
  font-weight: 600;
  line-height: 1.25;
  text-align: center;
  color: var(--ink, #374151);
}

/* ── platform guidance ── */
.sg-hint {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin: 0;
  padding: 8px 10px;
  border-radius: 10px;
  font-size: 11.5px;
  line-height: 1.6;
  color: var(--muted, #6b7280);
  background: color-mix(in srgb, var(--sg-accent) 7%, #fff);
  border: 1px solid color-mix(in srgb, var(--sg-accent) 16%, transparent);
}

/* ── QR panel ── */
.sg-qr {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-radius: 14px;
  background: #fff;
  border: 1px dashed color-mix(in srgb, var(--sg-accent) 32%, transparent);
}
.sg-qr-box {
  width: 150px;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.sg-qr-img {
  width: 150px;
  height: 150px;
  display: block;
  border-radius: 8px;
}
.sg-qr-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  color: var(--sg-accent);
  background: color-mix(in srgb, var(--sg-accent) 8%, #fff);
}
.sg-qr-hint {
  margin: 0;
  font-size: 11.5px;
  line-height: 1.6;
  text-align: center;
  color: var(--muted, #6b7280);
}
.sg-qr-copy {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--sg-accent);
  background: transparent;
  border: 1px solid color-mix(in srgb, var(--sg-accent) 30%, transparent);
}
.sg-qr-copy:hover {
  background: color-mix(in srgb, var(--sg-accent) 8%, transparent);
}

@media (max-width: 420px) {
  .sg-ic {
    width: 38px;
    height: 38px;
  }
  .sg-label {
    font-size: 9.5px;
  }
}
</style>

