// Runtime social metadata helper — updates OpenGraph and Twitter tags dynamically for SPA views

const PROPERTY_TAGS = [
  "og:type",
  "og:url",
  "og:site_name",
  "og:title",
  "og:description",
  "og:locale",
  "og:locale:alternate",
  "og:image",
  "og:image:url",
  "og:image:secure_url",
  "og:image:alt",
  "og:image:type",
  "og:image:width",
  "og:image:height",
];

const NAME_TAGS = [
  "description",
  "twitter:card",
  "twitter:title",
  "twitter:description",
  "twitter:image",
  "twitter:image:alt",
];

let snapshot = null;

function findOrCreate(attr, key) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  return el;
}

function takeSnapshot() {
  if (snapshot) return;
  snapshot = {
    title: document.title,
    tags: {},
  };
  PROPERTY_TAGS.forEach((key) => {
    const el = document.head.querySelector(`meta[property="${key}"]`);
    snapshot.tags[`property:${key}`] = el ? el.getAttribute("content") : null;
  });
  NAME_TAGS.forEach((key) => {
    const el = document.head.querySelector(`meta[name="${key}"]`);
    snapshot.tags[`name:${key}`] = el ? el.getAttribute("content") : null;
  });
}

function setTag(attr, key, content) {
  if (content === undefined || content === null || content === "") return;
  findOrCreate(attr, key).setAttribute("content", String(content));
}

function setCanonical(url) {
  if (!url) return;
  let link = document.head.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", url);
}

// Rewrites page title and social metadata tags
export function setSocialMeta(opts = {}) {
  if (typeof document === "undefined") return;
  takeSnapshot();

  const {
    title,
    description,
    image,
    url,
    type = "website",
    siteName,
    locale = "km_KH",
    imageWidth,
    imageHeight,
  } = opts;

  if (title) document.title = title;

  setTag("property", "og:type", type);
  setTag("property", "og:title", title);
  setTag("property", "og:description", description);
  setTag("property", "og:url", url);
  setTag("property", "og:site_name", siteName);
  setTag("property", "og:locale", locale);
  setTag("property", "og:image", image);
  setTag("property", "og:image:url", image);
  setTag("property", "og:image:secure_url", image);
  setTag("property", "og:image:alt", title);
  if (image) setTag("property", "og:image:type", "image/png");
  if (imageWidth) setTag("property", "og:image:width", imageWidth);
  if (imageHeight) setTag("property", "og:image:height", imageHeight);

  setTag("name", "description", description);
  setTag("name", "twitter:card", "summary");
  setTag("name", "twitter:title", title);
  setTag("name", "twitter:description", description);
  setTag("name", "twitter:image", image);
  setTag("name", "twitter:image:alt", title);

  setCanonical(url);
}

// Restores original metadata tags recorded at initial snapshot
export function resetSocialMeta() {
  if (typeof document === "undefined" || !snapshot) return;
  document.title = snapshot.title;
  PROPERTY_TAGS.forEach((key) => {
    const el = document.head.querySelector(`meta[property="${key}"]`);
    const previous = snapshot.tags[`property:${key}`];
    if (!el) return;
    if (previous === null) el.setAttribute("content", "");
    else el.setAttribute("content", previous);
  });
  NAME_TAGS.forEach((key) => {
    const el = document.head.querySelector(`meta[name="${key}"]`);
    const previous = snapshot.tags[`name:${key}`];
    if (!el) return;
    if (previous === null) el.setAttribute("content", "");
    else el.setAttribute("content", previous);
  });
  snapshot = null;
}
