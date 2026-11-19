// ===== Диалог вместо confirm() (confirm блокируется во встроенных окнах) =====
function ask(msg){return new Promise(ok=>{const o=document.createElement('div');o.id='dlg';o.innerHTML='<div class="box" role="dialog" aria-modal="true"><p></p><div><button class="no">Отмена</button><button class="pri yes">Да</button></div></div>';o.querySelector('p').textContent=msg;const f=v=>{o.remove();removeEventListener('keydown',kd,true);ok(v)},kd=e=>{if(e.key=='Escape'){e.preventDefault();f(false)}};addEventListener('keydown',kd,true);o.querySelector('.yes').onclick=()=>f(true);o.querySelector('.no').onclick=()=>f(false);o.onclick=e=>{if(e.target==o)f(false)};document.body.append(o);o.querySelector('.yes').focus()})}
function cleanHtml(){const c=ed.cloneNode(true);c.querySelectorAll('.fx').forEach(s=>{s.removeAttribute('style');s.className='fx'});return c.innerHTML}
document.querySelectorAll('.tabs button').forEach(b=>b.onclick=()=>{flt=b.dataset.f;document.querySelectorAll('.tabs button').forEach(x=>x.classList.toggle('on',x==b));list()});

// ===== ЭФФЕКТЫ ТЕКСТА v2 =====
// Холст лежит ВНУТРИ страницы ПОД текстом: буквы всегда читаемы, частицы не выходят за страницу
// и за границы своего слова (box). Координаты частиц локальные (не зависят от прокрутки).
const fxc=$('#fxc'),RM=matchMedia('(prefers-reduced-motion: reduce)');
const PL={ed:{cv:fxc,g:fxc.getContext('2d'),P:[]},pv:{cv:null,g:null,P:[]}},fxP=PL.ed.P;
const FXN={inferno:'INFERNO',frost:'FROST',volt:'VOLT',neon:'NEON',stardust:'STARDUST',smoke:'SMOKE',metal:'LIQUID METAL',holo:'HOLOGRAM',bloom:'BLOOM',dust:'DUST',aqua:'AQUA',cosmos:'COSMOS'};
const FXI={inferno:'🔥',frost:'❄',volt:'⚡',neon:'💡',stardust:'✨',smoke:'☁',metal:'◈',holo:'◇',bloom:'✿',dust:'⁘',aqua:'💧',cosmos:'🌌'};
const MODES=[['continuous','Continuous'],['oneshot','One Shot'],['reignite','Reignite'],['loop','Infinite Loop'],['static','Static Ember'],['manual','Manual']];
const SL=[['int','Интенсивность',.2,2,.1],['spd','Скорость',.3,3,.1],['den','Плотность частиц',0,100,5],['dur','Длительность, с',2,30,1],['glow','Свечение',0,2,.1],['delay','Пауза перед повтором, с',0,5,.5]];
const QL={low:[150,.5,1],med:[420,1,1],high:[900,1.6,2]};
let fxT=[],fxRaf=0,fxLast=0,fxSel=null,fxQd=0,fxAcc=.016,fxHold=0,fxLt=0,fxFr=0,fxCtl={type:'inferno',mode:'continuous',cfg:{int:1,spd:1,den:60,dur:10,glow:1,delay:1,snd:0}};
function fxLum(){const m=getComputedStyle(page).backgroundColor.match(/[\d.]+/g)||[255,255,255];fxLt=(.299*m[0]+.587*m[1]+.114*m[2])>150?1:0}
const DK=new Set(['neon','volt','stardust','holo','frost']),fxC=T=>'fx t-'+T.type+((fxLt&&!T.pv&&DK.has(T.type))?' dk':'');
const rnd=(a,b)=>a+Math.random()*(b-a),fxq=()=>(!pf.fq||pf.fq=='auto')?(fxQd||(navigator.hardwareConcurrency||8)<=4?'low':'med'):pf.fq;
// --- цвет пламени по температуре (белый → жёлтый → оранжевый → красный → тёмный) ---
const mixc=(a,b,t)=>a.map((x,i)=>Math.round(x+(b[i]-x)*t)).join(',');
const HR=Array.from({length:24},(_,i)=>{const k=i/23,S=[[70,22,10],[200,40,10],[255,120,20],[255,200,60],[255,248,205]],z=k*4,j=Math.min(3,Math.floor(z));return mixc(S[j],S[j+1],z-j)});
// --- строки эмиттеров ---
const E=o=>({r:0,c:['255,255,255'],l:[1,1],vx:[0,0],vy:[0,0],s:[2,3],g:0,tb:0,dr:0,bl:'L',sh:'c',pos:'any',al:1,shr:0,rp:0,gr:0,rg:0,heat:0,...o});
const FL=o=>E({heat:1,sh:'f',pos:'top',al:.85,shr:1,g:-90,tb:55,dr:1.3,l:[.5,1.05],vx:[-10,10],vy:[-70,-150],s:[9,19],...o});
const SP=o=>E({c:['255,230,150','255,160,50'],l:[.5,1.3],vx:[-45,45],vy:[-190,-60],s:[1.5,3],g:180,dr:.5,pos:'top',...o});
const SM=o=>E({c:['90,80,75'],l:[1.3,2.4],vx:[-6,10],vy:[-30,-60],s:[12,24],g:-20,tb:14,dr:.6,bl:'N',pos:'top',al:.18,gr:1,...o});
const SNOW=E({r:30,c:['255,255,255','200,235,255'],l:[1.5,3],vx:[-10,10],vy:[14,40],s:[1.5,3.5],tb:12,bl:'N',pos:'top',al:.9}),CRY=E({r:16,c:['225,247,255'],l:[1.4,2.8],vx:[-2,2],vy:[-3,3],s:[5,12],sh:'s'}),DRIP=E({r:28,c:['150,215,255'],l:[.8,1.4],vx:[-3,3],vy:[20,60],s:[2,4],g:320,bl:'N',pos:'bot',al:.9}),SPK=E({c:['180,220,255'],l:[.15,.4],s:[1.5,3]});
const R={
'inferno.ign':[SP({r:80,rp:1,rg:1,pos:'bot'}),FL({r:80,rp:1,rg:1,l:[.4,.8],vy:[-50,-110]})],
'inferno.burn':[FL({r:210}),E({r:60,heat:1,l:[.25,.5],s:[4,8],vy:[-60,-120],g:-80,tb:30,dr:1.3,pos:'bot',al:.9,shr:1}),SP({r:22}),SM({r:14})],
'inferno.char':[E({r:34,heat:1,l:[1,2.2],vx:[-8,8],vy:[-14,-34],s:[2,4],g:-10,tb:16,dr:.8,rg:1}),SM({r:10,c:['70,64,60'],al:.22})],
'inferno.ash':[E({r:140,c:['105,98,92','150,145,138','70,66,62'],l:[1.4,2.6],vx:[-20,50],vy:[-45,-5],s:[2,5],g:55,tb:40,dr:1.6,bl:'N',sh:'sq',al:.9,rg:2}),E({r:24,heat:1,l:[.8,1.6],vx:[0,30],vy:[-40,-8],s:[2,3],g:20,tb:20,dr:1,rg:2}),FL({r:40,rg:2,s:[5,9],l:[.3,.6]})],
'inferno.re':[FL({r:90,rp:1,rg:1}),SP({r:50,rg:1})],
'frost.in':[{...SNOW,rp:1},{...CRY,rp:1}],'frost.hold':[SNOW,CRY],'frost.out':[DRIP,{...SNOW,rp:-1}],
volt:[E({r:26,c:['170,215,255','255,255,255'],l:[.15,.4],vx:[-90,90],vy:[-90,90],s:[1.5,3]})],
neon:[E({r:10,c:['255,70,220','160,80,255'],l:[1,2],vx:[-6,6],vy:[-10,-22],s:[2,3.5],tb:8,al:.8})],
stardust:[E({r:70,c:['255,240,180','255,255,255','210,185,255'],l:[.8,1.8],vx:[-14,14],vy:[-22,10],s:[1.5,3.5],sh:'x'})],
smoke:[SM({r:50,c:['215,215,222','150,150,160'],vy:[-26,-55],s:[14,30],al:.2})],
metal:[E({r:6,c:['255,255,255'],l:[.3,.7],vx:[-4,4],vy:[-4,4],s:[6,12],sh:'x'})],
holo:[E({r:26,c:['120,255,240','200,140,255','255,160,230'],l:[.6,1.4],vx:[-20,20],vy:[-10,-40],s:[2,5],sh:'sq',al:.9})],
bloom:[E({r:22,c:['255,183,213','255,143,184','255,214,228'],l:[2.5,4.5],vx:[-20,24],vy:[10,32],s:[5,9],g:6,tb:25,bl:'N',sh:'p',pos:'top',al:.95})],
dust:[E({r:160,c:['205,195,170','150,140,125'],l:[.8,1.8],vx:[20,90],vy:[-40,10],s:[1.5,3.5],tb:20,bl:'N',sh:'sq',al:.9})],
aqua:[E({r:16,c:['190,235,255'],l:[1.2,2.4],vx:[-6,6],vy:[-30,-60],s:[3,7],tb:14,bl:'N',sh:'b',pos:'bot'})],
cosmos:[E({r:55,c:['200,180,255','150,200,255','255,255,255'],l:[.8,2],vx:[-8,8],vy:[-10,10],s:[1.5,3.5],sh:'x'})]};
const GL={neon:['255,58,216',.3],aqua:['40,150,255',.2],cosmos:['150,110,255',.28],holo:['120,230,255',.22],stardust:['255,215,120',.22],bloom:['255,130,175',.2],frost:['120,205,255',.22],smoke:['200,200,210',.1]};
const SPR={};function spr(c){return SPR[c]||(SPR[c]=(()=>{const k=document.createElement('canvas');k.width=k.height=32;const g=k.getContext('2d'),r=g.createRadialGradient(16,16,0,16,16,16);r.addColorStop(0,'rgba('+c+',1)');r.addColorStop(.4,'rgba('+c+',.55)');r.addColorStop(1,'rgba('+c+',0)');g.fillStyle=r;g.fillRect(0,0,32,32);return k})())}
function spawn(pl,x,y,vx,vy,l,s,r,col,lt,b){let p;const P=pl.P;for(let i=0;i<P.length;i++)if(!P[i].a){p=P[i];break}if(!p){if(P.length>=QL[fxq()][0])return;p={};P.push(p)}p.a=1;p.x=x;p.y=y;p.vx=vx;p.vy=vy;p.l=p.L=l;p.s=s;p.row=r;p.col=col;p.lt=lt;p.b=b;p.rot=Math.random()*6.28;p.vr=rnd(-3,3);p.id=Math.random()*100;p.tt=rnd(.72,1)}
// --- физика: плавучесть/гравитация, сопротивление воздуха, турбулентность ---
function fxUpd(pl,dt,t){for(const p of pl.P){if(!p.a)continue;p.l-=dt;if(p.l<=0){p.a=0;continue}const r=p.row;
if(r.tb){p.vx+=(Math.sin(p.y*.021+t*2.3+p.id)+Math.sin(p.x*.017-t*1.7+p.id*2))*r.tb*dt;p.vy+=Math.cos(p.x*.019+t*1.9+p.id)*r.tb*dt*.5}
p.vy+=r.g*dt;if(r.dr){const k=Math.exp(-r.dr*dt);p.vx*=k;p.vy*=k}p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=p.vr*dt;
const b=p.b;if(b&&(p.x<b.x0||p.x>b.x1||p.y<b.y0||p.y>b.y1))p.a=0}}
const fpath=(g,pts)=>{g.beginPath();pts.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]));g.stroke()};
function fxDrw(pl,t){const cv=pl.cv,g=pl.g;g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,cv.width,cv.height);const el=pl===PL.pv?$('#fpv'):page,k=cv.width/(el.clientWidth||1);g.setTransform(k,0,0,k,0,0);
for(const T of fxT){if(T.pl!==pl||!(T.gi>.01)||!T.rel)continue;const n=T.rel.length,st=Math.max(1,Math.floor(n/30));g.globalCompositeOperation=T.lt?'source-over':'lighter';g.globalAlpha=T.gi*(T.lt?.45:1);const sp=spr(T.gc);for(let i=0;i<n;i+=st){const c=T.rel[i];if(c.u<=T.gf)g.drawImage(sp,c.x+c.w/2-36,c.y+c.h/2-36,72,72)}}
for(let ps=0;ps<2;ps++){g.globalCompositeOperation=ps?'lighter':'source-over';for(const p of pl.P){if(!p.a)continue;const r=p.row;if((r.bl=='L'&&!p.lt)!=!!ps)continue;const f=p.l/p.L;let a=r.al*Math.min(1,f*2.2);if(r.sh=='s')a*=Math.min(1,(1-f)*5);const sz=p.s*(r.shr?.35+.65*f:1)*(r.gr?1+(1-f)*1.3:1),col=r.heat?HR[Math.max(0,Math.min(23,(f*p.tt*23)|0))]:p.col;g.globalAlpha=a;
switch(r.sh){case'f':{const w=p.lt?1.7:1.2,hh=sz*2.8*(.55+.45*f);g.drawImage(spr(col),p.x-sz*w/2+Math.sin(p.id+p.l*9)*sz*.2,p.y-hh*.75,sz*w,hh);break}
case'c':g.drawImage(spr(col),p.x-sz,p.y-sz,sz*2,sz*2);break;
case'x':g.globalAlpha=a*(.55+.45*Math.sin(t*9+p.id));g.drawImage(spr(col),p.x-sz*1.5,p.y-sz*1.5,sz*3,sz*3);break;
case'sq':g.fillStyle='rgb('+col+')';g.save();g.translate(p.x,p.y);g.rotate(p.rot);g.fillRect(-sz/2,-sz/2,sz,sz*.6);g.restore();break;
case'p':g.fillStyle='rgb('+col+')';g.save();g.translate(p.x,p.y);g.rotate(p.rot);g.beginPath();g.ellipse(0,0,sz,sz*.55,0,0,6.3);g.fill();g.restore();break;
case'b':g.strokeStyle='rgb('+col+')';g.lineWidth=1;g.beginPath();g.arc(p.x,p.y,sz,0,6.3);g.stroke();g.fillStyle='rgba(255,255,255,.7)';g.fillRect(p.x-sz*.4,p.y-sz*.4,1.5,1.5);break;
case's':g.strokeStyle='rgb('+col+')';g.lineWidth=1;g.beginPath();for(let i=0;i<3;i++){const an=i*1.047+p.rot*.1,ca=Math.cos(an),sa=Math.sin(an);g.moveTo(p.x-ca*sz,p.y-sa*sz);g.lineTo(p.x+ca*sz,p.y+sa*sz);for(const s2 of[-.5,.5]){const mx=p.x+ca*sz*s2,my=p.y+sa*sz*s2;for(const d of[-.9,.9]){g.moveTo(mx,my);g.lineTo(mx+Math.cos(an+d)*sz*.35,my+Math.sin(an+d)*sz*.35)}}}g.stroke()}}}
g.globalCompositeOperation=fxLt&&pl===PL.ed?'source-over':'lighter';g.lineJoin='round';for(const T of fxT){if(T.pl!==pl)continue;const lt=T.lt;for(const a of T.arcs){g.globalAlpha=Math.min(1,a.l*9)*(.7+.3*Math.random());for(const pth of[a.p,...a.br]){g.strokeStyle=lt?'rgb(40,110,240)':'rgb(90,170,255)';g.lineWidth=pth===a.p?4:2;g.shadowColor='#4aa8ff';g.shadowBlur=14;fpath(g,pth);g.strokeStyle=lt?'#cfe6ff':'#fff';g.lineWidth=pth===a.p?1.3:.8;g.shadowBlur=0;fpath(g,pth)}}}g.globalAlpha=1;g.shadowBlur=0}
function jag(a,b,n=3){let P=[a,b];for(let i=0;i<n;i++){const Q=[P[0]];for(let j=0;j<P.length-1;j++){const dx=P[j+1][0]-P[j][0],dy=P[j+1][1]-P[j][1],L=Math.hypot(dx,dy)||1,o=rnd(-.28,.28)*L;Q.push([(P[j][0]+P[j+1][0])/2-dy/L*o,(P[j][1]+P[j+1][1])/2+dx/L*o],P[j+1])}P=Q}return P}
const fxClr=()=>[PL.ed,PL.pv].forEach(pl=>{if(pl.cv)pl.g.clearRect(0,0,pl.cv.width,pl.cv.height)});
// --- состояния (таймлайн) ---
const SEQ=T=>T.type=='inferno'?['ign','burn','char','ash']:['in','hold','out'],FR=T=>T.type=='inferno'?[.15,.4,.2,.15]:T.type=='frost'?[.4,.3,.3]:[.1,.8,.1];
function fxInit(T,go){const sq=SEQ(T),st=T.type=='inferno'&&T.mode=='static';T.st={go:go||T.mode!='manual',k:st?'char':sq[0],t:st?1e9:0,nx:''};T.fl=0;T.na=.3;T.arcs=T.arcs||[];T.ac=new Map();T.dirty=1;T.ls=null;T.css=null;T.gi=0}
function fxStep(T,dt){const c=T.cfg,s=T.st,m=T.mode,inf=T.type=='inferno',sq=SEQ(T);
if(!s.go)return{st:'idle',p:0,e:0};if(s.k=='done')return{st:'done',p:1,e:0};
s.t+=dt*c.spd;const d=Math.max(.001,s.k=='wait'?c.delay:s.k=='re'?.12*c.dur:FR(T)[sq.indexOf(s.k)]*c.dur);
const hold=inf?((s.k=='burn'&&m=='continuous')||(s.k=='char'&&m=='static')):(s.k=='hold'&&m=='continuous');
if(s.t>=d){if(hold)s.t=d;else{s.t=0;const i=sq.indexOf(s.k);if(s.k=='wait')s.k=s.nx;else if(s.k=='re')s.k='burn';else if(i<sq.length-1)s.k=sq[i+1];else if(m=='loop'||m=='reignite'){s.k='wait';s.nx=(m=='loop'||!inf)?sq[0]:'re'}else if(m=='manual'){s.go=0;s.k=sq[0]}else s.k='done'}}
const p=Math.min(1,s.t/d);return{st:s.k,p,e:s.k=='in'?p:s.k=='hold'?1:s.k=='out'?1-p:0}}
// --- внешний вид текста: огонь идёт ВОЛНОЙ по буквам слева направо ---
function fxStyle(T,S,t){const c=T.cfg,g=c.glow,k=S.st;if(k=='idle'||k=='done')return'';
if(T.type=='inferno'){const f=Math.sin(t*17)*.5+Math.sin(t*9.3)*.5,p=S.p,q=p*100,M=Math.max;let bg,gl=0,op=1,ec='255,90,10',ol='drop-shadow(0 0 1.1px rgba(60,12,0,.85)) ';
if(k=='ign'){bg='linear-gradient(90deg,rgb(255,'+(120+40*f|0)+',20) 0%,#ffa31a '+M(0,q-14)+'%,#fff3b0 '+M(0,q-3)+'%,var(--tx) '+(q+7)+'%)';gl=3+8*p}
else if(k=='burn'){const a=40+22*Math.sin(t*3.1),b=72+18*Math.sin(t*2.3+1);bg='linear-gradient(90deg,#ff5a10 0%,#ffb52e '+a+'%,#ff7a18 '+b+'%,#ffd34a 100%)';gl=9+4*f}
else if(k=='char'){bg='radial-gradient(circle at 30% 40%,rgba(255,130,45,'+(.6+.3*Math.sin(t*4))+') 0 1.2px,transparent 2.3px) 0 0/7px 9px,linear-gradient(90deg,#241812 0%,#2e1a12 '+M(0,q-18)+'%,#ff5a10 '+M(0,q-4)+'%,#ffb52e '+q+'%,#ff7a18 '+(q+10)+'%,#ff6a00 100%)';gl=2+3*(.5+.5*Math.sin(t*3.1));ec='255,70,15';ol='drop-shadow(0 0 1px rgba(255,120,50,.75)) '}
else if(k=='ash'){bg='linear-gradient(90deg,transparent 0%,transparent '+M(0,q-16)+'%,rgba(255,110,30,.95) '+M(0,q-7)+'%,#2b1f19 '+q+'%,#2b1f19 100%)';gl=2*(1-p);ec='255,80,20';ol='drop-shadow(0 0 1px rgba(255,120,50,.6)) '}
else if(k=='re'){bg='linear-gradient(90deg,#ff7a18 0%,#ffe08a '+M(0,q-3)+'%,transparent '+(q+6)+'%)';gl=3+8*p}
else{bg='#1c1512';op=.06}
return'background:'+bg+';-webkit-background-clip:text;background-clip:text;color:transparent;opacity:'+op.toFixed(2)+';filter:'+ol+'drop-shadow(0 0 '+(gl*g).toFixed(1)+'px rgba('+ec+',.9))'}
if(T.type=='frost'){const p=k=='in'?S.p:k=='out'?1-S.p:k=='wait'?0:1,q=Math.pow(p,.6);return'color:color-mix(in srgb,#f4fcff '+(q*100).toFixed(0)+'%,var(--tx));text-shadow:0 0 '+(6*g*p).toFixed(1)+'px rgba(120,205,255,'+(.75*p).toFixed(2)+'),0 1px 0 rgba(255,255,255,'+(.9*p).toFixed(2)+');-webkit-text-stroke:'+(.35*p).toFixed(2)+'px rgba(235,248,255,'+(.9*p).toFixed(2)+')'}
if(T.type=='volt')return'color:#eaf6ff;text-shadow:0 0 '+(3+T.fl*12).toFixed(1)+'px #7fc8ff,0 0 '+((8+T.fl*26)*g).toFixed(1)+'px #3d7bff;filter:brightness('+(1+T.fl*.7).toFixed(2)+')';
return'--e:'+S.e.toFixed(2)+';--g:'+(g*c.int).toFixed(2)+';--sp:'+c.spd+(T.type=='dust'?';opacity:'+Math.max(.05,S.e).toFixed(2):'')}
function fxGlow(T,S,t){const k=S.st;T.gf=1;let gi=0,gc='255,100,20';if(T.type=='inferno'){gi=k=='ign'?.55:k=='burn'?.6+.1*Math.sin(t*13):k=='char'?.3:k=='ash'?.15*(1-S.p):k=='re'?.5:0;if(k=='ign'||k=='re')T.gf=S.p}else if(T.type=='volt'){gc='90,170,255';gi=T.fl*.5}else if(GL[T.type]){gc=GL[T.type][0];gi=GL[T.type][1]*S.e}T.gi=(k=='idle'||k=='done'||k=='wait')?0:gi;T.gc=gc}
function charRects(T,ms){const b=T.b,o=[],tn=[];let tot=0;T.sp.forEach(sp=>{const w=document.createTreeWalker(sp,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode()){tn.push(n);tot+=n.data.length}});const step=Math.max(1,Math.ceil(tot/150)),r=document.createRange();let i=0,gi=0,x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
for(const n of tn)for(let j=0;j<n.data.length;j++,gi++){if(/\s/.test(n.data[j])||(i++%step))continue;r.setStart(n,j);r.setEnd(n,j+1);const q=r.getBoundingClientRect();if(q.width){const c={x:q.left-b.left,y:q.top-b.top,w:q.width,h:q.height,u:gi/tot};o.push(c);x0=Math.min(x0,c.x);y0=Math.min(y0,c.y);x1=Math.max(x1,c.x+c.w);y1=Math.max(y1,c.y+c.h)}}
T.rel=o;T.rt=ms;T.box={x0:x0-70,y0:y0-190,x1:x1+70,y1:y1+130}}
function fxEmit(T,S,dt){const c=T.cfg,q=QL[fxq()][1],pl=T.pl,lt=T.lt;
if(T.type=='volt'&&T.rel&&T.rel.length){T.fl*=Math.pow(.002,dt);T.na-=dt*c.spd;if(T.na<=0&&S.st!='wait'){T.na=rnd(.1,.5)/Math.max(.3,c.int);const A=T.rel[(Math.random()*T.rel.length)|0];let B=A;for(let i=0;i<6;i++){const C=T.rel[(Math.random()*T.rel.length)|0];if(C!==A&&Math.hypot(C.x-A.x,C.y-A.y)<170){B=C;break}}const a=[A.x+A.w/2,A.y+A.h*.5],b=[B.x+B.w/2+(B===A?rnd(-60,60):0),B.y+B.h*.5+(B===A?rnd(-30,30):0)],main=jag(a,b),br=[];for(let i=0;i<2;i++){const m=main[(Math.random()*main.length)|0],an=rnd(0,6.28),L=rnd(30,80);br.push(jag(m,[m[0]+Math.cos(an)*L,m[1]+Math.sin(an)*L],2))}T.arcs.push({p:main,br,l:.16});T.fl=1;for(let i=0;i<5;i++)spawn(pl,a[0],a[1],rnd(-110,110),rnd(-110,110),rnd(.15,.4),rnd(1.5,3),SPK,'180,220,255',lt,T.box);if(c.snd)snd('fx',0,'zap')}}
const rows=R[T.type+'.'+S.st]||(S.st=='wait'?null:R[T.type]);if(!rows||!T.rel||!T.rel.length)return;const n=T.rel.length;
for(const r of rows){let k=r.rp==1?S.p:r.rp==-1?1-S.p:1;if(T.type!='inferno'&&T.type!='frost')k*=T.type=='dust'?(S.st=='hold'?.12:1):S.e;
const nn=(T.ac.get(r)||0)+r.r*k*dt*(c.den/60)*c.int*q*c.spd;let m=Math.floor(nn);T.ac.set(r,nn-m);if(!m)continue;
let lo=0,hi=n;if(r.rg==1)hi=Math.ceil(S.p*n);else if(r.rg==2){lo=Math.floor(Math.max(0,S.p-.28)*n);hi=Math.ceil(Math.min(1,S.p+.04)*n)}else if(r.rg==3)lo=Math.floor((1-S.p)*n);if(hi<=lo){lo=Math.min(lo,n-1);hi=lo+1}
while(m-->0){const a=T.rel[lo+((Math.random()*(hi-lo))|0)],pos=r.pos;spawn(pl,a.x+Math.random()*a.w,a.y+(pos=='top'?Math.random()*a.h*.35:pos=='bot'?a.h*(.65+Math.random()*.35):Math.random()*a.h),rnd(r.vx[0],r.vx[1])*c.spd,rnd(r.vy[0],r.vy[1])*c.spd,rnd(r.l[0],r.l[1])/c.spd,rnd(r.s[0],r.s[1])*Math.sqrt(c.int),r,r.c[(Math.random()*r.c.length)|0],lt,T.box)}}
if(c.snd&&pf.snd&&pf.cat.fx){if(T.type=='inferno'&&(S.st=='burn'||S.st=='char')&&Math.random()<dt*10)snd('fx',0,'crack');if(T.type=='frost'&&S.st=='in'&&Math.random()<dt*3)snd('fx',0,'tink')}}
function fxSz(pl,el,k){if(!pl.cv)return;const w=Math.round(el.clientWidth*k),h=Math.round(el.clientHeight*k);if(pl.cv.width!=w||pl.cv.height!=h){pl.cv.width=w;pl.cv.height=h}}
function fxLoop(ms){fxRaf=0;if(pf.fo){fxPlain();return}if(RM.matches){fxStatic();return}if(document.hidden||fxHold)return;const t=ms/1000,dt=Math.min(t-fxLast,.05);fxLast=t;if(dt<=0){fxRaf=requestAnimationFrame(fxLoop);return}
fxAcc=fxAcc*.97+dt*.03;if(fxAcc>.036&&!fxQd)fxQd=1;
const k=QL[fxq()][2]>1?Math.min(devicePixelRatio||1,2):1;fxSz(PL.ed,page,k);fxSz(PL.pv,$('#fpv')||page,k);
const sc=$('#sc').getBoundingClientRect();if(!(fxFr++%30)){const o=fxLt;fxLum();if(o!=fxLt)fxT.forEach(T=>T.ls=null)}
fxT.forEach(T=>{T.sp=T.sp.filter(s=>s.isConnected);if(!T.sp.length){T.dead=1;return}T.pl=T.pv?PL.pv:PL.ed;T.lt=T.pv?0:fxLt;const r=T.sp[0].getBoundingClientRect();T.b=T.bs.getBoundingClientRect();T.vis=!!T.pv||(r.bottom>sc.top-50&&r.top<sc.bottom+50);if(T.arcs.length){T.arcs.forEach(a=>a.l-=dt);T.arcs=T.arcs.filter(a=>a.l>0)}if(T.vis&&(T.dirty||!T.rel||ms-T.rt>1200)){charRects(T,ms);T.dirty=0}});
fxT=fxT.filter(T=>!T.dead);let busy=false;
fxT.forEach(T=>{if(!T.vis)return;const S=fxStep(T,dt),idle=S.st=='idle'||S.st=='done';if(!idle)busy=true;
if(S.st!=T.ls){T.ls=S.st;T.sp.forEach(s=>{s.className=idle?(S.st=='idle'?'fx idle':'fx'):fxC(T)})}
const css=fxStyle(T,S,t);if(css!==T.css){T.css=css;T.sp.forEach(s=>s.style.cssText=css)}
fxGlow(T,S,t);if(!idle)fxEmit(T,S,dt)});
fxUpd(PL.ed,dt,t);fxUpd(PL.pv,dt,t);fxDrw(PL.ed,t);if(PL.pv.cv)fxDrw(PL.pv,t);
if(busy||PL.ed.P.some(p=>p.a)||PL.pv.P.some(p=>p.a)||fxT.some(T=>T.arcs.length))fxRaf=requestAnimationFrame(fxLoop);else fxClr()}
function fxPlain(){PL.ed.P.forEach(p=>p.a=0);PL.pv.P.forEach(p=>p.a=0);fxT.forEach(T=>T.sp.forEach(s=>{s.className='fx';s.style.cssText=''}));fxClr()}
function fxStatic(){fxT.forEach(T=>{const css=fxStyle(T,{st:T.type=='inferno'?'burn':'hold',p:.5,e:1},0);T.sp.forEach(s=>{s.className=fxC(T);s.style.cssText=css})})}
function fxKick(){if(document.hidden||fxHold)return;if(pf.fo){fxPlain();return}if(RM.matches){fxStatic();return}if(fxRaf)return;if(fxT.length){fxLast=performance.now()/1000;fxRaf=requestAnimationFrame(fxLoop)}}
function fxPause(){fxHold=1;fxc.style.visibility='hidden';const a=[...ed.querySelectorAll('.fx')].map(s=>[s,s.className,s.style.cssText]);a.forEach(([s])=>{s.className='fx';s.style.cssText=''});return()=>{fxHold=0;fxc.style.visibility='';a.forEach(([s,c,t])=>{s.className=c;s.style.cssText=t});fxKick()}}
// --- привязка эффектов к тексту (устойчивые якоря: span[data-fx] + реестр cur.fx + образец текста) ---
const unwrap=s=>s.replaceWith(...s.childNodes);
const fxIds=r=>{const s=new Set();ed.querySelectorAll('.fx[data-fx]').forEach(x=>{if(r.intersectsNode(x))s.add(x.dataset.fx)});return[...s]};
function fxWrap(r,id,type){const nodes=[];if(r.commonAncestorContainer.nodeType==3)nodes.push(r.commonAncestorContainer);else{const w=document.createTreeWalker(r.commonAncestorContainer,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode())if(r.intersectsNode(n)&&n.data.trim())nodes.push(n)}
const out=[];for(const n of nodes){const s=n===r.startContainer?r.startOffset:0,e=n===r.endContainer?r.endOffset:n.data.length;if(e<=s)continue;let m=n;if(s>0)m=n.splitText(s);if(e-s<m.data.length)m.splitText(e-s);if(!m.data.trim())continue;const sp=document.createElement('span');sp.className='fx t-'+type;sp.dataset.fx=id;m.parentNode.insertBefore(sp,m);sp.appendChild(m);out.push(sp)}return out}
const off=(n,o)=>{const q=document.createRange();q.setStart(ed,0);q.setEnd(n,o);return q.toString().length};
function rangeAt(s,e){const w=document.createTreeWalker(ed,NodeFilter.SHOW_TEXT),r=document.createRange();let n,c=0,a=0;while(n=w.nextNode()){const l=n.data.length;if(!a&&s>=c&&s<=c+l){r.setStart(n,s-c);a=1}if(a&&e<=c+l){r.setEnd(n,e-c);return r}c+=l}return r}
function fxBlock(r){let n=r.startContainer;n=n.nodeType==3?n.parentNode:n;const b=n.closest('p,h1,h2,h3,li,blockquote,td,th,.ck,.cl');if(!b||!ed.contains(b))return null;const q=document.createRange();q.selectNodeContents(b);return q}
function fxRecover(id,e){if(!e.sample)return null;const w=document.createTreeWalker(ed,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode()){const i=n.data.indexOf(e.sample);if(i>=0&&!n.parentNode.closest('.fx')){const r=document.createRange();r.setStart(n,i);r.setEnd(n,i+e.sample.length);const s=fxWrap(r,id,e.type);if(s.length)return s}}return null}
function fxMake(id,e,sp){const T={id,type:e.type,mode:e.mode,cfg:e.cfg,sp,bs:page,arcs:[]};if(T.type!='inferno'){if(T.mode=='static')T.mode='continuous';if(T.mode=='reignite')T.mode='loop'}fxInit(T);return T}
function fxScan(){fxLum();fxT=fxT.filter(T=>T.pv);PL.ed.P.forEach(p=>p.a=0);fxClr();const reg=cur.fx=cur.fx||{},by={};ed.querySelectorAll('.fx[data-fx]').forEach(s=>{(by[s.dataset.fx]=by[s.dataset.fx]||[]).push(s)});
for(const id in by)if(!reg[id]){by[id].forEach(unwrap);delete by[id]}
ed.normalize();
for(const id in reg)if(!by[id]){const e=reg[id],s=fxRecover(id,e);if(s)by[id]=s;else{delete reg[id];toast('Эффект '+(FXN[e.type]||'')+' потерял свой текст и удалён')}}
for(const id in by){const e=reg[id];if(!FXN[e.type]||!e.cfg){by[id].forEach(unwrap);delete reg[id];continue}by[id].forEach(s=>s.className=fxC({type:e.type}));fxT.push(fxMake(id,e,by[id]))}
fxKick()}
function fxSync(){if(!cur||!cur.fx)return;const have=new Set([...ed.querySelectorAll('.fx[data-fx]')].map(s=>s.dataset.fx));for(const id in cur.fx)if(!have.has(id))delete cur.fx[id]}
function fxApply(){const r=fxSel;if(!r||!ed.contains(r.startContainer)){toast('Сначала выделите текст в заметке или поставьте курсор в абзац');return false}
const reg=cur.fx=cur.fx||{},ids=fxIds(r),rec={type:fxCtl.type,mode:fxCtl.mode,cfg:{...fxCtl.cfg}};
if(r.collapsed&&ids.length){reg[ids[0]]={...rec,sample:reg[ids[0]].sample}}
else{const q=r.collapsed?fxBlock(r):r;if(!q||q.collapsed){toast('Поставьте курсор внутрь абзаца или выделите текст');return false}
const s=off(q.startContainer,q.startOffset),e=off(q.endContainer,q.endOffset);fxIds(q).forEach(i=>{ed.querySelectorAll('.fx[data-fx="'+i+'"]').forEach(unwrap);delete reg[i]});ed.normalize();
const id='f'+Date.now().toString(36)+Math.floor(Math.random()*1e3),sp=fxWrap(rangeAt(s,e),id,fxCtl.type);if(!sp.length){toast('Нечего оформлять: выделите текст');return false}reg[id]={...rec,sample:sp[0].textContent.slice(0,60)}}
getSelection().removeAllRanges();fxScan();svl();toast('Эффект применён: '+FXN[fxCtl.type]);return true}
function fxRemove(){const r=fxSel;if(!r){toast('Поставьте курсор в слово с эффектом');return}const ids=fxIds(r);if(!ids.length){toast('В этом месте нет эффекта');return}ids.forEach(i=>{ed.querySelectorAll('.fx[data-fx="'+i+'"]').forEach(unwrap);delete cur.fx[i]});ed.normalize();fxScan();svl();toast('Эффект убран')}
// --- панель Effect Library ---
function fxPrev(){fxT=fxT.filter(T=>!T.pv);PL.pv.P.forEach(p=>p.a=0);if($('#fp').hidden){if(PL.pv.cv)PL.pv.g.clearRect(0,0,PL.pv.cv.width,PL.pv.cv.height);return}PL.pv.cv=$('#fpc');PL.pv.g=PL.pv.cv.getContext('2d');const T={pv:1,id:'pv',type:fxCtl.type,mode:fxCtl.mode,cfg:fxCtl.cfg,sp:[$('#fpt')],bs:$('#fpv'),arcs:[]};if(T.type!='inferno'){if(T.mode=='static')T.mode='continuous';if(T.mode=='reignite')T.mode='loop'}fxInit(T);T.sp[0].className='fx t-'+T.type;fxT.push(T);fxKick()}
function fxSyncUI(){document.querySelectorAll('#fpg button').forEach(b=>b.classList.toggle('on',b.dataset.t==fxCtl.type));const inf=fxCtl.type=='inferno';if(!inf&&(fxCtl.mode=='static'||fxCtl.mode=='reignite'))fxCtl.mode='continuous';$('#fpm').innerHTML=MODES.filter(m=>inf||(m[0]!='reignite'&&m[0]!='static')).map(m=>'<option value="'+m[0]+'">'+m[1]+'</option>').join('');$('#fpm').value=fxCtl.mode;document.querySelectorAll('#fp [data-s]').forEach(i=>{const k=i.dataset.s;if(i.type=='checkbox')i.checked=!!fxCtl.cfg[k];else{i.value=fxCtl.cfg[k];i.nextElementSibling.textContent=fxCtl.cfg[k]}});$('#fpq').value=pf.fq||'auto';$('#fpo').checked=!!pf.fo}
function buildFx(){const P=$('#fp');P.innerHTML='<div class="rw" style="justify-content:space-between"><b>✨ Effect Library</b><button id="fpx" aria-label="Закрыть">✕</button></div><div id="fpv"><canvas id="fpc"></canvas><span id="fpt" class="fx">NOTEVERSE</span></div><div class="rw"><button id="fpp">▶ Играть / заново</button></div><div class="g" id="fpg"></div><h4>Настройки эффекта</h4><div id="fps"></div><div class="rw">Режим <select id="fpm"></select></div><h4>Производительность</h4><div class="rw">Качество <select id="fpq"><option value="auto">Авто</option><option value="low">Низкое</option><option value="med">Среднее</option><option value="high">Высокое</option></select></div><label class="rw"><input type="checkbox" id="fpo"> Отключить все эффекты</label><div class="rw" style="margin-top:12px"><button class="pri" id="fpa">Применить к выделению</button><button id="fpr">Убрать эффект</button></div><div style="color:var(--c-mt);font-size:12px">Выделите слово или предложение, либо поставьте курсор в абзац. Текст остаётся обычным и редактируемым.</div>';
const g=$('#fpg');Object.keys(FXN).forEach(k=>{const b=document.createElement('button');b.dataset.t=k;b.innerHTML='<span>'+FXI[k]+'</span> '+FXN[k];b.onclick=()=>{fxCtl.type=k;fxSyncUI();fxPrev()};g.append(b)});
$('#fps').innerHTML=SL.map(s=>'<div class="rw"><span style="width:150px">'+s[1]+'</span><input type="range" data-s="'+s[0]+'" min="'+s[2]+'" max="'+s[3]+'" step="'+s[4]+'"><output></output></div>').join('')+'<label class="rw"><input type="checkbox" data-s="snd"> Звук эффекта (нужен включённый звук в ⚙)</label>';
P.oninput=P.onchange=e=>{const t=e.target,s=t.dataset.s;if(s){fxCtl.cfg[s]=t.type=='checkbox'?(t.checked?1:0):+t.value;const o=t.nextElementSibling;if(o&&o.tagName=='OUTPUT')o.textContent=t.value;return}if(t.id=='fpm'){fxCtl.mode=t.value;fxPrev()}else if(t.id=='fpq'){pf.fq=t.value;fxQd=0;savePf();fxKick()}else if(t.id=='fpo'){pf.fo=t.checked?1:0;savePf();fxScan()}};
P.onclick=e=>{const t=e.target;if(t.id=='fpx'){P.hidden=true;fxPrev()}else if(t.id=='fpa'){if(fxApply()){P.hidden=true;fxPrev()}}else if(t.id=='fpr')fxRemove();else if(t.id=='fpp'){fxPrev();const T=fxT.find(T=>T.pv);if(T)T.st.go=1;fxKick()}}}
$('#fxb').onmousedown=e=>e.preventDefault();
$('#fxb').onclick=e=>{e.stopPropagation();const P=$('#fp');if(!P.dataset.b){buildFx();P.dataset.b=1}P.hidden=!P.hidden;if(!P.hidden){$('#sp').hidden=true;$('#pn').hidden=true;const ids=fxSel?fxIds(fxSel):[];if(ids.length&&cur.fx[ids[0]]){const x=cur.fx[ids[0]];fxCtl={type:x.type,mode:x.mode,cfg:{...x.cfg}}}fxSyncUI()}fxPrev()};
document.addEventListener('selectionchange',()=>{const s=getSelection();if(s.rangeCount&&ed.contains(s.anchorNode))fxSel=s.getRangeAt(0).cloneRange()});
ed.addEventListener('click',e=>{const s=e.target.closest&&e.target.closest('.fx'),T=s&&fxT.find(T=>!T.pv&&T.sp.includes(s));if(T&&T.mode=='manual'&&!T.st.go){T.st.go=1;fxKick()}});
ed.addEventListener('input',()=>{fxT.forEach(T=>T.dirty=1);fxKick()});
addEventListener('resize',()=>fxT.forEach(T=>T.dirty=1));
document.addEventListener('visibilitychange',()=>fxKick());
$('#sc').addEventListener('scroll',()=>fxKick(),{passive:true});
RM.addEventListener&&RM.addEventListener('change',()=>fxScan());
