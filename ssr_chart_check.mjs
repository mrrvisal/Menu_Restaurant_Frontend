// SSR check for SalesChart.vue — run from the frontend folder:
//   node ssr_chart_check.mjs
import { createServer } from "vite";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";

const server = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
  logLevel: "error",
});

const Chart = (await server.ssrLoadModule("/src/components/SalesChart.vue")).default;

const points = [
  { label: "2026-09-10", value: 125000 },
  { label: "2026-09-11", value: 0 },
  { label: "2026-09-12", value: 45000 },
  { label: "2026-09-W37", value: 9000 },
];

let fails = 0;
const check = (label, cond, extra = "") => {
  if (!cond) fails++;
  console.log(`${cond ? "OK   " : "FAIL"} ${label}${extra ? "  " + extra : ""}`);
};

const html = await renderToString(
  createSSRApp({
    render: () =>
      h(Chart, {
        points,
        height: 190,
        formatValue: (v) => `${v}៛`,
        formatAxis: (v) => `${v}`,
        ariaLabel: "Sales chart",
      }),
  }),
);

check("renders an <svg> with role=img", html.includes('role="img"'));
check("draws one bar per point", (html.match(/class="chart-bar"/g) || []).length === 4,
  `bars=${(html.match(/class="chart-bar"/g) || []).length}`);
check("draws hit areas for tooltips", (html.match(/class="chart-hit"/g) || []).length === 4);
check("value axis has 5 gridlines", (html.match(/chart-grid/g) || []).length === 1 &&
  (html.match(/<line /g) || []).length === 5, `lines=${(html.match(/<line /g) || []).length}`);
check("shortens long x labels", html.includes(">09-10<") && html.includes(">9-W37<"));
check("uses a gradient fill", html.includes("url(#sc-grad-"));
check("embed dataset in tooltips", /<title[^>]*>2026-09-10 — 125000៛<\/title>/.test(html));
// 125000 → nice axis top 200000 ⇒ 1/5 of the plot is 40px+ of a 150px area
check("bar heights scale to the axis", /height="1[0-9]{2}(\.\d+)?"/.test(html),
  `heights=${(html.match(/class="chart-bar"[^>]*height="[\d.]+"/g) || []).join(" | ")}`);
check("zero-value day draws no bar body", html.includes('height="0"'));

// empty state
const empty = await renderToString(
  createSSRApp({ render: () => h(Chart, { points: [], emptyText: "No data yet" }) }),
);
check("empty state shows the message", empty.includes("No data yet") && !empty.includes("<svg"));

// single point (Today preset) must not divide by zero
const one = await renderToString(
  createSSRApp({ render: () => h(Chart, { points: [{ label: "Today", value: 7 }] }) }),
);
check("single point renders", (one.match(/class="chart-bar"/g) || []).length === 1);

await server.close();
console.log(fails ? `\nFAILED: ${fails}` : "\nSalesChart SSR checks passed.");
process.exit(fails ? 1 : 0);