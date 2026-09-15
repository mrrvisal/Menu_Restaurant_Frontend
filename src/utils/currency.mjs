// frontend/src/utils/currency.mjs
// Money formatting — prices are STORED in riel (KHR). The restaurant can
// choose to DISPLAY them in US dollars using its own exchange rate
// (riel per 1 USD, owner-editable in Profile).
export function formatMoney(riel, currency = "KHR", rate = 4100) {
  const amount = Number(riel) || 0;
  if (String(currency).toUpperCase() === "USD") {
    const r = Number(rate) > 0 ? Number(rate) : 4100;
    const usd = amount / r;
    return (
      "$" +
      usd.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  }
  return amount.toLocaleString() + "៛";
}
