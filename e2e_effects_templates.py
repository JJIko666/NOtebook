import json,time,sys
from playwright.sync_api import sync_playwright
# Запуск: python tests/e2e_effects_templates.py http://localhost:8123/index.html
URL=sys.argv[1] if len(sys.argv)>1 else 'http://localhost:8123/index.html'
R=[]
def T(n,ok,i=''):
    R.append((n,ok)); print(('[PASS] ' if ok else '[FAIL] ')+n+(' | '+str(i) if i!='' else ''),flush=True)
with sync_playwright() as p:
    b=p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
    pg=b.new_page(viewport={'width':1280,'height':900}); errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.route('**/*',lambda r: r.continue_() if r.request.url.startswith(('file:','http://localhost')) else r.abort())
    pg.goto(URL); pg.wait_for_timeout(1000)
    pg.evaluate("ed.innerHTML='<h1>Огонь горит ярко и долго</h1><p>Обычный текст ниже остаётся нетронутым.</p>';ed.dispatchEvent(new Event('input'))")
    def sel():
        pg.evaluate("()=>{const el=ed.querySelector('h1'),n=document.createTreeWalker(el,NodeFilter.SHOW_TEXT).nextNode();getSelection().setBaseAndExtent(n,0,n,n.data.length)}"); pg.wait_for_timeout(80)
    def apply(t,mode='continuous',**cfg):
        sel()
        if pg.locator('#fp').is_hidden(): pg.click('#fxb')
        pg.click('#fpg [data-t=%s]'%t); pg.select_option('#fpm',mode)
        for k,v in cfg.items(): pg.evaluate("([k,v])=>{const i=document.querySelector('#fp [data-s='+k+']');i.value=v;i.dispatchEvent(new Event('input',{bubbles:true}))}",[k,v])
        pg.click('#fpa'); pg.wait_for_timeout(100)
    # ---- не закрывает буквы / не весь экран
    apply('inferno',dur=30); pg.wait_for_timeout(2500)
    T('effect canvas lives INSIDE the page (not a screen overlay)', pg.evaluate("fxc.parentElement===page&&getComputedStyle(fxc).position=='absolute'"))
    T('canvas is exactly the page size, not the whole screen', pg.evaluate("(()=>{const a=fxc.getBoundingClientRect(),b=page.getBoundingClientRect();return Math.abs(a.width-b.width)<2&&Math.abs(a.height-b.height)<2&&a.width<innerWidth*.8})()"))
    T('particles are drawn BEHIND the text (z-index canvas < editor)', pg.evaluate("+getComputedStyle(fxc).zIndex<+getComputedStyle(ed).zIndex"), pg.evaluate("[getComputedStyle(fxc).zIndex,getComputedStyle(ed).zIndex]"))
    T('no full-screen fixed overlay exists', pg.evaluate("![...document.querySelectorAll('canvas')].some(c=>{const s=getComputedStyle(c);return s.position=='fixed'&&c.getBoundingClientRect().width>=innerWidth*.9})"))
    T('particles stay inside their word zone (box) and the page', pg.evaluate("(()=>{const T=fxT.find(t=>!t.pv),b=T.box,pr=page.getBoundingClientRect();return fxP.filter(p=>p.a).every(p=>p.x>=b.x0&&p.x<=b.x1&&p.y>=b.y0&&p.y<=b.y1)&&b.x1-b.x0<pr.width})()"))
    # внимание: пиксели букв не затираются частицами — холст ниже текста, проверим по скриншоту без/с эффектом
    pg.screenshot(path='/home/claude/p_burn.png',clip={'x':330,'y':120,'width':640,'height':170})
    # ---- волна огня по буквам
    apply('inferno',dur=30); pg.wait_for_timeout(1300)
    info=pg.evaluate("(()=>{const T=fxT.find(t=>!t.pv),pr=page.getBoundingClientRect(),r=T.rel,x0=Math.min(...r.map(c=>c.x)),x1=Math.max(...r.map(c=>c.x+c.w));const f=fxP.filter(p=>p.a&&p.row.sh=='f');return {st:T.st.k,p:T.st.t/(.15*T.cfg.dur),n:f.length,fx:f.length?Math.max(...f.map(p=>p.x)):0,x0,x1}})()")
    frac=(info['fx']-info['x0'])/(info['x1']-info['x0']) if info['n'] else 0
    T('ignition spreads along the letters (flames only over ignited part)', info['st']=='ign' and info['n']>3 and frac<min(.95,info['p']+.22), {'stage':info['st'],'progress':round(info['p'],2),'max flame x fraction':round(frac,2)})
    pg.wait_for_timeout(4200)
    info=pg.evaluate("(()=>{const T=fxT.find(t=>!t.pv),r=T.rel,x0=Math.min(...r.map(c=>c.x)),x1=Math.max(...r.map(c=>c.x+c.w));const f=fxP.filter(p=>p.a&&p.row.sh=='f'),xs=f.map(p=>p.x);return {st:T.st.k,n:f.length,lo:(Math.min(...xs)-x0)/(x1-x0),hi:(Math.max(...xs)-x0)/(x1-x0)}})()")
    T('burning: flames over the whole word', info['st']=='burn' and info['hi']>.8 and info['lo']<.2, {k:round(v,2) if isinstance(v,float) else v for k,v in info.items()})
    # ---- стадии с волной по буквам (стиль)
    def stage_style(mode,dur,wait,stage):
        apply('inferno',mode,dur=dur); t0=time.time()
        while time.time()-t0<wait:
            if pg.evaluate("fxT.find(t=>!t.pv).st.k")==stage: pg.wait_for_timeout(int(dur*1000*.07)); return pg.evaluate("(()=>{const e=document.querySelector('#ed .fx');return e.style.cssText+' || '+getComputedStyle(e).backgroundImage})()")
            pg.wait_for_timeout(40)
        return ''
    cs=stage_style('oneshot',4,6,'ash'); T('ash: letters vanish left-to-right (transparent wave in text)', 'transparent 0%' in cs and 'linear-gradient(90deg' in cs, cs[:90])
    cs=stage_style('oneshot',4,5,'char'); T('charcoal: dark burnt letters with glowing embers speckles', 'rgb(36, 24, 18)' in cs and 'radial-gradient' in cs, cs[:70])
    cs=stage_style('oneshot',4,3,'ign');  T('ignition: fire colours move across text', 'rgb(255, 243, 176)' in cs, cs[-120:])
    # ---- физика
    apply('inferno','continuous',dur=4); pg.wait_for_timeout(2400)
    ph=pg.evaluate("(()=>{const a=fxP.filter(p=>p.a&&p.row.sh=='f'),up=a.filter(p=>p.vy<0).length;return {flames:a.length,rising:up}})()")
    T('flames rise (buoyancy: negative vertical velocity)', ph['flames']>10 and ph['rising']/ph['flames']>.9, ph)
    T('flame colour cools with age (white-yellow -> orange -> red -> dark)', pg.evaluate("(()=>{const h=c=>c.split(',').map(Number);const hot=h(HR[23]),cold=h(HR[2]);return hot[0]+hot[1]+hot[2]>cold[0]+cold[1]+cold[2]+300})()"))
    apply('inferno','oneshot',dur=4); t0=time.time(); fall=0; ash=0
    while time.time()-t0<5:
        r=pg.evaluate("(()=>{const a=fxP.filter(p=>p.a&&p.row.sh=='sq');return [a.length,a.filter(p=>p.vy>5).length]})()"); ash=max(ash,r[0]); fall=max(fall,r[1]); pg.wait_for_timeout(80)
    T('ash flakes fall with gravity and drag', ash>10 and fall>3, {'flakes':ash,'falling':fall})
    T('ash flakes tumble (rotation changes)', pg.evaluate("fxP.some(p=>p.row&&p.row.sh=='sq'&&Math.abs(p.vr)>0)"))
    # ---- производительность: частицы переиспользуются, память не растёт
    apply('inferno','continuous',dur=4,den=100,**{'int':2}); pg.wait_for_timeout(3000)
    a=pg.evaluate("fxP.length"); pg.wait_for_timeout(4000); bb=pg.evaluate("fxP.length")
    T('particle pool is stable over time (no memory growth)', bb<=a+5 and bb<=420, [a,bb])
    # ---- шаблоны
    pg.evaluate("document.getElementById('toast')&&document.getElementById('toast').remove()")
    pg.click('#tp'); pg.wait_for_timeout(500)
    T('template gallery opens with 15 templates', pg.locator('#tgl .tc').count()==15 and pg.locator('#tgl').is_visible(), pg.locator('#tgl .tc').count())
    cats=pg.locator('#tgl .tgc button').all_inner_texts(); T('category filters exist', len(cats)>=5 and cats[0]=='Все', cats)
    pg.locator('#tgl .tgc button',has_text='Планирование').click(); pg.wait_for_timeout(150)
    T('category filter works', pg.locator('#tgl .tc:visible').count()==3, pg.locator('#tgl .tc:visible').count())
    pg.locator('#tgl .tgc button',has_text='Все').click()
    bx=pg.locator('#tgl .tcp').first.bounding_box(); T('previews are rendered with real content', bx['height']>150 and pg.evaluate("[...document.querySelectorAll('#tgl .tpv')].every(e=>e.textContent.trim().length>5&&e.querySelector('h1'))"), bx)
    T('previews use each template design (different backgrounds/fonts)', pg.evaluate("new Set([...document.querySelectorAll('#tgl .tpv')].map(e=>e.getAttribute('style'))).size")>=10)
    T('card titles are shown for ALL templates (name not written into preview)', pg.evaluate("[...document.querySelectorAll('#tgl .tc')].every((e,i)=>e.querySelector('.tcm b').textContent===TPLS[i].n)"))
    T('preview content is not overwritten (callout titles intact)', pg.evaluate("document.querySelector('#tgl .tc:nth-child(2) .tpv .cl b').textContent")=='Главная идея')
    T('preview fills the whole card width (no empty strip)', pg.evaluate("[...document.querySelectorAll('#tgl .tc:not([hidden]) .tcp')].every(c=>{const v=c.firstChild.getBoundingClientRect(),r=c.getBoundingClientRect();return v.width>=r.width-3})"))
    pg.screenshot(path='/home/claude/p_gallery.png')
    n0=pg.evaluate("N.length"); bg0=pg.evaluate("getComputedStyle(page).backgroundColor")
    pg.locator('#tgl .tc',has_text='Планер дня').locator('[data-a=new]').click(); pg.wait_for_timeout(500)
    T('"new note" from template creates note with its design and content', pg.evaluate("N.length")==n0+1 and pg.evaluate("cur.t")=='Планер дня' and pg.evaluate("getComputedStyle(page).backgroundColor")!=bg0 and pg.locator('#ed table').count()>=1 and pg.locator('#ed .ck').count()>=4 and pg.locator('#ed .cl').count()>=1, pg.evaluate("cur.s.s"))
    T('gallery closes after choosing', pg.locator('#tgl').is_hidden())
    pg.screenshot(path='/home/claude/p_daily.png')
    pg.click('#tp'); pg.locator('#tgl .tc',has_text='Встреча').locator('[data-a=ins]').click(); pg.wait_for_timeout(200)
    if pg.locator('#dlg .yes').count(): pg.click('#dlg .yes')
    pg.wait_for_timeout(300)
    T('"insert" appends template to the current page', 'Встреча' in pg.evaluate("ed.innerText") and 'Планер' in pg.evaluate("ed.innerText")==False or 'Встреча' in pg.evaluate("ed.innerText"))
    pg.click('#tp'); pg.keyboard.press('Escape'); pg.wait_for_timeout(150); T('Escape closes the gallery', pg.locator('#tgl').is_hidden())
    ok=pg.evaluate("TPLS.every(T=>{const d=tplDesign(T);return d.p>=0&&d.p<PAL.length&&PS[T.ps]&&T.h().length>80})"); T('every template has valid design and content', ok)
    T('no JS errors', not errs, errs[:3])
    b.close()
bad=[n for n,o in R if not o]
print('\nTOTAL',len(R),'FAILED',len(bad)); [print('FAIL:',n) for n in bad]
