// public/sw.js — Service worker for Web Push notifications.
// Minimal by design: it only handles push events and notification clicks,
// it does NOT intercept fetch() so it can never break the app's caching.
/* eslint-env serviceworker */

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// ─── PUSH EVENT ─────────────────────────────────────────────
// Payload sent by the backend (services/webpush.js):
//   { title, body, tag, url, icon }
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : "New notification" };
  }

  const title = data.title || "Digital Menu";
  const options = {
    body: data.body || "",
    icon: data.icon || "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag: data.tag, // collapses repeated alerts for the same order
    renotify: !!data.tag, // vibrate/alert again even with the same tag
    requireInteraction: false,
    data: { url: data.url || "/dashboard" },
  };

  event.waitUntil(
    self.registration.showNotification(title, options),
  );
});

// ─── NOTIFICATION CLICK ─────────────────────────────────────
// Focus an existing app window if there is one, otherwise open the URL.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/dashboard";

  event.waitUntil(
    (async () => {
      const clientList = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      for (const client of clientList) {
        if ("focus" in client) {
          // Bring the app to front; try to navigate to the target URL.
          try {
            if ("navigate" in client) await client.navigate(url);
          } catch {
            /* navigation cross-origin or not allowed — focusing is enough */
          }
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })(),
  );
});
