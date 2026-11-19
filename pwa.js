// Регистрация service worker (работает на http://localhost и https, не на file://)
if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol))navigator.serviceWorker.register('sw.js').catch(()=>{});
