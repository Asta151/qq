// Bump this whenever you deploy changes so old caches get cleared out.
// v7: merged in the old React prototype's data/features - Body Fat % ->
// lean-mass protein calc, macro bars, a shared "profile" (weight/goal/etc
// saved from the Calculator and reused elsewhere), a dynamic water target
// (35ml/kg instead of a fixed 8 glasses), an Indian food database + Meal
// Builder with veg/vegan/jain/non-veg filtering, a goal-based Weekly Plan
// + Supplements section, and a MET-formula Calories Burned Estimator.
// Still no new asset paths - everything lives in index.html.
const CACHE_NAME = "fittrainer-cache-v7";

const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Network-first: always try to fetch the latest version first so fixes
// and content updates show up immediately. Only fall back to the cache
// when the device is offline or the network request fails.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
