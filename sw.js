// Service worker: кэширует всё приложение, чтобы оно открывалось без интернета.
const V='noteverse-v3';
const FILES=['./','index.html','css/style.css','css/extra.css','js/app.js','js/fx.js','js/templates.js','js/pdfview.js','js/init.js','js/pwa.js','manifest.webmanifest','icon.svg','vendor/pdfjs/pdf.min.mjs','vendor/pdfjs/pdf.worker.min.mjs'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>Promise.all(FILES.map(f=>c.add(f).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!=V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!='GET')return;
e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{if(res.ok&&new URL(r.url).origin==location.origin){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp))}return res}).catch(()=>caches.match('index.html'))))});
