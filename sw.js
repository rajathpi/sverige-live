/* Sverige Live service worker: makes the site installable and shows the last loaded data when offline.
   Pages, scripts and data go to the network first, so a deploy or a new figure shows at once; the cache
   only answers when the network fails. Versioned CDN files (D3, fonts) are served from the cache first. */
const VERSION = "sl-v1";
const PAGES = ["./", "economy/", "goteborg/", "kommuner/", "loner/", "netto/"];
const DATA_HOSTS = ["api.scb.se", "opendata-download-metobs.smhi.se", "opendata-download-metfcst.smhi.se", "www.svk.se", "polisen.se", "api.kolada.se",
  "www.elprisetjustnu.se", "jobsearch.api.jobtechdev.se", "taxonomy.api.jobtechdev.se", "skatteverket.entryscape.net"];
const IMMUTABLE_HOSTS = ["cdnjs.cloudflare.com", "cdn.jsdelivr.net"];
const MAX_DATA = 400;

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => Promise.allSettled(PAGES.map((p) => c.add(p)))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

async function networkFirst(req, cacheName) {
  const c = await caches.open(cacheName);
  try {
    const res = await fetch(req);
    if (res.ok) c.put(req, res.clone());
    return res;
  } catch (err) {
    const hit = await c.match(req, { ignoreVary: true });
    if (hit) return hit;
    throw err;
  }
}
async function cacheFirst(req) {
  const c = await caches.open(VERSION + "-cdn");
  const hit = await c.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok) c.put(req, res.clone());
  return res;
}
// Keeps the API cache from growing without bound; oldest entries go first.
async function trim() {
  const c = await caches.open(VERSION + "-data"), ks = await c.keys();
  for (let i = 0; i < ks.length - MAX_DATA; i++) await c.delete(ks[i]);
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin === self.location.origin) { e.respondWith(networkFirst(req, VERSION)); return; }
  if (IMMUTABLE_HOSTS.includes(url.hostname)) { e.respondWith(cacheFirst(req)); return; }
  if (DATA_HOSTS.includes(url.hostname)) { e.respondWith(networkFirst(req, VERSION + "-data").finally(() => trim())); }
});
