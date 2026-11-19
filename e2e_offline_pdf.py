import json,time
import os,sys,tempfile
from playwright.sync_api import sync_playwright
# Запуск: сначала  npx serve . -l 8123  (или python -m http.server 8123),  затем  python tests/e2e_offline_pdf.py
# Нужно: pip install playwright reportlab && playwright install chromium
from reportlab.pdfgen import canvas as _c
from reportlab.lib.pagesizes import A4
TMP=tempfile.mkdtemp();OKPDF=TMP+'/test3.pdf';BADPDF=TMP+'/broken.pdf'
_k=_c.Canvas(OKPDF,pagesize=A4)
for _i in range(1,4):
    _k.setFont('Helvetica-Bold',28);_k.drawString(72,760,'Noteverse offline PDF page %d'%_i);_k.setFont('Helvetica',14);_k.drawString(72,720,'This page %d contains the keyword quasar and some ordinary text.'%_i)
    if _i==2:_k.drawString(72,690,'Second quasar mention only on page two.')
    _k.showPage()
_k.save();open(BADPDF,'wb').write(b'%PDF-1.4 not really a pdf')
BASE=os.environ.get('NV_URL','http://localhost:8123/index.html')
R=[]
def T(n,ok,i=''):
    R.append((n,ok)); print(('[PASS] ' if ok else '[FAIL] ')+n+(' | '+str(i) if i!='' else ''),flush=True)
with sync_playwright() as p:
    b=p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
    ctx=b.new_context(viewport={'width':1280,'height':900}); pg=ctx.new_page(); errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.route('**/*',lambda r: r.continue_() if r.request.url.startswith('http://localhost') else r.abort())
    pg.goto(BASE); pg.wait_for_timeout(1500)
    T('project loads over http, all 6 scripts executed', pg.evaluate("typeof fxApply=='function'&&typeof buildTpl=='function'&&typeof pdfViewer=='object'&&typeof persist=='function'&&typeof snd=='function'"))
    T('no CDN dependencies in the project (offline-capable)', pg.evaluate("![...document.scripts].some(s=>/^https?:\\/\\//.test(s.src)&&!s.src.startsWith(location.origin))&&!window.html2canvas"))
    ready=pg.evaluate("navigator.serviceWorker.ready.then(r=>!!r.active)"); T('service worker registered and active', ready)
    pg.wait_for_timeout(1500)
    keys=pg.evaluate("caches.keys().then(async k=>{const c=await caches.open(k[0]);return (await c.keys()).map(r=>new URL(r.url).pathname)})")
    need=['/index.html','/css/style.css','/css/extra.css','/js/app.js','/js/fx.js','/js/templates.js','/js/pdfview.js','/js/init.js','/vendor/pdfjs/pdf.min.mjs','/vendor/pdfjs/pdf.worker.min.mjs','/manifest.webmanifest']
    T('all app files + local PDF.js are cached', all(n in keys for n in need), [n for n in need if n not in keys])
    # ---- офлайн
    ctx.set_offline(True)
    pg.reload(); pg.wait_for_timeout(1500)
    T('app starts with NO internet (from cache)', pg.evaluate("typeof fxApply=='function'")  and pg.locator('.it').count()>=1)
    pg.click('#nn'); pg.fill('#tt','Офлайн заметка'); pg.click('#ed'); pg.keyboard.type('Создано без интернета'); pg.wait_for_timeout(900)
    pg.reload(); pg.wait_for_timeout(1500)
    T('note created offline survives restart', 'Офлайн заметка' in pg.evaluate("N.map(n=>n.t)"))
    # ---- PDF.js офлайн
    pg.click('#pdfb'); T('PDF viewer opens', pg.locator('#pvw').is_visible())
    pg.set_input_files('#pvf',OKPDF); pg.wait_for_timeout(2500)
    T('PDF opens offline: 3 pages detected', pg.evaluate("pdfViewer.doc&&pdfViewer.doc.numPages")==3 and '3' in pg.inner_text('#pvt'), pg.inner_text('#pvt'))
    dark=lambda: pg.evaluate("(()=>{const c=document.querySelector('#pvcv'),d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let n=0;for(let i=0;i<d.length;i+=16)if(d[i]<100)n++;return n})()")
    T('page 1 actually rendered (text pixels present)', dark()>200, dark())
    w1=pg.evaluate("document.querySelector('#pvcv').width")
    pg.click('#pvnext'); pg.wait_for_timeout(700); T('next page works', pg.input_value('#pvn')=='2' and dark()>200)
    pg.click('#pvprev'); pg.wait_for_timeout(500); T('previous page works', pg.input_value('#pvn')=='1')
    pg.fill('#pvn','3'); pg.press('#pvn','Enter'); pg.dispatch_event('#pvn','change'); pg.wait_for_timeout(700); T('jump to page number works', pg.input_value('#pvn')=='3')
    pg.click('#pvzi'); pg.wait_for_timeout(700); w2=pg.evaluate("document.querySelector('#pvcv').width"); T('zoom in enlarges the page', w2>w1*1.1, [w1,w2])
    pg.click('#pvzo'); pg.click('#pvzo'); pg.wait_for_timeout(900); w3=pg.evaluate("document.querySelector('#pvcv').width"); T('zoom out shrinks the page', w3<w2, [w2,w3])
    pg.click('#pvfit'); pg.wait_for_timeout(700); T('fit-to-width works', pg.evaluate("document.querySelector('#pvcv').getBoundingClientRect().width")>300)
    pg.fill('#pvq','quasar'); pg.click('#pvgo'); pg.wait_for_timeout(1800)
    T('text search finds all matches across pages (4)', '1 из 4' in pg.inner_text('#pvr') or 'из 4' in pg.inner_text('#pvr'), pg.inner_text('#pvr'))
    T('search highlights the match on the page', pg.locator('#pvhl i').count()>=1, pg.locator('#pvhl i').count())
    pg.press('#pvq','Enter'); pg.wait_for_timeout(700); T('next match jumps to another hit', '2 из 4' in pg.inner_text('#pvr'), pg.inner_text('#pvr'))
    pg.fill('#pvq','zzzznotthere'); pg.click('#pvgo'); pg.wait_for_timeout(1200); T('search with no results says so', 'Ничего не найдено' in pg.inner_text('#pvr'))
    pg.set_input_files('#pvf',BADPDF); pg.wait_for_timeout(1500)
    T('corrupt PDF shows a clear error (no crash)', 'Не удалось открыть PDF' in pg.inner_text('#pve') and pg.evaluate("pdfViewer.doc")==None)
    pg.set_input_files('#pvf',OKPDF); pg.wait_for_timeout(1800)
    pg.click('#pvc'); pg.wait_for_timeout(300); T('closing releases the document (memory)', pg.evaluate("pdfViewer.doc")==None and pg.locator('#pvw').is_hidden())
    ctx.set_offline(False)
    # ---- печать PDF без библиотек
    pg.evaluate("(()=>{window.__pr=0;window.print=()=>{window.__pr++}})()")
    pg.click('#ex'); pg.click('#pe >> text=PDF'); pg.wait_for_timeout(500)
    T('PDF export falls back to system "Save as PDF" (works offline)', pg.evaluate("window.__pr")==1)
    pg.evaluate("window.dispatchEvent(new Event('afterprint'))")
    # ---- основной функционал в проекте
    pg.click('#tp'); pg.wait_for_timeout(300); T('templates gallery works in the project', pg.locator('#tgl .tc').count()==15); pg.keyboard.press('Escape')
    pg.evaluate("ed.innerHTML='<h1>Огонь горит</h1>';ed.dispatchEvent(new Event('input'))")
    pg.evaluate("()=>{const n=ed.querySelector('h1').firstChild;getSelection().setBaseAndExtent(n,0,n,n.data.length)}"); pg.wait_for_timeout(80)
    pg.click('#fxb'); pg.click('#fpg [data-t=inferno]'); pg.click('#fpa'); pg.wait_for_timeout(1800)
    T('effects work in the project (particles rendering)', pg.evaluate("fxP.filter(p=>p.a).length")>5)
    T('no JS errors', not errs, errs[:3])
    b.close()
bad=[n for n,o in R if not o]
print('\nTOTAL',len(R),'FAILED',len(bad)); [print('FAIL:',n) for n in bad]
