// init
(async()=>{try{N=await tx('notes','readonly',s=>s.getAll())||[];const p=await tx('meta','readonly',s=>s.get('prefs'));if(p)pf={...pf,...p,cat:{...pf.cat,...p.cat},cv:{...pf.cv,...p.cv}}}catch(e){N=[];toast('Локальная база недоступна: заметки не сохранятся')}
if(!N.length)try{const o=JSON.parse(localStorage.getItem('nv1')||'[]');if(o.length){N=o;toast('Заметки перенесены в локальную базу')}}catch(e){}
if((pf.v||0)<3){pf.vol=Math.max(pf.vol,85);pf.v=3;savePf()}ap();navigator.storage&&navigator.storage.persist&&navigator.storage.persist();
let th;try{th=localStorage.getItem('nvt')}catch(e){}
document.documentElement.dataset.theme=th||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
if(!N.length){const n=mk();n.t='Добро пожаловать в Noteverse';n.h='<h1>Твой первый конспект</h1><p>Пиши здесь. Панель сверху — форматирование. <b>Шаблоны</b> вставляют готовую структуру, <b>Дизайн</b> меняет стиль и цвета, <b>Рисовать</b> включает ручку, маркер и ластик поверх страницы.</p><h2>Что попробовать</h2>'+ck('Выбрать дизайн')+ck('Вставить шаблон Cornell')+ck('Нарисовать стрелку')+ck('Скачать PDF')+'<blockquote>Всё сохраняется автоматически в браузере.</blockquote>'}
open(N.sort((a,b)=>b.u-a.u)[0]);persist(true)})();
