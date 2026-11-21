// 離線外殼快取：優先抓最新版，斷網時用快取
const C='wt-v22';
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(['./','index.html','manifest.json','icon-192.png','icon-512.png','snd/melody.mp3','snd/long.mp3'])));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.origin!==location.origin) return;
  e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp));return r;}).catch(()=>caches.match(e.request)));
});
// 推播：手機鎖螢幕時也會跳出來（番茄鐘時間到、休息結束、測試）
self.addEventListener('push',e=>{
  let d={}; try{ d=e.data?e.data.json():{}; }catch(_){ d={body:e.data&&e.data.text()}; }
  const more=d.n>1?`（第 ${d.n} 次提醒）`:'';
  e.waitUntil(self.registration.showNotification(d.title||'Work Together',{
    body:(d.body||'')+more, tag:d.tag||'wt', renotify:true, requireInteraction:true,
    vibrate:[300,150,300,150,300], icon:'icon-192.png', badge:'icon-192.png', data:{url:'./'} }));
});
// 點通知 → 回到 App
self.addEventListener('notificationclick',e=>{
  e.notification.close();
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>{
    for(const c of cs){ if('focus' in c) return c.focus(); }
    return self.clients.openWindow('./');
  }));
});
