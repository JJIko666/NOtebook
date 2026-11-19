// ===== ГАЛЕРЕЯ ШАБЛОНОВ: готовая структура + подходящий дизайн =====
const cb=t=>'<div class="ck"><input type="checkbox"> '+(t||'')+'</div>',
cl=(t,b,k)=>'<div class="cl '+(k||'')+'"><b>'+t+'</b><br>'+(b||'&nbsp;')+'</div>',
tbl=(h,rows)=>'<table><tr>'+h.map(x=>'<th>'+x+'</th>').join('')+'</tr>'+rows.map(r=>'<tr>'+r.map(x=>'<td>'+(x||'<br>')+'</td>').join('')+'</tr>').join('')+'</table>',
dts=()=>new Date().toLocaleDateString('ru-RU'),
rep=(n,f)=>Array.from({length:n},(_,i)=>f(i));
// ps — индекс стиля (PS), p — индекс палитры (PAL)
const TPLS=[
{id:'cornell',n:'Cornell Notes',cat:'Учёба',ps:4,p:4,h:()=>'<h1>Тема</h1><p>Дата: '+dts()+' · Предмет: </p>'+tbl(['Вопросы и ключевые слова','Конспект'],[['<br><br><br>','<br><br><br><br><br>'],['<br><br>','<br><br><br>']])+cl('Резюме','Главная мысль страницы в 2–3 предложениях','')},
{id:'lecture',n:'Конспект лекции',cat:'Учёба',ps:1,p:0,h:()=>'<h1>Тема лекции</h1>'+tbl(['Предмет','Дата','Преподаватель'],[['',dts(),'']])+cl('Главная идея','','')+'<h2>Основные положения</h2><ol><li><br></li><li><br></li><li><br></li></ol><h2>Определения</h2>'+tbl(['Термин','Определение'],[['',''],['','']])+'<h2>Примеры</h2><p><br></p>'+cl('Вывод','','cl-g')+'<h2>Вопросы для повторения</h2>'+cb()+cb()},
{id:'outline',n:'Тезисный план',cat:'Учёба',ps:5,p:9,h:()=>'<h1>Центральная тема</h1>'+tbl(['Ветка 1','Ветка 2','Ветка 3'],[['<ul><li>Идея</li><li>Идея</li></ul>','<ul><li>Идея</li><li>Идея</li></ul>','<ul><li>Идея</li><li>Идея</li></ul>']])+cl('Как это связано','Свяжите ветки между собой и с главной темой','')},
{id:'glossary',n:'Словарь терминов',cat:'Учёба',ps:6,p:1,h:()=>'<h1>Словарь</h1>'+tbl(['Термин','Определение','Пример','Выучено'],rep(6,()=>['','','','☐']))},
{id:'problems',n:'Задачи и формулы',cat:'Учёба',ps:4,p:9,h:()=>'<h1>Задачи</h1>'+cl('Формулы','<code>E = mc²</code> &nbsp; <code>F = ma</code>','')+'<h2>Задача 1</h2>'+cl('Дано','','')+cl('Решение','','cl-w')+cl('Ответ','','cl-g')},
{id:'exam',n:'Подготовка к экзамену',cat:'Учёба',ps:3,p:8,h:()=>'<h1>Экзамен: ______</h1>'+cl('Дата экзамена: ____ · осталось дней: ____','Цель: ____ баллов','cl-w')+'<h2>Темы</h2>'+tbl(['Тема','Уверенность 1–5','Повторил'],rep(5,()=>['','','☐ ☐ ☐']))+'<h2>Вопросы для самопроверки</h2>'+cb()+cb()+cb()},
{id:'research',n:'Реферат / исследование',cat:'Учёба',ps:4,p:0,h:()=>'<h1>Название работы</h1>'+cl('Аннотация','Краткое содержание в 3–4 предложениях','')+'<h2>Введение</h2><p><br></p><h2>Цель и задачи</h2><p><br></p><h2>Методы</h2><p><br></p><h2>Результаты</h2><p><br></p><h2>Выводы</h2><p><br></p><h2>Источники</h2><ol><li><br></li></ol>'},
{id:'book',n:'Книга / статья',cat:'Чтение',ps:7,p:16,h:()=>'<h1>Название</h1>'+tbl(['Автор','Год','Жанр','Оценка'],[['','','','☆☆☆☆☆']])+'<h2>Главные идеи</h2><ul><li><br></li><li><br></li></ul><blockquote>Цитата, которая зацепила</blockquote><h2>Мои мысли</h2><p><br></p><h2>Что применю на практике</h2>'+cb()+cb()},
{id:'daily',n:'Планер дня',cat:'Планирование',ps:3,p:5,h:()=>'<h1>День — '+dts()+'</h1>'+cl('Главная цель дня','','cl-w')+'<h2>Приоритеты</h2>'+cb()+cb()+cb()+'<h2>Расписание</h2>'+tbl(['Время','Дело'],['8:00','10:00','12:00','14:00','16:00','18:00','20:00'].map(x=>[x,'']))+'<h2>Трекер дня</h2>'+cb('Вода: ☐☐☐☐☐☐☐☐')+cb('Сон 7+ часов')+cb('Движение')+'<h2>Заметки</h2><p><br></p>'},
{id:'week',n:'План недели',cat:'Планирование',ps:5,p:4,h:()=>'<h1>Неделя</h1>'+tbl(['День','Главное','Задачи','Итог'],['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(d=>[d,'','','']))},
{id:'habits',n:'Трекер привычек',cat:'Планирование',ps:2,p:6,h:()=>'<h1>Привычки</h1>'+tbl(['Привычка','Пн','Вт','Ср','Чт','Пт','Сб','Вс'],rep(5,()=>['','☐','☐','☐','☐','☐','☐','☐']))+cl('Награда за неделю','','cl-g')},
{id:'goals',n:'Цели и проект',cat:'Работа',ps:8,p:11,h:()=>'<h1>Проект</h1>'+cl('Цель','Чего хотим достичь и зачем','')+'<h2>Ключевые результаты</h2>'+cb()+cb()+cb()+'<h2>Этапы</h2>'+tbl(['Этап','Срок','Статус','Ответственный'],rep(4,()=>['','','','']))+'<h2>Риски</h2>'+tbl(['Риск','Что делаем'],rep(2,()=>['','']))},
{id:'meeting',n:'Встреча',cat:'Работа',ps:0,p:9,h:()=>'<h1>Встреча — '+dts()+'</h1><p>Участники: </p><h2>Повестка</h2><ol><li><br></li><li><br></li></ol>'+cl('Решения','','cl-g')+'<h2>Задачи</h2>'+tbl(['Задача','Кто','Срок'],rep(3,()=>['','','']))},
{id:'diary',n:'Дневник дня',cat:'Дневник',ps:9,p:8,h:()=>'<h1>Дневник — '+dts()+'</h1><p>Настроение: 😊 😐 😔 &nbsp; Погода: </p>'+cl('Главное за день','','')+'<h2>Благодарность</h2>'+cb()+cb()+cb()+'<h2>Чему научился</h2><p><br></p><h2>План на завтра</h2>'+cb()+cb()},
{id:'review',n:'Итоги недели',cat:'Дневник',ps:11,p:2,h:()=>'<h1>Итоги недели</h1>'+cl('Получилось','','cl-g')+cl('Не получилось','','cl-w')+cl('Чему научился','','')+cl('Фокус на следующую неделю','','cl-g')+tbl(['Сфера','Оценка 1–10'],[['Учёба',''],['Здоровье',''],['Отношения','']])}];
const TCAT=['Все',...new Set(TPLS.map(t=>t.cat))];
function tplDesign(T){const p=PS[T.ps],pi=T.p??p[5];return Object.assign(def(),{s:T.ps,hf:p[1],bf:p[2],pt:p[3],h:p[4],p:pi})}
function tplVars(T){const d=tplDesign(T),c=PAL[d.p];return'--bg:#'+c[1]+';--sf:#'+c[2]+';--ac:#'+c[3]+';--tx:#'+c[4]+";--hf:'"+d.hf+"';--bf:'"+d.bf+"'"}
function fitTpl(){document.querySelectorAll('#tgl .tcp').forEach(c=>{if(c.clientWidth)c.firstChild.style.transform='scale('+(c.clientWidth/820)+')'})}
function buildTpl(){let m=$('#tgl');if(!m){m=document.createElement('div');m.id='tgl';m.hidden=true;document.body.append(m)}
m.innerHTML='<div class="tgb" role="dialog" aria-modal="true" aria-label="Шаблоны"><div class="tgh"><b>Шаблоны</b><div class="tgc"></div><button id="tgx" aria-label="Закрыть">✕</button></div><div class="tgg"></div></div>';
const cats=m.querySelector('.tgc'),grid=m.querySelector('.tgg');
TCAT.forEach((c,i)=>{const b=document.createElement('button');b.textContent=c;b.className=i?'':'on';b.onclick=()=>{cats.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x==b));grid.querySelectorAll('.tc').forEach(x=>x.hidden=!(i==0||x.dataset.cat==c));fitTpl()};cats.append(b)});
TPLS.forEach(T=>{const d=tplDesign(T),e=document.createElement('div');e.className='tc';e.dataset.cat=T.cat;e.innerHTML='<div class="tcp"><div class="tpv" data-h="'+d.h+'" data-p="'+d.pt+'" style="'+tplVars(T)+'">'+T.h()+'</div></div><div class="tcm"><b></b><small></small></div><div class="tca"><button class="pri" data-a="new">Новая заметка</button><button data-a="ins">В текущую</button></div>';
e.querySelector('.tcm b').textContent=T.n;e.querySelector('.tcm small').textContent=T.cat+' · '+PS[T.ps][0];
e.querySelectorAll('.tpv input').forEach(i=>i.disabled=true);
e.querySelector('[data-a=new]').onclick=()=>{sv();const n=mk();n.t=T.n;n.h=T.h();n.s=tplDesign(T);open(n);persist(true);m.hidden=true;toast('Создана заметка по шаблону «'+T.n+'»')};
e.querySelector('[data-a=ins]').onclick=async()=>{const empty=!ed.innerText.trim()&&!ed.querySelector('img,table');if(!empty&&!await ask('Добавить шаблон «'+T.n+'» в конец текущей страницы?'))return;ed.innerHTML=(empty?'':cleanHtml())+T.h();fxScan();svl();m.hidden=true;toast('Шаблон добавлен')};
grid.append(e)});
m.onclick=e=>{if(e.target==m||e.target.id=='tgx')m.hidden=true};m.dataset.b=1}
$('#tp').onclick=e=>{e.stopPropagation();if(!$('#tgl')||!$('#tgl').dataset.b)buildTpl();$('#tgl').hidden=false;fitTpl();$('#tgl .tgc button').focus()};
addEventListener('resize',()=>{if($('#tgl')&&!$('#tgl').hidden)fitTpl()});
addEventListener('keydown',e=>{if(e.key=='Escape'&&$('#tgl')&&!$('#tgl').hidden&&!$('#dlg'))$('#tgl').hidden=true});
