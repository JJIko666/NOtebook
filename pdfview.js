// ===== Просмотр PDF без интернета (PDF.js лежит локально в vendor/pdfjs/) =====
(function(){
const base=new URL('../vendor/pdfjs/',document.currentScript.src);
let lib=null,doc=null,lt=null,pn=1,scale=1.25,task=null,tcache=new Map(),hits=[],hi=-1,busy=0;
const btn=document.createElement('button');btn.id='pdfb';btn.title='Открыть PDF без интернета';btn.textContent='📄 PDF';$('#th').before(btn);
const m=document.createElement('div');m.id='pvw';m.hidden=true;
m.innerHTML='<div class="pvh"><button id="pvo" class="pri">Открыть PDF…</button><input type="file" id="pvf" accept="application/pdf,.pdf" hidden><button id="pvprev" aria-label="Предыдущая страница">◀</button><input id="pvn" type="number" min="1" value="1" style="width:64px" aria-label="Страница"><span id="pvt">/ –</span><button id="pvnext" aria-label="Следующая страница">▶</button><button id="pvzo" aria-label="Уменьшить">−</button><span id="pvz">125%</span><button id="pvzi" aria-label="Увеличить">+</button><button id="pvfit">По ширине</button><input id="pvq" type="search" placeholder="Поиск в PDF" style="width:170px" aria-label="Поиск в PDF"><button id="pvgo">Найти</button><span id="pvr" style="color:var(--c-mt)"></span><button id="pvc" style="margin-left:auto">✕ Закрыть</button></div><div id="pvs"><div id="pvp" hidden><canvas id="pvcv"></canvas><div id="pvhl"></div></div><div id="pve" class="emp">Откройте PDF-файл с компьютера. Всё работает без интернета.</div></div>';
document.body.append(m);
const g=id=>m.querySelector('#'+id);
const msg=t=>{g('pve').hidden=false;g('pve').textContent=t;g('pvp').hidden=true};
async function getLib(){if(!lib){lib=await import(new URL('pdf.min.mjs',base).href);lib.GlobalWorkerOptions.workerSrc=new URL('pdf.worker.min.mjs',base).href}return lib}
function closeDoc(){if(task){try{task.cancel()}catch(e){}task=null}if(lt){try{lt.destroy()}catch(e){}lt=null}doc=null;tcache.clear();hits=[];hi=-1}
async function load(file){if(!file)return;try{await getLib();closeDoc();msg('Загрузка…');const data=new Uint8Array(await file.arrayBuffer());lt=lib.getDocument({data});doc=await lt.promise;pn=1;g('pvn').max=doc.numPages;g('pvt').textContent='/ '+doc.numPages;g('pve').hidden=true;g('pvp').hidden=false;await fit(true);await draw()}
catch(e){closeDoc();msg('Не удалось открыть PDF: '+(e&&e.message?e.message:e));toast('Не удалось открыть PDF')}}
async function fit(auto){if(!doc)return;const p=await doc.getPage(pn),w=p.getViewport({scale:1}).width;if(auto||true)scale=Math.max(.3,Math.min(4,(g('pvs').clientWidth-48)/w));scale=Math.round(scale*100)/100}
async function draw(){if(!doc)return;const my=++busy;if(task){try{task.cancel()}catch(e){}}
const pg=await doc.getPage(pn),vp=pg.getViewport({scale}),cv=g('pvcv'),r=Math.min(devicePixelRatio||1,2);cv.width=Math.round(vp.width*r);cv.height=Math.round(vp.height*r);cv.style.width=vp.width+'px';cv.style.height=vp.height+'px';
g('pvz').textContent=Math.round(scale*100)+'%';g('pvn').value=pn;
task=pg.render({canvas:cv,viewport:vp,transform:r!=1?[r,0,0,r,0,0]:null});try{await task.promise}catch(e){if(e&&e.name=='RenderingCancelledException')return;throw e}
if(my!=busy)return;pg.cleanup();await marks(pg,vp)}
async function text(n){if(tcache.has(n))return tcache.get(n);const p=await doc.getPage(n),t=await p.getTextContent();if(tcache.size>40)tcache.delete(tcache.keys().next().value);tcache.set(n,t.items);p.cleanup();return t.items}
async function marks(pg,vp){const L=g('pvhl');L.innerHTML='';const q=g('pvq').value.trim().toLowerCase();if(!q||!hits.length)return;const items=await text(pn);hits.forEach((h,k)=>{if(h.page!=pn)return;const it=items[h.idx];if(!it||!it.transform)return;const t=lib.Util.transform(vp.transform,it.transform),hh=Math.hypot(t[2],t[3]),i=document.createElement('i');i.style.cssText='left:'+t[4]+'px;top:'+(t[5]-hh)+'px;width:'+it.width*vp.scale+'px;height:'+hh*1.15+'px';if(k==hi)i.className='cur';L.append(i)})}
async function go(n){if(!doc)return;pn=Math.max(1,Math.min(doc.numPages,n|0||1));await draw()}
async function find(){if(!doc)return;const q=g('pvq').value.trim().toLowerCase();hits=[];hi=-1;if(!q){g('pvr').textContent='';return draw()}
g('pvr').textContent='Поиск…';for(let n=1;n<=doc.numPages;n++){const items=await text(n);items.forEach((it,idx)=>{if(it.str&&it.str.toLowerCase().includes(q))hits.push({page:n,idx})});if(n%10==0)await new Promise(r=>setTimeout(r))}
if(!hits.length){g('pvr').textContent='Ничего не найдено';return draw()}step(1)}
async function step(d){if(!hits.length)return;hi=(hi+d+hits.length)%hits.length;g('pvr').textContent=(hi+1)+' из '+hits.length+' (подсветка по строкам)';pn=hits[hi].page;await draw()}
btn.onclick=()=>{m.hidden=false;g('pvo').focus()};
g('pvc').onclick=()=>{m.hidden=true;closeDoc();g('pvp').hidden=true;g('pve').hidden=false;g('pve').textContent='Откройте PDF-файл с компьютера. Всё работает без интернета.';g('pvt').textContent='/ –';g('pvr').textContent=''};
g('pvo').onclick=()=>g('pvf').click();g('pvf').onchange=e=>{load(e.target.files[0]);e.target.value=''};
g('pvprev').onclick=()=>go(pn-1);g('pvnext').onclick=()=>go(pn+1);g('pvn').onchange=e=>go(+e.target.value);
const zoom=async f=>{if(!doc)return;scale=Math.max(.3,Math.min(4,Math.round(scale*f*100)/100));await draw()};
g('pvzi').onclick=()=>zoom(1.2);g('pvzo').onclick=()=>zoom(1/1.2);g('pvfit').onclick=async()=>{await fit(true);await draw()};
g('pvgo').onclick=find;g('pvq').onkeydown=e=>{if(e.key=='Enter'){e.preventDefault();hits.length&&g('pvq').value.trim().toLowerCase()?step(e.shiftKey?-1:1):find()}};
addEventListener('keydown',e=>{if(m.hidden)return;if(e.key=='Escape')g('pvc').click();else if(document.activeElement.tagName!='INPUT'){if(e.key=='ArrowRight'||e.key=='PageDown')go(pn+1);else if(e.key=='ArrowLeft'||e.key=='PageUp')go(pn-1)}});
window.pdfViewer={load,go,find,get doc(){return doc}};
})();
