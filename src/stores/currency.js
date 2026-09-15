// frontend/src/stores/currency.js
// Display-currency for the whole UI (guest menu, cart, dashboard, KDS,
// tracker). Prices stay stored in riel — this store only decides HOW they
// are shown: ៛ as-is, or converted to $ via the restaurant's exchange rate.
// Feed it from whichever restaurant object is in context:
//   guest menu  → currencyStore.setFrom(restaurantInfo)
//   dashboard   → currencyStore.setFrom(auth.restaurant)
//   tracker     → currencyStore.setFrom(sseSnapshot)
import { defineStore } from "pinia";
import { ref } from "vue";
import { formatMoney } from "@/utils/currency.mjs";

export const useCurrencyStore = defineStore("currency", () => {
  const currency = ref("KHR"); // 'KHR' | 'USD'
  const rate = ref(4100); // riel per 1 US dollar

  // Accepts any restaurant-ish object (camelCase or snake_case); unknown
  // fields are ignored so a partial object never resets the defaults.
  function setFrom(source) {
    if (!source) return;
    const c = String(source.currency || "").toUpperCase();
    if (c === "USD" || c === "KHR") currency.value = c;
    const r = Number(source.exchangeRate ?? source.exchange_rate);
    if (Number.isFinite(r) && r > 0) rate.value = r;
  }

  // Format a riel amount using the active display currency
  function fmt(riel) {
    return formatMoney(riel, currency.value, rate.value);
  }

  return { currency, rate, setFrom, fmt };
});
