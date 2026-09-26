// frontend/src/utils/share.mjs
// ─── UNIVERSAL SHARING ─────────────────────────────────────────────────────
// One place that knows how to send a menu link to EVERY platform:
//
//   · Web Share API  → every app installed on the phone (Instagram DM,
//                      Messenger, WeChat, Telegram, TikTok, Signal, Viber…)
//   · Facebook · Messenger · Telegram · WhatsApp · Instagram · WeChat ·
//     LINE · Viber · LinkedIn · X (Twitter) · Reddit · Pinterest · Email · SMS
//   · copy link · QR code (scan from another phone — this is how WeChat works
//     when the page is not opened inside WeChat itself)
//
// Deep links (fb-messenger://, viber://, sms:, mailto:) copy the link first, so
// the user always ends up with something to paste when no app is installed.

const RAW_API = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

// Absolute API base — VITE_API_URL may be a path ("/api-proxy") in some setups.
function apiBase() {
  if (!RAW_API) return "";
  if (/^https?:\/\//i.test(RAW_API)) return RAW_API;
  if (typeof window === "undefined") return RAW_API;
  return `${window.location.origin}${RAW_API.startsWith("/") ? "" : "/"}${RAW_API}`;
}

// Where share links point. Default: the API share card (/s/menu), which carries
// the restaurant's Open Graph tags so chats show a real preview. Set
// VITE_SHARE_BASE_URL to "/s/menu" once the site proxies /s/* to the API, or to
// an absolute URL (e.g. the API domain) when both are hosted separately.
export function shareCardBase() {
  const configured = String(import.meta.env.VITE_SHARE_BASE_URL || "").trim();
  if (configured) {
    if (/^https?:\/\//i.test(configured))
      return configured.replace(/\/+$/, "");
    if (configured.startsWith("/") && typeof window !== "undefined")
      return `${window.location.origin}${configured}`.replace(/\/+$/, "");
  }
  const api = apiBase();
  if (api) return `${api}/s/menu`;
  if (typeof window !== "undefined") return `${window.location.origin}/s/menu`;
  return "/s/menu";
}

// ─── URL BUILDERS ──────────────────────────────────────────────────────────

function menuParams({ rid, restaurantId, table }) {
  const params = new URLSearchParams();
  if (rid) params.set("rid", String(rid));
  else if (restaurantId) params.set("restaurant_id", String(restaurantId));
  if (table) params.set("table", String(table));
  return params;
}

// Direct SPA address of the menu (what humans really open).
export function buildMenuUrl({ rid, restaurantId, table, origin } = {}) {
  const base = `${(origin || window.location.origin || "").replace(/\/+$/, "")}/menu`;
  const qs = menuParams({ rid, restaurantId, table }).toString();
  return qs ? `${base}?${qs}` : base;
}

// Returns BOTH addresses:
//   spaUrl   → open the menu directly (no bounce)
//   shareUrl → the preview card (rich Open Graph thumbnail in every chat app)
export function buildShareLinks({ rid, restaurantId, table } = {}) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const spaUrl = buildMenuUrl({ rid, restaurantId, table });
  const params = menuParams({ rid, restaurantId, table });
  // `to` pins the bounce target to THIS site (the API only accepts origins it
  // knows, so the card can never become an open redirect).
  if (origin) params.set("to", origin);
  const qs = params.toString();
  return { spaUrl, shareUrl: qs ? `${shareCardBase()}?${qs}` : shareCardBase() };
}

// QR of any of the URLs above (rendered by the API: GET /s/qr.png).
export function qrImageUrl(data, { size = 260, color = "#111827" } = {}) {
  const api = apiBase();
  const base = api ? `${api}/s/qr.png` : "/s/qr.png";
  const params = new URLSearchParams({ data: String(data || "") });
  params.set("size", String(size));
  if (color) params.set("color", color);
  return `${base}?${params.toString()}`;
}

function isMobileDevice() {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod|Android|Mobile|Windows Phone|Silk/i.test(
    navigator.userAgent || "",
  );
}

export function canNativeShare() {
  return (
    typeof navigator !== "undefined" && typeof navigator.share === "function"
  );
}

// ─── PLATFORM MATRIX ───────────────────────────────────────────────────────

/**
 * The platforms offered in the share sheet.
 *
 * kind: "link"           → open `href` (popup for http, app switch otherwise)
 *       "native"         → Web Share API (any installed app)
 *       "native-or-copy" → native share when available, else copy + hint
 *       "clipboard-open" → copy the link, then open `href`
 *       "copy"           → copy only
 *       "qr"             → show the QR panel
 */
export function buildShareTargets({ url, text, image } = {}) {
  const e = encodeURIComponent;
  const mobile = isMobileDevice();
  const message = `${text ? `${text} ` : ""}${url}`;

  return [
    { key: "native", icon: "share", kind: "native" },
    {
      key: "facebook",
      icon: "brand-facebook",
      tone: "#1877F2",
      kind: "link",
      href: `https://www.facebook.com/sharer/sharer.php?u=${e(url)}`,
    },
    {
      key: "messenger",
      icon: "brand-messenger",
      tone: "#0084FF",
      kind: "clipboard-open",
      href: mobile
        ? `fb-messenger://share/?link=${e(url)}`
        : "https://www.messenger.com/",
      hint: "share_messenger_hint",
    },
    {
      key: "telegram",
      icon: "brand-telegram",
      tone: "#229ED9",
      kind: "link",
      href: `https://t.me/share/url?url=${e(url)}&text=${e(text || "")}`,
    },
    {
      key: "whatsapp",
      icon: "brand-whatsapp",
      tone: "#25D366",
      kind: "link",
      href: `https://api.whatsapp.com/send?text=${e(message)}`,
    },
    {
      key: "instagram",
      icon: "brand-instagram",
      tone: "#E1306C",
      kind: "native-or-copy",
      hint: "share_instagram_hint",
    },
    {
      key: "wechat",
      icon: "brand-wechat",
      tone: "#07C160",
      kind: "qr",
      hint: "share_wechat_hint",
    },
    {
      key: "line",
      icon: "brand-line",
      tone: "#06C755",
      kind: "link",
      href: `https://social-plugins.line.me/lineit/share?url=${e(url)}&text=${e(text || "")}`,
    },
    {
      key: "viber",
      icon: "brand-viber",
      tone: "#7360F2",
      kind: "clipboard-open",
      href: `viber://forward?text=${e(message)}`,
      hint: "share_viber_hint",
    },
    {
      key: "linkedin",
      icon: "brand-linkedin",
      tone: "#0A66C2",
      kind: "link",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${e(url)}`,
    },
    {
      key: "x",
      icon: "brand-x",
      tone: "#0F1419",
      kind: "link",
      href: `https://twitter.com/intent/tweet?url=${e(url)}&text=${e(text || "")}`,
    },
    {
      key: "reddit",
      icon: "brand-reddit",
      tone: "#FF4500",
      kind: "link",
      href: `https://www.reddit.com/submit?url=${e(url)}&title=${e(text || "")}`,
    },
    image
      ? {
          key: "pinterest",
          icon: "brand-pinterest",
          tone: "#E60023",
          kind: "link",
          href: `https://pinterest.com/pin/create/button/?url=${e(url)}&media=${e(image)}&description=${e(text || "")}`,
        }
      : null,
    {
      key: "email",
      icon: "mail",
      tone: "#EA4335",
      kind: "link",
      href: `mailto:?subject=${e(text || "")}&body=${e(message)}`,
    },
    {
      key: "sms",
      icon: "brand-sms",
      tone: "#34C759",
      kind: "link",
      href: `sms:?&body=${e(message)}`,
    },
  ].filter(Boolean);
}

// ─── ACTIONS ───────────────────────────────────────────────────────────────

// Clipboard with a fallback for insecure contexts / older browsers.
export async function copyToClipboard(text) {
  const value = String(text || "");
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    /* fall through to the legacy path */
  }
  try {
    const area = document.createElement("textarea");
    area.value = value;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.top = "-1000px";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}

// http(s) → popup window; custom schemes (app deep links, sms:, mailto:) MUST
// replace the current location, otherwise the OS never sees the app switch.
function openExternal(href) {
  if (!href) return;
  if (/^https?:/i.test(href)) {
    const win = window.open(
      href,
      "_blank",
      "noopener,noreferrer,width=680,height=680",
    );
    if (win) win.opener = null;
    return;
  }
  window.location.href = href;
}

/**
 * Runs one platform entry from buildShareTargets().
 *
 * @returns {Promise<{status: string, hint?: string}>}
 *   status: shared | opened | copied | qr | cancelled | error
 */
export async function runShareTarget(target, ctx = {}) {
  const url = ctx.url || "";
  const text = ctx.text || "";
  const title = ctx.title || text;

  const nativeShare = async () => {
    try {
      await navigator.share({ title, text, url });
      return { status: "shared" };
    } catch (err) {
      return err?.name === "AbortError"
        ? { status: "cancelled" }
        : { status: "error" };
    }
  };

  switch (target.kind) {
    case "native":
      return canNativeShare() ? nativeShare() : { status: "error" };
    case "native-or-copy":
      // Instagram has no web share endpoint: hand the link to the OS share
      // sheet when it exists, otherwise copy it for a DM / Story paste.
      if (canNativeShare()) return nativeShare();
      await copyToClipboard(url);
      return { status: "copied", hint: target.hint };
    case "copy":
      await copyToClipboard(url);
      return { status: "copied" };
    case "clipboard-open":
      await copyToClipboard(url);
      openExternal(target.href);
      return { status: "copied", hint: target.hint };
    case "qr":
      return { status: "qr", hint: target.hint };
    default:
      openExternal(target.href);
      return { status: "opened" };
  }
}

