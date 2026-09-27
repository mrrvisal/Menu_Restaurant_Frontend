// Money formatting — prices stored in riel (KHR), with optional USD display
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
