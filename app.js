
const $=s=>document.querySelector(s),ed=$('#ed'),page=$('#page'),cv=$('#cv'),cx=cv.getContext('2d');
const PAL=`Ivory Classic|F8F5EF|E8DED0|9B8065|292722;Soft Lavender|F7F4FF|E6DCFF|A58BDF|332B47;Sage Nature|F4F6EF|DDE6D2|9BAD8B|29372B;Rose Minimal|FFF5F5|F4DCDD|D99AA5|453237;Sky Blue|F3F8FF|DCEBFA|8DB7E5|263A52;Peach Cream|FFF7F0|FCE1D0|E9A984|4B352A;Matcha|F5F5E9|E4E6BD|AAB77A|343A28;Powder Blue|F5F8FA|D8E6ED|9BBAC9|263D49;Butter Yellow|FFFAE9|F7EAB9|E5C76A|463B21;Cloud Gray|F7F8FA|E6E8ED|AEB6C2|303640;Midnight|101522|1C2638|566D9B|F0F3FA;Purple Galaxy|151020|251938|8662BD|F4EDFF;Emerald Dark|101B19|1D302B|6FAF91|E9F4EE;Cyber Blue|091724|102D43|28B7D8|E8F9FF;Noir Red|141212|272020|D85B5B|F5EEEE;Graphite|17191D|292D34|929BA8|F2F3F5;Dark Academia|211B18|382B24|B28A62|F0E5D5;Deep Ocean|101D2B|1B3348|528CB5|E9F3FC;Dark Forest|131C16|26372A|8DAB78|E9F0E5;Dark Neon Violet|141122|29213E|A78BFA|F5F0FF`.split(';').map(x=>x.split('|'));
const PS=[['Pure Minimal','Inter','Inter','none','plain',9],['Beige Minimal','Lora','Inter','none','under',0],['Dot Grid','Inter','Inter','dots','plain',9],['Bullet Journal','Caveat','Nunito Sans','dots','under',5],['Academic Clean','Playfair Display','Lora','lines','under',4],['Swiss Grid','Manrope','Manrope','grid','caps',9],['Soft Pastel','Nunito Sans','Nunito Sans','none','chip',1],['Dark Academia','Cormorant Garamond','Lora','none','under',16],['NEBULA','Manrope','Inter','grid','bar',11],['MONARCH','Cormorant Garamond','Nunito Sans','none','under',8],['NOIR','Playfair Display','Inter','none','caps',14],['SERENITY','Lora','Nunito Sans','none','chip',2]];
const FN=['Inter','Manrope','Nunito Sans','Roboto','Lora','Playfair Display','Cormorant Garamond','Caveat','IBM Plex Mono'];
const ck=t=>`<div class="ck"><input type="checkbox"> ${t}</div>`,dd=()=>new Date().toLocaleDateString('ru-RU');
let N=[],cur=null,tm,dm=0,tool='pen',dr=0,rd=[],lg=null,flt='all',last=[0,0];
const toast=m=>{const t=document.createElement('div');t.id='toast';t.textContent=m;document.body.append(t);setTimeout(()=>t.remove(),2600)};
const lum=h=>{const c=[0,2,4].map(i=>parseInt(h.substr(i,2),16)/255).map(v=>v<=.03928?v/12.92:((v+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2]};
const cr=(a,b)=>{const x=lum(a),y=lum(b);return ((Math.max(x,y)+.05)/(Math.min(x,y)+.05)).toFixed(1)};
const def=()=>({s:0,p:0,hf:'Inter',bf:'Inter',fs:16,pt:'none',h:'plain'});
const idb=new Promise((ok,no)=>{const r=indexedDB.open('noteverse',1);r.onupgradeneeded=()=>{r.result.createObjectStore('notes',{keyPath:'id'});r.result.createObjectStore('meta')};r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)});idb.catch(()=>{});
const tx=async(st,mode,f)=>{const d=await idb;return new Promise((ok,no)=>{const t=d.transaction(st,mode),o=f(t.objectStore(st));t.oncomplete=()=>ok(o&&o.result);t.onerror=t.onabort=()=>no(t.error)})};
async function persist(x){const L=x===true?N:[x||cur];try{await tx('notes','readwrite',s=>{L.forEach(n=>n&&s.put(n))});$('#st').textContent='Сохранено '+new Date().toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'});stor()}catch(e){$('#st').textContent='⚠ Не сохранено: '+(e.name=='QuotaExceededError'?'хранилище заполнено':'ошибка базы');toast('Не удалось сохранить локально — сделайте копию (⚙ → Экспорт)')}}
async function stor(){try{const e=await navigator.storage.estimate(),el=$('#sto');if(el)el.textContent='Занято '+(e.usage/1048576).toFixed(1)+' МБ из '+(e.quota/1048576).toFixed(0)+' МБ';if(e.usage/e.quota>.8)toast('Хранилище почти заполнено — сделайте копию')}catch(x){}}
function sv(){if(!cur)return;cur.h=cleanHtml();fxSync();cur.t=$('#tt').value;cur.u=Date.now();persist();list();wc()}
const svl=()=>{clearTimeout(tm);$('#st').textContent='Сохранение…';tm=setTimeout(sv,500)};
const wc=()=>{const n=(ed.innerText.match(/\S+/g)||[]).length;$('#wc').textContent=n+' слов · '+Math.max(1,Math.round(n/200))+' мин чтения'};
function list(){const q=$('#q').value.toLowerCase(),L=$('#ls');L.innerHTML='';
N.filter(n=>(flt=='all'||n.f)&&(!q||(n.t+' '+n.h.replace(/<[^>]+>/g,' ')).toLowerCase().includes(q))).sort((a,b)=>(b.f?1:0)-(a.f?1:0)||b.u-a.u).forEach(n=>{
const e=document.createElement('div');e.className='it'+(n===cur?' a':'');e.tabIndex=0;
e.innerHTML=`<span></span><button class="ib st${n.f?' on':''}" title="${n.f?'Убрать из избранного':'В избранное'}" aria-label="В избранное">${n.f?'★':'☆'}</button><button class="ib" title="Удалить" aria-label="Удалить">🗑</button>`;e.firstChild.textContent=n.t||'Без названия';
e.onclick=()=>{sv();open(n);document.body.classList.remove('so')};e.onkeydown=k=>k.key=='Enter'&&e.click();
e.children[1].onclick=k=>{k.stopPropagation();n.f=!n.f;persist(n);list();toast(n.f?'Добавлено в избранное ★':'Убрано из избранного')};
e.children[2].onclick=async k=>{k.stopPropagation();if(!await ask('Удалить «'+(n.t||'Без названия')+'»? Это нельзя отменить.'))return;N=N.filter(x=>x!==n);tx('notes','readwrite',s=>s.delete(n.id));if(!N.length)mk();if(n===cur)open(N[0]);persist(true);list();snd('del')};L.append(e)});
if(!L.children.length)L.innerHTML='<p class="emp">'+(flt=='fav'?'Нет избранных. Нажмите ☆ у заметки.':'Ничего не найдено')+'</p>'}
function mk(){const n={id:Date.now(),t:'',h:'<p><br></p>',d:'',s:def(),u:Date.now()};N.push(n);return n}
function open(n){cur=n;$('#tt').value=n.t;ed.innerHTML=n.h;design();rd=[];lg=null;fit();if(n.d&&n.d.length>200){lg=new Image();lg.onload=redraw;lg.src=n.d}redraw();wc();list();checkHl();fxScan()}
function design(){const s=cur.s,p=PAL[s.p];page.style.cssText=`--bg:#${p[1]};--sf:#${p[2]};--ac:#${p[3]};--tx:#${p[4]};--hf:'${s.hf}';--bf:'${s.bf}';--fs:${s.fs}px`;
page.dataset.p=s.pt;ed.dataset.h=s.h;$('#hf').value=s.hf;$('#bf').value=s.bf;$('#fs').value=s.fs;$('#fsv').textContent=s.fs+'px';
document.querySelectorAll('#gp button').forEach((b,i)=>b.classList.toggle('on',i==s.s));document.querySelectorAll('#gc .sw').forEach((b,i)=>b.classList.toggle('on',i==s.p))}
function fit(){const r=page.getBoundingClientRect(),k=Math.min(devicePixelRatio||1,2),w=Math.round(r.width*k),h=Math.round(r.height*k);if(!w||(cv.width==w&&cv.height==h))return;cv.width=w;cv.height=h;redraw()}
function seg(s,a,b){const u=cv.width;cx.lineCap=cx.lineJoin='round';cx.globalAlpha=s.t=='hl'?.3:1;cx.globalCompositeOperation=s.t=='er'?'destination-out':'source-over';cx.strokeStyle=s.c;cx.lineWidth=s.w*u;cx.beginPath();cx.moveTo(a[0]*u,a[1]*u);cx.lineTo(b[0]*u+.01,b[1]*u);cx.stroke()}
function redraw(){cx.globalAlpha=1;cx.globalCompositeOperation='source-over';cx.clearRect(0,0,cv.width,cv.height);if(lg&&lg.complete&&lg.naturalWidth)cx.drawImage(lg,0,0,cv.width,lg.height*cv.width/lg.width);((cur&&cur.k)||[]).forEach(s=>s.p.forEach((q,i)=>seg(s,s.p[i-1]||q,q)))}
new ResizeObserver(fit).observe(page);
const pt=e=>{const r=cv.getBoundingClientRect();return[+((e.clientX-r.left)/r.width).toFixed(4),+((e.clientY-r.top)/r.width).toFixed(4)]};let cs;
cv.onpointerdown=e=>{if(!dm)return;dr=1;cv.setPointerCapture(e.pointerId);last=pt(e);cs={t:tool,c:$('#dc').value,w:$('#dz').value/820*(tool=='pen'?1:4),p:[last]};(cur.k=cur.k||[]).push(cs);rd=[];seg(cs,last,last)};
cv.onpointermove=e=>{if(!dr)return;const p=pt(e);cs.p.push(p);seg(cs,last,p);last=p};
cv.onpointerup=cv.onpointercancel=()=>{if(dr){dr=0;sv()}};
$('#un').onclick=()=>{if(!cur.k||!cur.k.length)return toast('Нечего отменять');rd.push(cur.k.pop());redraw();sv()};
$('#re').onclick=()=>{if(!rd.length)return toast('Нечего повторять');cur.k.push(rd.pop());redraw();sv()};
$('#cl').onclick=async()=>{if(await ask('Стереть весь рисунок на этой странице?')){cur.k=[];cur.d='';lg=null;rd=[];redraw();sv()}};
document.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{tool=b.dataset.t;document.querySelectorAll('[data-t]').forEach(x=>x.classList.toggle('on',x==b))});
$('#dw').onclick=()=>{dm=!dm;page.classList.toggle('dm',dm);$('#dw').classList.toggle('on',dm);$('#dt').hidden=!dm;$('#dw').textContent=dm?'✎ Писать':'✎ Рисовать'};
const ex=(c,v)=>{ed.focus();document.execCommand(c,false,v);svl()};
document.querySelectorAll('#tb [data-c]').forEach(b=>{b.onmousedown=e=>e.preventDefault();b.onclick=()=>ex(b.dataset.c,b.dataset.v)});
$('#ck').onmousedown=$('#cd').onmousedown=$('#tbl').onmousedown=e=>e.preventDefault();
$('#ck').onclick=()=>ex('insertHTML',ck('')+'<p><br></p>');
$('#cd').onclick=()=>{const s=getSelection().toString()||'код';ex('insertHTML',`<code>${s.replace(/</g,'&lt;')}</code>&nbsp;`)};
$('#tbl').onclick=()=>ex('insertHTML','<table>'+'<tr><td><br></td><td><br></td><td><br></td></tr>'.repeat(3)+'</table><p><br></p>');
$('#fcol').oninput=e=>ex('foreColor',e.target.value);$('#hcol').oninput=e=>ex('hiliteColor',e.target.value);
$('#im').onclick=()=>$('#fi').click();
$('#fi').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{const i=new Image();i.onload=()=>{const k=Math.min(1,1000/i.width),c=document.createElement('canvas');c.width=i.width*k;c.height=i.height*k;c.getContext('2d').drawImage(i,0,0,c.width,c.height);ed.focus();document.execCommand('insertHTML',false,`<img src="${c.toDataURL('image/jpeg',.8)}">`);svl()};i.onerror=()=>toast('Не удалось открыть изображение');i.src=r.result};r.readAsDataURL(f);e.target.value=''};
ed.addEventListener('input',svl);$('#tt').oninput=svl;
ed.addEventListener('change',e=>{if(e.target.type=='checkbox'){e.target.toggleAttribute('checked',e.target.checked);svl()}});
ed.addEventListener('paste',e=>{const t=e.clipboardData.getData('text/plain');if(t&&!e.clipboardData.files.length){e.preventDefault();document.execCommand('insertText',false,t)}});
addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key=='s'){e.preventDefault();sv();snd('save')}});
$('#q').oninput=list;$('#nn').onclick=()=>{sv();open(mk());persist(true);snd('newn');document.body.classList.remove('so');ed.focus()};
$('#mb').onclick=()=>document.body.classList.toggle('so');
$('#fc').onclick=()=>{document.body.classList.toggle('fc');$('#fc').classList.toggle('on')};
$('#th').onclick=()=>{const r=document.documentElement,d=r.dataset.theme=='dark'?'light':'dark';r.dataset.theme=d;try{localStorage.setItem('nvt',d)}catch(e){}};
// popups
const pop=(id,items)=>{const p=$(id);p.innerHTML='';Object.entries(items).forEach(([k,f])=>{const b=document.createElement('button');b.textContent=k;b.onclick=()=>{p.hidden=true;f(k)};p.append(b)})};
const nm=()=>($('#tt').value||'Конспект').replace(/[\\/:*?"<>|]/g,'_');
async function dl(name,data){const d=await (window.claude&&claude.use?claude.use('downloads'):null);if(!d)return toast('Скачивание недоступно в этом окне');try{await d.save({filename:name,data});snd('ok')}catch(e){if(e.code!='declined')toast('Не удалось сохранить: '+(e.code||e.message))}}
function md(n){let s='';n.childNodes.forEach(c=>{if(c.nodeType==3){s+=c.textContent;return}const t=c.tagName.toLowerCase(),i=md(c);
s+={h1:`\n# ${i}\n`,h2:`\n## ${i}\n`,h3:`\n### ${i}\n`,b:`**${i}**`,strong:`**${i}**`,i:`*${i}*`,em:`*${i}*`,li:`- ${i}\n`,blockquote:`\n> ${i}\n`,code:'`'+i+'`',br:'\n',hr:'\n---\n',img:'[изображение]',input:c.checked?'[x] ':'[ ] ',td:i.trim()+' | ',th:i.trim()+' | ',tr:'| '+i+'\n'}[t]??(['div','p','ul','ol','table'].includes(t)?i+'\n':i)});return s}
async function pdf(){const b=$('#ex');b.textContent='Готовлю PDF…';sv();
try{if(!window.html2canvas||!window.jspdf){b.textContent='Скачать ▾';const rs=fxPause();addEventListener('afterprint',rs,{once:true});setTimeout(()=>{try{window.print()}catch(e){rs();toast('Печать недоступна в этом окне')}},60);toast('Выберите «Сохранить как PDF» в окне печати');return}
const wasDm=dm;if(dm)$('#dw').click();const rs=fxPause(),c=await html2canvas(page,{scale:2,backgroundColor:getComputedStyle(page).backgroundColor,useCORS:true}).finally(rs);
const doc=new jspdf.jsPDF({unit:'mm',format:'a4'}),sh=Math.floor(c.width*297/210);
for(let y=0,i=0;y<c.height;y+=sh,i++){const t=document.createElement('canvas');t.width=c.width;t.height=sh;const g=t.getContext('2d');g.fillStyle=getComputedStyle(page).backgroundColor;g.fillRect(0,0,t.width,t.height);g.drawImage(c,0,y,c.width,sh,0,0,c.width,sh);if(i)doc.addPage();doc.addImage(t.toDataURL('image/jpeg',.92),'JPEG',0,0,210,297)}
if(wasDm)$('#dw').click();await dl(nm()+'.pdf',doc.output('blob'))}catch(e){toast('Ошибка PDF: '+e.message)}b.textContent='Скачать ▾'}
pop('#pe',{'PDF (с рисунками)':pdf,'Markdown (.md)':()=>dl(nm()+'.md','# '+($('#tt').value||'Конспект')+'\n'+md(ed)),'Текст (.txt)':()=>dl(nm()+'.txt',ed.innerText),
'HTML (.html)':()=>{const p=PAL[cur.s.p];dl(nm()+'.html',`<!doctype html><meta charset="utf-8"><title>${nm()}</title><style>body{background:#${p[1]};color:#${p[4]};font:16px/1.65 '${cur.s.bf}',sans-serif;max-width:820px;margin:auto;padding:40px}table{border-collapse:collapse;width:100%}td,th{border:1px solid #${p[3]};padding:6px}img{max-width:100%}</style><div style="position:relative">${cleanHtml()}<img src="${cv.toDataURL()}" style="position:absolute;inset:0;width:100%;height:100%"></div>`)}});
const tg=(b,p)=>{b.onclick=e=>{e.stopPropagation();const o=!p.hidden;document.querySelectorAll('.pop').forEach(x=>x.hidden=true);p.hidden=o}};tg($('#ex'),$('#pe'));
addEventListener('click',()=>document.querySelectorAll('.pop').forEach(x=>x.hidden=true));
// design panel
PS.forEach((p,i)=>{const b=document.createElement('button');b.textContent=p[0];b.onclick=()=>{Object.assign(cur.s,{s:i,hf:p[1],bf:p[2],pt:p[3],h:p[4],p:p[5]});design();svl()};$('#gp').append(b)});
PAL.forEach((p,i)=>{const b=document.createElement('button');b.className='sw';b.title=p[0]+' — контраст '+cr(p[1],p[4])+':1';b.innerHTML=p.slice(1).map(c=>`<i style="background:#${c}"></i>`).join('');b.onclick=()=>{cur.s.p=i;design();svl()};$('#gc').append(b)});
['#hf','#bf'].forEach(id=>{$(id).innerHTML=FN.map(f=>`<option>${f}</option>`).join('');$(id).onchange=e=>{cur.s[id=='#hf'?'hf':'bf']=e.target.value;design();svl()}});
$('#fs').oninput=e=>{cur.s.fs=+e.target.value;design();svl()};
$('#ds').onclick=e=>{e.stopPropagation();$('#pn').hidden=!$('#pn').hidden};$('#pc').onclick=()=>$('#pn').hidden=true;
// prefs: звук и письмо
const CATS={type:'Набор текста',del:'Удаление',warn:'Ошибка в тексте',fix:'Исправление',save:'Сохранение',newn:'Новая заметка',nav:'Навигация',ui:'Интерфейс',ok:'Успех',fx:'Эффекты текста'};
let pf={snd:1,vol:85,v:3,fq:'auto',fo:0,style:'soft',cat:{},cv:{},sp:1,lang:'auto',ac:0,dict:[]};Object.keys(CATS).forEach(k=>{pf.cat[k]=1;pf.cv[k]=100});pf.cat.ui=0;
const savePf=()=>tx('meta','readwrite',s=>s.put(pf,'prefs')).catch(()=>toast('Настройки не сохранились'));
let AC,lt={},ht,nerr=0;
const SD={del:[[190,.06,'sine']],warn:[[330,.08,'triangle'],[262,.12,'triangle']],fix:[[520,.07,'sine'],[780,.09,'sine']],save:[[660,.1,'sine']],newn:[[440,.07,'sine'],[660,.1,'sine']],nav:[[500,.03,'sine']],ui:[[800,.02,'sine']],ok:[[523,.07,'sine'],[659,.07,'sine'],[784,.1,'sine']]};
let NB,GV=1;
function ctxA(){if(!AC){AC=new(window.AudioContext||webkitAudioContext)();const m=AC.createGain(),k=AC.createDynamicsCompressor();m.gain.value=.7;m.connect(k);k.connect(AC.destination);AC.mst=m;AC.cmp=k;NB=AC.createBuffer(1,AC.sampleRate,AC.sampleRate);const d=NB.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}if(AC.state=='suspended')AC.resume();return AC}
function nh(t,f,q,d,v,ty){const s=AC.createBufferSource(),b=AC.createBiquadFilter(),g=AC.createGain();s.buffer=NB;s.loop=true;b.type=ty||'bandpass';b.frequency.value=f;b.Q.value=q;g.gain.setValueAtTime(v*GV+.0002,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);s.connect(b);b.connect(g);g.connect(AC.mst);s.start(t,Math.random());s.stop(t+d+.02)}
function tn(t,f,d,v,w,dr){const o=AC.createOscillator(),g=AC.createGain();o.type=w||'sine';o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(f*(dr||.6),t+d);g.gain.setValueAtTime(v*GV+.0002,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(AC.mst);o.start(t);o.stop(t+d+.02)}
const TYP={soft:(t,k)=>{nh(t,700,.7,.05,2.6,'lowpass');tn(t,150*k,.07,1.3)},mech:(t,k)=>{nh(t,3800,.8,.014,1.5,'highpass');nh(t,240*k,1.2,.06,1.6);nh(t+.02,1400,1,.025,.8)},classic:(t,k)=>{nh(t,2300,1.1,.022,1.5);tn(t,1700,.1,.3,'triangle');nh(t,150*k,1,.07,1.5)}};
function snd(c,pv,kd){try{if(!pf.snd||(!pv&&!pf.cat[c])||(c=='type'&&pf.style=='silent'))return;const n=performance.now();if(!pv&&n-(lt[c]||0)<(c=='warn'?900:c=='type'?25:c=='fx'?40:60))return;lt[c]=n;ctxA();GV=(pf.vol/100)*(pf.cv[c]/100);const t=AC.currentTime;
if(c=='type'){(TYP[pf.style]||TYP.soft)(t,kd=='space'?.7:kd=='enter'?.55:.9+Math.random()*.25)}
else if(c=='fx'){if(kd=='zap'){nh(t,4500,.6,.06,1.5,'highpass');tn(t,900+Math.random()*500,.1,.4,'sawtooth')}else if(kd=='tink')tn(t,3200+Math.random()*1800,.12,.4);else nh(t,2000+Math.random()*3500,2,.02+Math.random()*.03,1.5,'highpass')}
else if(c=='del'){nh(t,260,1,.07,1.8);tn(t,170,.08,.8)}
else{let u=t;(SD[c]||[]).forEach(([f,d,w])=>{tn(u,f,d,.7,w,1);u+=d*.8})}}catch(e){}}
const FIX={'тоесть':'то есть','вобщем':'в общем','потомучто':'потому что','всмысле':'в смысле','чтото':'что-то',teh:'the',adn:'and',recieve:'receive'};
function autoFix(){const s=getSelection();if(!pf.ac||!s.rangeCount||!s.isCollapsed)return;const r=s.getRangeAt(0),n=r.startContainer;if(n.nodeType!=3)return;const m=n.data.slice(0,r.startOffset).match(/(\p{L}+)\s$/u);if(!m)return;const w=m[1],lw=w.toLowerCase();if(pf.dict.includes(w)||pf.dict.includes(lw))return;
const mp={...FIX};pf.dict.forEach(x=>{const i=x.indexOf('=');if(i>0)mp[x.slice(0,i).toLowerCase()]=x.slice(i+1)});const f=mp[lw];if(!f)return;const o=r.startOffset-1-w.length,fx=w[0]!=lw[0]?f[0].toUpperCase()+f.slice(1):f;
s.setBaseAndExtent(n,o,n,o+w.length);document.execCommand('insertText',false,fx);s.modify&&s.modify('move','forward','character');snd('fix');toast('Исправлено: '+w+' → '+fx+' (Ctrl+Z — отменить)')}
function checkHl(){if(!window.CSS||!CSS.highlights||typeof Highlight=='undefined')return 0;CSS.highlights.delete('err');if(!pf.sp)return 0;const R=[],w=document.createTreeWalker(ed,NodeFilter.SHOW_TEXT);let n;
while(n=w.nextNode()){const t=n.data;[/(\p{L}+)\s+\1(?!\p{L})/giu,/\s[,;:!?](?!\p{N})/gu,/\p{L}[,;!?]\p{L}/gu].forEach((re,k)=>{let m;while((m=re.exec(t))){if(k==0&&pf.dict.includes(m[1].toLowerCase()))continue;const g=document.createRange();g.setStart(n,m.index);g.setEnd(n,m.index+m[0].length);R.push(g)}})}
CSS.highlights.set('err',new Highlight(...R));return R.length}
function ap(){ed.spellcheck=!!pf.sp;ed.setAttribute('autocorrect',pf.ac?'on':'off');if(pf.lang=='auto')ed.removeAttribute('lang');else ed.lang=pf.lang;nerr=checkHl()}
ed.addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey||e.altKey||(e.key.length>1&&!['Backspace','Delete','Enter'].includes(e.key)))return;snd(e.key=='Backspace'||e.key=='Delete'?'del':'type',0,e.key==' '?'space':e.key=='Enter'?'enter':'')},{passive:true});
ed.addEventListener('keyup',e=>{if(e.key==' ')autoFix()});
ed.addEventListener('input',()=>{clearTimeout(ht);ht=setTimeout(()=>{const c=checkHl();if(c>nerr)snd('warn');nerr=c},700)});
document.addEventListener('click',e=>{if(e.target.closest('.it'))snd('nav');else if(e.target.closest('button'))snd('ui')});
async function backup(){sv();await dl('noteverse-backup-'+new Date().toISOString().slice(0,10)+'.json',JSON.stringify({app:'noteverse',v:2,at:Date.now(),prefs:pf,notes:N}))}
async function importBk(f){try{const j=JSON.parse(await f.text());if(j.app!='noteverse'||!Array.isArray(j.notes))throw Error('это не копия Noteverse');const ok=j.notes.filter(n=>n&&typeof n.id=='number'&&typeof n.h=='string'&&typeof n.t=='string');if(!ok.length)throw Error('нет корректных заметок');
if(!await ask('Заметок в файле: '+ok.length+' (повреждённых пропущено: '+(j.notes.length-ok.length)+'). Объединить с текущими? Для совпадающих останется более новая версия.'))return;sv();let add=0;ok.forEach(n=>{n.s=Object.assign(def(),n.s||{});n.u=n.u||0;const o=N.find(x=>x.id==n.id);if(!o){N.push(n);add++}else if(n.u>o.u){Object.assign(o,n);add++}});await persist(true);open(N.find(x=>x.id==cur.id)||N[0]);toast('Импортировано: '+add);snd('ok')}catch(e){toast('Импорт не удался: '+e.message)}}
function buildSet(){const P=$('#sp'),cb=(k,t,o)=>'<label class="rw"><input type="checkbox" data-k="'+k+'" '+(o?'checked':'')+'> '+t+'</label>';
P.innerHTML='<div style="display:flex;justify-content:space-between"><b>Настройки</b><button id="sx">✕</button></div><h4>Sound &amp; Effects</h4>'+cb('snd','Звуки включены',pf.snd)+'<div class="rw">Общая громкость <input type="range" id="vol" min="0" max="100" value="'+pf.vol+'"></div><div class="rw">Стиль печати <select id="sty">'+[['soft','Soft'],['mech','Mechanical'],['classic','Classic'],['silent','Silent']].map(a=>'<option value="'+a[0]+'" '+(pf.style==a[0]?'selected':'')+'>'+a[1]+'</option>').join('')+'</select></div>'+
Object.entries(CATS).map(([k,t])=>'<div class="rw"><input type="checkbox" data-c="'+k+'" '+(pf.cat[k]?'checked':'')+'><span style="width:120px">'+t+'</span><input type="range" data-v="'+k+'" min="0" max="100" value="'+pf.cv[k]+'"><button data-p="'+k+'" title="Прослушать">▶</button></div>').join('')+
'<h4>Writing &amp; Spell Check</h4>'+cb('sp','Подсвечивать ошибки',pf.sp)+cb('ac','Автокоррекция (отдельно от подсветки)',pf.ac)+'<div class="rw">Язык <select id="lgs"><option value="auto">Авто</option><option value="en">English</option><option value="ru">Русский</option><option value="kk">Қазақша</option></select></div><div style="color:var(--c-mt)">Личный словарь: слова-исключения по одному в строке; <code>ошибка=исправление</code> — своя автозамена.</div><textarea id="dc2" rows="5" style="width:100%">'+pf.dict.join('\n')+'</textarea>'+
'<h4>Данные на этом устройстве</h4><div class="rw"><button id="bk">Экспорт копии</button><button id="bi">Импорт копии</button><input type="file" id="bf2" accept=".json" hidden></div><div id="sto" style="color:var(--c-mt)"></div>';$('#lgs').value=pf.lang;
P.onchange=P.oninput=e=>{const t=e.target,d=t.dataset;if(t.id=='bf2'){if(t.files[0])importBk(t.files[0]);t.value='';return}if(t.id=='vol')pf.vol=+t.value;else if(t.id=='sty'){pf.style=t.value;snd('type',1)}else if(t.id=='lgs')pf.lang=t.value;else if(t.id=='dc2')pf.dict=t.value.split('\n').map(x=>x.trim()).filter(Boolean);else if(d.k)pf[d.k]=t.checked?1:0;else if(d.c)pf.cat[d.c]=t.checked?1:0;else if(d.v)pf.cv[d.v]=+t.value;else return;savePf();ap()};
P.onclick=e=>{const t=e.target;if(t.id=='sx')P.hidden=true;if(t.dataset.p)snd(t.dataset.p,1);if(t.id=='bk')backup();if(t.id=='bi')$('#bf2').click()}}
$('#sg').onclick=e=>{e.stopPropagation();buildSet();$('#sp').hidden=!$('#sp').hidden;stor()};
