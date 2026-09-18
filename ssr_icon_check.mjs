// Live SSR validation: every icon name used across the app (dashboard status
// labels, reports tab, demo data, and the names fixed in AppIcon) must render
// a real <svg> element — AppIcon is a v-else-if chain, so an unknown name
// silently renders NOTHING.
//
// Run from the frontend folder:   node ssr_icon_check.mjs
// Exits non-zero if any name renders nothing.
import { createServer } from "vite";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";

const NAMES = [
  // order-status labels (dashboard order cards + status buttons + reports)
  "clock", "clock-check", "chef", "plate", "check-circle", "x-circle",
  // other migration targets
  "clipboard", "sparkle", "bell", "alert-circle", "category",
  // demo menu data icons
  "cup", "candy", "soup", "fish", "burger", "beer", "banana", "rice-ball",
  // names referenced by SuperAdminView (mail/copy were missing once)
  "mail", "copy",
];

const server = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
  logLevel: "error",
});

const mod = await server.ssrLoadModule("/src/components/AppIcon.vue");
const AppIcon = mod.default;

let bad = 0;
for (const name of NAMES) {
  const app = createSSRApp({
    render: () => h("span", [h(AppIcon, { name, size: 11 }), " label"]),
  });
  const html = await renderToString(app);
  const ok = html.includes("<svg") && /<path|<rect|<circle|<line/.test(html);
  const paths = (html.match(/<(path|rect|circle|line|polyline|polygon)\b/g) || []).length;
  if (!ok) bad++;
  console.log(
    `${ok ? "OK   " : "EMPTY"} ${name.padEnd(13)} shapes=${String(paths).padStart(2)}  ${html.slice(0, 58)}`,
  );
}
await server.close();
console.log(bad ? `\nFAILED: ${bad} icon(s) rendered nothing` : "\nAll icons render SVG.");
process.exit(bad ? 1 : 0);