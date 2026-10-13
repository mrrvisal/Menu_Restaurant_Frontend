<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="show" class="overlay" @click.self="close">
        <div class="sheet">
          <div class="sheet-h">
            <span>
              <AppIcon name="settings" :size="16" />
              {{ i18n.t.settings || "Settings" }}
            </span><button class="ic" aria-label="Close" @click="close">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div class="sheet-b">
            <div class="st-tabs">
              <button type="button" class="st-tab" :class="{ active: settingsTab === 'appearance' }"
                @click="settingsTabModel = 'appearance'">
                {{ i18n.t.settings_tab_appearance || "Appearance" }}
              </button>
              <button type="button" class="st-tab" :class="{ active: settingsTab === 'currency' }"
                @click="settingsTabModel = 'currency'">
                {{ i18n.t.currency || "Currency" }}
              </button>
              <button type="button" class="st-tab" :class="{ active: settingsTab === 'orders' }"
                @click="settingsTabModel = 'orders'">
                {{ i18n.t.settings_tab_orders || "Orders" }}
              </button>
              <button type="button" class="st-tab" :class="{ active: settingsTab === 'notify' }"
                @click="settingsTabModel = 'notify'">
                {{ i18n.t.settings_tab_notify || "Notifications" }}
              </button>
              <button type="button" class="st-tab" :class="{ active: settingsTab === 'account' }"
                @click="settingsTabModel = 'account'">
                {{ i18n.t.settings_tab_account || "Account" }}
              </button>
            </div>

            <template v-if="settingsTab === 'appearance'">
              <div v-if="!hasRestaurant" class="need-rest">
                <span>{{ i18n.t.need_restaurant || "Create a restaurant first" }}</span>
                <button type="button" class="btn btn-primary btn-sm" @click="emit('add-restaurant')">
                  {{ i18n.t.add_restaurant || "Add Restaurant" }}
                </button>
              </div>
              <div class="fld">
                <label class="fld-l">{{ i18n.t.theme_color || "Theme color" }}</label>
                <div class="swatches">
                  <button v-for="c in theme.presets" :key="c.value" type="button" class="swatch"
                    :class="{ active: theme.primary === c.value }" :style="{ background: c.value }" :title="c.name"
                    :aria-label="c.name" @click="onPresetColor(c.value)">
                    <svg v-if="theme.primary === c.value" width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </button>
                  <label class="swatch swatch-custom" :title="i18n.t.theme_custom || 'Pick any color'">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      stroke-width="1.5">
                      <circle cx="12" cy="12" r="10" />
                      <path
                        d="M12 2a10 10 0 0 0 0 20c1.1 0 2-.9 2-2v-1c0-1.1.9-2 2-2h1a4 4 0 0 0 4-4c0-6.08-4.92-11-9-11z" />
                      <circle cx="7.5" cy="10.5" r="1" fill="currentColor" />
                      <circle cx="12" cy="7.5" r="1" fill="currentColor" />
                      <circle cx="16.5" cy="10.5" r="1" fill="currentColor" />
                    </svg>
                    <input type="color" class="swatch-input" :value="theme.primary" @input="onCustomColor" />
                  </label>
                </div>
                <div class="swatch-meta">
                  <input class="fld-i hex-in" :value="theme.primary" maxlength="7" spellcheck="false"
                    placeholder="#0f766e" @change="applyHexInput" @keyup.enter="$event.target.blur()" />
                  <button type="button" class="btn btn-g btn-sm" @click="resetTheme">
                    {{ i18n.t.theme_reset || "Reset" }}
                  </button>
                </div>
              </div>

              <div class="fld sidebar-fld">
                <label class="fld-l">{{ i18n.t.sidebar_position || "Sidebar position" }}</label>
                <div class="layout-options">
                  <button v-for="pos in ['left', 'right', 'top', 'bottom']" :key="pos" type="button"
                    class="layout-opt" :class="{ active: sidebarPosition === pos }" :disabled="!hasRestaurant"
                    :title="i18n.t['sb_' + pos] || pos" @click="applySidebarPosition(pos)">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      stroke-width="1.5" stroke-linejoin="round">
                      <template v-if="pos === 'left'">
                        <rect x="3" y="4" width="5" height="16" rx="1.5" />
                        <rect x="10" y="4" width="11" height="16" rx="1.5" />
                      </template>
                      <template v-else-if="pos === 'right'">
                        <rect x="3" y="4" width="11" height="16" rx="1.5" />
                        <rect x="16" y="4" width="5" height="16" rx="1.5" />
                      </template>
                      <template v-else-if="pos === 'top'">
                        <rect x="4" y="3" width="16" height="5" rx="1.5" />
                        <rect x="4" y="10" width="16" height="11" rx="1.5" />
                      </template>
                      <template v-else>
                        <rect x="4" y="3" width="16" height="11" rx="1.5" />
                        <rect x="4" y="16" width="16" height="5" rx="1.5" />
                      </template>
                    </svg>
                    <span>{{ i18n.t['sb_' + pos] || pos }}</span>
                  </button>
                </div>
              </div>
            </template>

            <template v-else-if="settingsTab === 'currency'">
              <div v-if="settingsCurrencyMsg" class="msg msg-s">{{ settingsCurrencyMsg }}</div>
              <div v-if="settingsCurrencyError" class="msg msg-e">{{ settingsCurrencyError }}</div>
              <div class="fld">
                <label class="fld-l">{{ i18n.t.currency || "Currency" }}</label>
                <AppSelect block size="sm" tone="soft" variant="teal" :model-value="profileCurrency"
                  :options="currencyOptions" option-value="value" option-label="label"
                  @update:model-value="profileCurrencyModel = $event" />
              </div>
              <div v-if="profileCurrency === 'USD'" class="fld">
                <label class="fld-l">{{ i18n.t.exchange_rate || "Exchange rate" }}</label>
                <input v-model.number="profileRateModel" type="number" min="1" step="50" class="fld-i"
                  placeholder="4000" />
              </div>
              <button class="btn btn-primary btn-b" :disabled="currencySubmitting" @click="saveCurrency">
                {{ currencySubmitting ? i18n.t.loading : i18n.t.save }}
              </button>
            </template>

            <template v-else-if="settingsTab === 'orders'">
              <div v-if="trackingMsg" class="msg msg-s">{{ trackingMsg }}</div>
              <div v-if="trackingError" class="msg msg-e">{{ trackingError }}</div>
              <div v-if="callButtonMsg" class="msg msg-s">{{ callButtonMsg }}</div>
              <div v-if="callButtonError" class="msg msg-e">{{ callButtonError }}</div>
              <div class="fld push-fld">
                <label class="fld-l">{{ i18n.t.order_tracking || "Order tracking" }}</label>
                <p class="push-desc">
                  {{ i18n.t.order_tracking_desc || "When on, guests can open the tracking link to follow their order live. When off, guests cannot track orders." }}
                </p>
                <div class="push-row">
                  <span class="push-state" :class="orderTracking ? 'push-st-enabled' : 'push-st-disabled'">
                    <AppIcon v-if="orderTracking" name="check-circle" :size="12" />
                    {{ orderTracking ? (i18n.t.push_on || "On") : (i18n.t.push_off || "Off") }}
                  </span>
                  <button type="button" class="btn btn-sm" :class="orderTracking ? 'btn-ghost' : 'btn-g'"
                    :disabled="trackingSubmitting" @click="toggleOrderTracking">
                    {{
                      trackingSubmitting
                        ? i18n.t.loading
                        : orderTracking
                          ? i18n.t.push_disable || "Turn off"
                          : i18n.t.push_enable || "Turn on"
                    }}
                  </button>
                </div>
              </div>
              <div class="fld push-fld">
                <label class="fld-l">{{ i18n.t.call_button_visibility || "Guest call button" }}</label>
                <p class="push-desc">
                  {{ i18n.t.call_button_visibility_desc || "Show or hide the Call owner button on your public menu." }}
                </p>
                <div class="push-row">
                  <span class="push-state"
                    :class="callButtonEnabled ? 'push-st-enabled' : 'push-st-disabled'">
                    <AppIcon v-if="callButtonEnabled" name="check-circle" :size="12" />
                    {{ callButtonEnabled ? (i18n.t.push_on || "On") : (i18n.t.push_off || "Off") }}
                  </span>
                  <button type="button" class="btn btn-sm"
                    :class="callButtonEnabled ? 'btn-ghost' : 'btn-g'"
                    :disabled="callButtonSubmitting" @click="toggleCallButton">
                    {{
                      callButtonSubmitting
                        ? i18n.t.loading
                        : callButtonEnabled
                          ? i18n.t.push_disable || "Turn off"
                          : i18n.t.push_enable || "Turn on"
                    }}
                  </button>
                </div>
              </div>
            </template>

            <template v-else-if="settingsTab === 'notify'">
              <div class="fld push-fld">
                <label class="fld-l">{{ i18n.t.push_notifications || "Push notifications" }}</label>
                <p class="push-desc">
                  {{ i18n.t.push_notifications_desc || "Get an alert on this device when a new order arrives — even when the dashboard tab is closed." }}
                </p>
                <div class="push-row">
                  <span class="push-state" :class="'push-st-' + pushState">
                    <AppIcon v-if="pushState === 'enabled'" name="bell" :size="12" />
                    {{ pushStateLabel }}
                  </span>
                  <button type="button" class="btn btn-sm" :class="pushState === 'enabled' ? 'btn-ghost' : 'btn-g'"
                    :disabled="pushBusy || pushState === 'unsupported' || pushState === 'blocked'" @click="togglePush">
                    {{
                      pushBusy
                        ? i18n.t.loading
                        : pushState === "enabled"
                          ? i18n.t.push_disable || "Turn off"
                          : i18n.t.push_enable || "Turn on"
                    }}
                  </button>
                </div>
                <div v-if="pushError" class="msg msg-e">{{ pushError }}</div>
              </div>
            </template>

            <template v-else>
              <div v-if="accountSuccess" class="msg msg-s">{{ accountSuccess }}</div>
              <div v-if="accountError" class="msg msg-e">{{ accountError }}</div>
              <div class="fld">
                <label class="fld-l">{{ i18n.t.email_address || "Email address" }}</label>
                <input v-model="accountEmailModel" type="email" class="fld-i" autocomplete="email"
                  :placeholder="i18n.t.email_address || 'Email address'" />
              </div>
              <div class="fld">
                <label class="fld-l">{{ i18n.t.current_password || "Current password" }}</label>
                <input v-model="accountCurrentPasswordModel" type="password" class="fld-i"
                  autocomplete="current-password"
                  :placeholder="i18n.t.current_password || 'Current password'" />
                <p v-if="auth.user?.hasPassword === false" class="fld-hint">
                  {{ i18n.t.google_no_password_hint || "This account was created with Google — leave “Current password” empty to set your first password." }}
                </p>
              </div>
              <div class="fld">
                <label class="fld-l">{{ i18n.t.new_password || "New password" }}</label>
                <input v-model="accountNewPasswordModel" type="password" class="fld-i" autocomplete="new-password"
                  :placeholder="i18n.t.new_password || 'New password'" />
              </div>
              <button class="btn btn-primary btn-b" :disabled="accountSubmitting" @click="saveAccount">
                {{ accountSubmitting ? i18n.t.loading : i18n.t.update_account || "Update email / password" }}
              </button>
            </template>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, toRefs } from "vue";
import AppIcon from "@/components/AppIcon.vue";
import AppSelect from "@/components/AppSelect.vue";

const props = defineProps([
  "show",
  "i18n",
  "settingsTab",
  "theme",
  "onPresetColor",
  "onCustomColor",
  "applyHexInput",
  "resetTheme",
  "sidebarPosition",
  "hasRestaurant",
  "applySidebarPosition",
  "settingsCurrencyMsg",
  "settingsCurrencyError",
  "profileCurrency",
  "currencyOptions",
  "profileRate",
  "saveCurrency",
  "currencySubmitting",
  "orderTracking",
  "trackingSubmitting",
  "trackingMsg",
  "trackingError",
  "toggleOrderTracking",
  "callButtonEnabled",
  "callButtonSubmitting",
  "callButtonMsg",
  "callButtonError",
  "toggleCallButton",
  "pushState",
  "pushStateLabel",
  "pushBusy",
  "togglePush",
  "pushError",
  "accountSuccess",
  "accountError",
  "accountEmail",
  "accountCurrentPassword",
  "accountNewPassword",
  "auth",
  "accountSubmitting",
  "saveAccount",
]);
const emit = defineEmits([
  "close",
  "add-restaurant",
  "update:settingsTab",
  "update:profileCurrency",
  "update:profileRate",
  "update:accountEmail",
  "update:accountCurrentPassword",
  "update:accountNewPassword",
]);
const {
  show,
  i18n,
  settingsTab,
  theme,
  onPresetColor,
  onCustomColor,
  applyHexInput,
  resetTheme,
  sidebarPosition,
  hasRestaurant,
  applySidebarPosition,
  settingsCurrencyMsg,
  settingsCurrencyError,
  profileCurrency,
  currencyOptions,
  profileRate,
  saveCurrency,
  currencySubmitting,
  orderTracking,
  trackingSubmitting,
  trackingMsg,
  trackingError,
  toggleOrderTracking,
  callButtonEnabled,
  callButtonSubmitting,
  callButtonMsg,
  callButtonError,
  toggleCallButton,
  pushState,
  pushStateLabel,
  pushBusy,
  togglePush,
  pushError,
  accountSuccess,
  accountError,
  accountEmail,
  accountCurrentPassword,
  accountNewPassword,
  auth,
  accountSubmitting,
  saveAccount,
} = toRefs(props);

const settingsTabModel = computed({
  get: () => settingsTab.value,
  set: (value) => emit("update:settingsTab", value),
});
const profileCurrencyModel = computed({
  get: () => profileCurrency.value,
  set: (value) => emit("update:profileCurrency", value),
});
const profileRateModel = computed({
  get: () => profileRate.value,
  set: (value) => emit("update:profileRate", value),
});
const accountEmailModel = computed({
  get: () => accountEmail.value,
  set: (value) => emit("update:accountEmail", value),
});
const accountCurrentPasswordModel = computed({
  get: () => accountCurrentPassword.value,
  set: (value) => emit("update:accountCurrentPassword", value),
});
const accountNewPasswordModel = computed({
  get: () => accountNewPassword.value,
  set: (value) => emit("update:accountNewPassword", value),
});

function close() {
  emit("close");
}
</script>

<style scoped>
/* ══ OVERLAY + SHELL ══════════════════════════════════════
   The structural classes below (.overlay, .sheet, .fld, .btn,
   .msg …) previously came from the dated global admin-ui.css.
   They're redefined here — scoped styles win on the teleported
   node — so the sheet matches the modernized CreateAdminModal /
   ConfirmModal. Brand tokens keep fallbacks so it renders even
   before the restaurant theme is applied. */
.overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  padding: 20px;
  overflow-y: auto;
  overscroll-behavior: contain;
  background: rgba(17, 24, 20, 0.5);
  -webkit-backdrop-filter: blur(6px) saturate(110%);
  backdrop-filter: blur(6px) saturate(110%);
}

.sheet {
  width: 100%;
  max-width: 560px;
  /* margin:auto (not flex centering) keeps a tall sheet reachable on small screens. */
  margin: auto;
  background: var(--surface, #fff);
  border: 1px solid var(--sa-line, var(--border, #e2e8f0));
  border-radius: 18px;
  box-shadow: var(--sa-elev-floating, 0 20px 60px rgba(0, 0, 0, 0.15));
  overflow: hidden;
}

.sheet-h {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 15px 18px;
  background: linear-gradient(180deg, var(--surface-soft, #f8fdf9), var(--surface, #fff));
  border-bottom: 1px solid var(--sa-line, var(--border, #e2e8f0));
}

/* Title keeps Hanuman so Khmer glyphs (e.g. ការកំណត់) render correctly. */
.sheet-h > span {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: "Hanuman", serif;
  font-size: 15.5px;
  font-weight: 700;
  color: var(--ink, #14532d);
  line-height: 1.6;
}

.sheet-h svg {
  color: var(--primary, #0f766e);
  flex: none;
}

.ic {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  padding: 0;
  border: none;
  border-radius: 9px;
  background: none;
  color: var(--muted, #6b7280);
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s ease, color 0.15s ease;
}

.ic:hover {
  background: rgba(20, 60, 30, 0.07);
  color: var(--ink, #14532d);
}

.sheet-b {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px;
}

/* ══ FIELDS ═══════════════════════════════════════════════ */
.fld {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.fld-l {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--text, #374151);
  line-height: 1.6;
}

.fld-i {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 10px;
  background: var(--surface, #fff);
  font-family: inherit;
  font-size: 14px;
  color: var(--text, #374151);
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.fld-i:hover {
  border-color: #cbd5e1;
}

.fld-i:focus {
  border-color: var(--primary, #0f766e);
  /* Soft halo instead of jumping the border weight — keeps the hairline look. */
  box-shadow: 0 0 0 3px var(--primary-glow, rgba(15, 118, 110, 0.13));
}

.fld-i::placeholder {
  color: var(--muted-light, #9ca3af);
}

.fld-hint {
  font-size: 11.5px;
  color: var(--muted, #6b7280);
  line-height: 1.6;
}

/* ══ INLINE MESSAGES ══════════════════════════════════════ */
.msg {
  padding: 9px 12px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.6;
}

.msg-s {
  border: 1px solid var(--green-soft, #c8e6c9);
  background: var(--green-pale, #e8f5e9);
  color: var(--green-dark, #1a4a1a);
}

.msg-e {
  border: 1px solid #f8c9c4;
  background: #fdecea;
  color: var(--red, #c62828);
}

/* ══ BUTTONS ══════════════════════════════════════════════ */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 9px 16px;
  border: 1px solid transparent;
  border-radius: 10px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease,
    filter 0.15s ease, transform 0.15s ease;
}

.btn:active:not(:disabled) {
  transform: scale(0.97);
}

.btn:disabled {
  cursor: not-allowed;
}

.btn-primary,
.btn-g {
  background: var(--primary, #0f766e);
  color: var(--on-primary, #fff);
  box-shadow: 0 4px 12px -4px var(--primary-glow, rgba(15, 118, 110, 0.45));
}

.btn-primary:hover:not(:disabled),
.btn-g:hover:not(:disabled) {
  filter: brightness(1.07);
  transform: translateY(-1px);
}

.btn-primary:disabled,
.btn-g:disabled {
  background: #9ca3af;
  box-shadow: none;
}

/* Secondary = white + hairline (Stripe/Linear style). */
.btn-ghost {
  border: 1px solid var(--border, #e2e8f0);
  background: var(--surface, #fff);
  color: var(--text, #374151);
}

.btn-ghost:hover:not(:disabled) {
  background: var(--surface-warm, #f0fdf4);
  border-color: #cbd5e1;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
  border-radius: 8px;
}

.btn-b {
  width: 100%;
}

/* ══ FOCUS RINGS (a11y) ═══════════════════════════════════ */
.ic:focus-visible,
.st-tab:focus-visible,
.swatch:focus-visible,
.layout-opt:focus-visible,
.btn:focus-visible {
  outline: 2px solid var(--primary, #0f766e);
  outline-offset: 2px;
}

/* ══ TABS ═════════════════════════════════════════════════ */
.st-tabs {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.st-tab {
  padding: 7px 13px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--surface);
  color: var(--muted);
  font-family: inherit;
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.st-tab:hover {
  border-color: var(--primary-strong, var(--primary));
  color: var(--primary-strong, var(--primary));
  background: var(--surface-green);
}

.st-tab.active {
  background: var(--primary);
  border-color: var(--primary-strong, var(--primary));
  color: var(--on-primary, #fff);
  box-shadow: 0 2px 8px var(--primary-glow);
}

.swatches {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.layout-options {
  display: flex;
  gap: 8px;
}

.layout-opt {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 9px 4px;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  color: var(--muted);
  cursor: pointer;
  font-family: inherit;
  font-size: 10px;
  font-weight: 600;
  transition: all 0.15s ease;
}

.need-rest {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 9px 12px;
  margin-bottom: 14px;
  border: 1px solid var(--border, #e2e8e2);
  border-radius: 10px;
  background: var(--surface-green, #f0fdf4);
  color: var(--text-light, #4a6b4a);
  font-size: 12px;
  font-weight: 600;
}

.need-rest .btn {
  flex-shrink: 0;
}

.layout-opt:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.layout-opt:disabled:hover {
  border-color: var(--border);
  color: var(--muted);
  transform: none;
}

.layout-opt:hover {
  border-color: var(--primary-strong, var(--primary));
  color: var(--primary-strong, var(--primary));
  transform: translateY(-1px);
}

.layout-opt.active {
  border-color: var(--primary-strong, var(--primary));
  background: var(--surface-green);
  color: var(--primary-strong, var(--primary));
  box-shadow: 0 0 0 3px var(--primary-glow);
}

.layout-opt svg {
  flex-shrink: 0;
}

.layout-opt span {
  white-space: nowrap;
}

.swatch {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 2px solid var(--border);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.15s ease;
  flex-shrink: 0;
  color: #fff;
}

.swatch:hover {
  transform: scale(1.12);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.18);
}

.swatch.active {
  border-color: var(--ink);
  box-shadow: 0 0 0 3px var(--primary-glow-strong);
  color: var(--on-primary, #fff);
}

.swatch-custom {
  position: relative;
  background: conic-gradient(#ef4444,
      #f59e0b,
      #22c55e,
      #06b6d4,
      #6366f1,
      #ec4899,
      #ef4444);
  color: #fff;
  overflow: hidden;
}

.swatch-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.swatch-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.hex-in {
  max-width: 110px;
  font-family: "SFMono-Regular", Consolas, monospace;
  text-transform: lowercase;
}

.push-fld {
  padding-bottom: 6px;
  border-bottom: 1px solid var(--border, #e2e8e2);
  margin-bottom: 14px;
}

.push-desc {
  font-size: 11.5px;
  color: var(--text-light, #6a8f6a);
  line-height: 1.5;
  margin: 4px 0 10px;
}

.push-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.push-state {
  font-size: 12px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.push-st-enabled {
  color: var(--green-mid, #2d7a2d);
}

.push-st-disabled,
.push-st-unsupported,
.push-st-not_configured {
  color: var(--text-light, #6a8f6a);
}

.push-st-blocked {
  color: var(--red, #ef4444);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ─── PHONE (≤480px): tighten the tab row + controls so five tabs fit.
   These rules were orphaned outside any @media before — they applied at
   EVERY screen size and overrode the base .st-tab/.swatch sizes above. */
@media (max-width: 480px) {
  .overlay {
    padding: 12px;
  }

  .sheet {
    border-radius: 16px;
  }

  .sheet-b {
    padding: 14px;
    gap: 12px;
  }

  .st-tabs {
    gap: 4px;
  }

  .st-tab {
    padding: 6px 10px;
    font-size: 11px;
  }

  .swatch {
    width: 26px;
    height: 26px;
  }

  .layout-opt {
    padding: 7px 3px;
    font-size: 9.5px;
  }
}

@media (max-width: 900px) {
  .sidebar-fld {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
    animation: none !important;
  }
}
</style>
