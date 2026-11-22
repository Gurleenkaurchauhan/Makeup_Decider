// Offline support. Bump CACHE when you change this file's strategy.
const CACHE = "mc-v1";
const PRECACHE = ["./", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png"];
const allowed = (u) => u.origin === self.location.origin || u.hostname === "fonts.googleapis.com" || u.hostname === "fonts.gstatic.com";

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

// The page tells us which files it loaded, so the app also opens offline on the very next visit.
self.addEventListener("message", (e) => {
  if (e.data?.type !== "CACHE") return;
  e.waitUntil(
    caches.open(CACHE).then((c) =>
      Promise.all((e.data.urls || []).map((u) => {
        const same = new URL(u).origin === self.location.origin;
        return fetch(u, { mode: same ? "same-origin" : "no-cors" }).then((r) => c.put(u, r)).catch(() => {});
      }))
    )
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (!allowed(url)) return;

  // Pages: try the network first so updates arrive, fall back to the saved copy when offline.
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((r) => { const copy = r.clone(); caches.open(CACHE).then((c) => c.put("./", copy)); return r; })
        .catch(() => caches.match("./"))
    );
    return;
  }

  // Everything else: show the saved copy instantly and refresh it in the background.
  e.respondWith(
    caches.open(CACHE).then(async (c) => {
      const hit = await c.match(req);
      const net = fetch(req).then((r) => { if (r && (r.ok || r.type === "opaque")) c.put(req, r.clone()); return r; }).catch(() => hit);
      return hit || net;
    })
  );
});
