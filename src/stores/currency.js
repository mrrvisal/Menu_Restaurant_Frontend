import { defineStore } from "pinia";
import { ref } from "vue";
import { formatMoney } from "@/utils/currency.mjs";

// Manages display currency (KHR / USD) and exchange rate conversion
export const useCurrencyStore = defineStore("currency", () => {
  const currency = ref("KHR"); // "KHR" | "USD"
  const rate = ref(4000); // Riel per 1 USD

  // Sync display settings from any restaurant source object
  function setFrom(source) {
    if (!source) return;
    const c = String(source.currency || "").toUpperCase();
    if (c === "USD" || c === "KHR") currency.value = c;
    const r = Number(source.exchangeRate ?? source.exchange_rate);
    if (Number.isFinite(r) && r > 0) rate.value = r;
  }

  // Format riel amount based on current currency and rate
  function fmt(riel) {
    return formatMoney(riel, currency.value, rate.value);
  }

  return { currency, rate, setFrom, fmt };
});
