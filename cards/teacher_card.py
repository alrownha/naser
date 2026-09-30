import math, pathlib, glob
from playwright.sync_api import sync_playwright
F='/home/user/naser/cards/fonts'
K='fill="#fff" stroke="#111" stroke-width="0.55" stroke-linejoin="round" stroke-linecap="round"'
def star(cx,cy,r):
    p=[]
    for i in range(10):
        a=-math.pi/2+i*math.pi/5; rr=r if i%2==0 else r*0.45
        p.append(f"{cx+rr*math.cos(a):.2f},{cy+rr*math.sin(a):.2f}")
    return f'<polygon points="{" ".join(p)}" {K}/>'
def heart(cx,cy,s):
    return f'<path transform="translate({cx} {cy}) scale({s})" d="M0 3.6 C-4.2 0.4 -5.4 -2.8 -2.8 -4.4 C-1.2 -5.3 0 -4 0 -2.8 C0 -4 1.2 -5.3 2.8 -4.4 C5.4 -2.8 4.2 0.4 0 3.6 Z" {K}/>'
def cloud(cx,cy,s):
    return f'<path transform="translate({cx} {cy}) scale({s})" d="M-9 3 a4 4 0 0 1 -1 -7.6 a5 5 0 0 1 8.5 -3 a5.5 5.5 0 0 1 9.5 2.2 a4 4 0 0 1 1 8.4 Z" {K}/>'
def flower(cx,cy):
    pet=''.join(f'<ellipse transform="translate({cx} {cy}) rotate({a})" cx="0" cy="-6.2" rx="3.1" ry="4.4" {K}/>' for a in range(0,360,60))
    return (f'<path d="M{cx} {cy+9} q-1 8 0 20" fill="none" stroke="#111" stroke-width="0.55"/>'
            f'<path d="M{cx} {cy+19} q-7 -4 -8 -9 q7 1 8 9z" {K}/><path d="M{cx} {cy+24} q7 -4 8 -9 q-7 1 -8 9z" {K}/>'
            + pet + f'<circle cx="{cx}" cy="{cy}" r="3.4" {K}/>')
def sun(cx,cy):
    rays=''.join(f'<line transform="translate({cx} {cy}) rotate({a})" x1="0" y1="-10.5" x2="0" y2="-14" stroke="#111" stroke-width="0.6" stroke-linecap="round"/>' for a in range(0,360,45))
    return rays+f'<circle cx="{cx}" cy="{cy}" r="8" {K}/><circle cx="{cx-2.6}" cy="{cy-1.5}" r="0.7" fill="#111"/><circle cx="{cx+2.6}" cy="{cy-1.5}" r="0.7" fill="#111"/><path d="M{cx-3} {cy+2} q3 3 6 0" fill="none" stroke="#111" stroke-width="0.6" stroke-linecap="round"/>'
def books(cx,cy):
    out=''
    for i,(w,h) in enumerate(((30,7),(28,7),(26,7))):
        y=cy-i*7.5; x=cx-w/2+i*1.2
        out+=f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="1.2" {K}/><line x1="{x+3}" y1="{y}" x2="{x+3}" y2="{y+h}" stroke="#111" stroke-width="0.45"/>'
    return out
def pencil_big(cx,cy):
    return (f'<g transform="translate({cx} {cy}) rotate(-22)">'
            f'<rect x="-7" y="-30" width="14" height="52" {K}/>'
            f'<line x1="-2.3" y1="-30" x2="-2.3" y2="22" stroke="#111" stroke-width="0.4"/><line x1="2.3" y1="-30" x2="2.3" y2="22" stroke="#111" stroke-width="0.4"/>'
            f'<rect x="-7" y="-36" width="14" height="6" {K}/><rect x="-7" y="-44" width="14" height="8" rx="3" {K}/>'
            f'<path d="M-7 22 L0 36 L7 22 Z" {K}/><path d="M-2.4 31 L0 36 L2.4 31 Z" fill="#111"/>'
            f'<circle cx="-2.6" cy="-8" r="0.9" fill="#111"/><circle cx="2.6" cy="-8" r="0.9" fill="#111"/><path d="M-3 -3 q3 3.5 6 0" fill="none" stroke="#111" stroke-width="0.7" stroke-linecap="round"/></g>')
def rainbow(cx,cy):
    out=''
    for r in (36,32,28,24,20,16):
        out+=f'<path d="M{cx-r} {cy} A{r} {r} 0 0 1 {cx+r} {cy}" fill="none" stroke="#111" stroke-width="0.55"/>'
    out+=f'<line x1="{cx-36}" y1="{cy}" x2="{cx-16}" y2="{cy}" stroke="#111" stroke-width="0.55"/><line x1="{cx+16}" y1="{cy}" x2="{cx+36}" y2="{cy}" stroke="#111" stroke-width="0.55"/>'
    return out+cloud(cx-30,cy+2,1.3)+cloud(cx+30,cy+2,1.3)
def pencil_slot(x, label):
    # dotted pencil placeholder + two slit marks to cut by hand
    g=f'<rect x="{x}" y="16" width="9" height="170" rx="2.5" fill="none" stroke="#9a9a9a" stroke-width="0.4" stroke-dasharray="1.6 1.6"/>'
    for y in (52,150):
        g+=f'<line x1="{x-1.5}" y1="{y}" x2="{x+10.5}" y2="{y}" stroke="#111" stroke-width="0.7"/>'
        g+=f'<text x="{x+4.5}" y="{y-2}" text-anchor="middle" font-family="Tajawal" font-size="2.6" fill="#777">{label}</text>'
    return g
def frame(): return '<rect x="3" y="3" width="124" height="194" rx="5" fill="#fff" stroke="#111" stroke-width="0.8"/><rect x="5.5" y="5.5" width="119" height="189" rx="3.5" fill="none" stroke="#111" stroke-width="0.35" stroke-dasharray="2 1.6"/>'
HT='fill="#fff" stroke="#111" stroke-width="0.6" stroke-linejoin="round" paint-order="stroke" font-family="Lalezar"'
def wrap(body,lang):
    return f'''<!doctype html><html lang="{lang}"><head><meta charset="utf-8"><style>
@font-face{{font-family:Lalezar;src:url({F}/lalezar-latin.woff2)}}@font-face{{font-family:Lalezar;src:url({F}/lalezar.ttf);unicode-range:U+0600-06FF,U+FB50-FDFF,U+FE70-FEFF}}@font-face{{font-family:Tajawal;src:url({F}/tajawal.ttf)}}@font-face{{font-family:Naskh;src:url({F}/naskh.ttf)}}
html,body{{margin:0;width:130mm;height:200mm;background:#fff}}svg{{display:block}}</style></head><body>
<svg width="130mm" height="200mm" viewBox="0 0 130 200" xmlns="http://www.w3.org/2000/svg">{body}</svg></body></html>'''
# ---------- Arabic ----------
cx=76
ar=frame()+pencil_slot(9,'قص')
ar+=f'<text x="{cx}" y="34" text-anchor="middle" font-size="19" {HT}>شكراً معلمتي</text>'
ar+=f'<text x="{cx}" y="48" text-anchor="middle" font-family="Naskh" font-weight="700" font-size="7" fill="#111">أُحِبُّكِ لأنَّكِ تُعَلِّمينَني كُلَّ يَوم</text>'
ar+=heart(30,28,1.1)+heart(122,30,1.1)+heart(cx,58,0.9)
ar+=sun(38,74)+rainbow(cx,116)+heart(116,84,2.1)+star(118,106,4)+star(30,130,3.6)
ar+=flower(44,150)+flower(76,154)+flower(108,150)
ar+='<path d="M28 180 l4 -4 4 4 4 -4 4 4 4 -4 4 4 4 -4 4 4 4 -4 4 4 4 -4 4 4 4 -4 4 4 4 -4 4 4 4 -4 4 4 4 -4 4 4 4 -4 4 4 4 -4 4 4" fill="none" stroke="#111" stroke-width="0.5" stroke-linejoin="round"/>'
ar+=star(120,158,3.2)
ar+=f'<text x="{cx}" y="191" text-anchor="middle" font-family="Naskh" font-weight="700" font-size="7.5" fill="#111">من شوق</text>'+heart(50,189,1)+heart(102,189,1)
pathlib.Path('ar.html').write_text(wrap(ar,'ar'),encoding='utf-8')
# ---------- English ----------
cx=56
en=frame()+pencil_slot(112,'cut')
en+=f'<text x="{cx}" y="30" text-anchor="middle" font-size="17" {HT}>Thank You,</text>'
en+=f'<text x="{cx}" y="50" text-anchor="middle" font-size="17" {HT}>Teacher!</text>'
en+=f'<text x="{cx}" y="70" text-anchor="middle" font-size="11" {HT}>I Love You</text>'
en+=heart(14,44,1.3)+heart(100,68,1.2)+heart(12,72,1)
en+=star(20,96,4)+star(96,90,3.4)+heart(24,120,2.2)+heart(88,132,1.6)+star(100,150,3.6)+star(14,150,3)
en+=pencil_big(46,122)+books(84,172)+heart(60,178,1.2)
en+=f'<text x="{cx}" y="191" text-anchor="middle" font-family="Tajawal" font-weight="700" font-size="7.5" fill="#111">Love, Shouq</text>'+heart(28,189,1)+heart(84,189,1)
pathlib.Path('en.html').write_text(wrap(en,'en'),encoding='utf-8')
with sync_playwright() as pw:
    b=pw.chromium.launch(executable_path=glob.glob('/opt/pw-browsers/chromium*/chrome-linux*/chrome')[0])
    pg=b.new_page(viewport={'width':492,'height':756},device_scale_factor=3.125)
    for n in ('ar','en'):
        pg.goto(pathlib.Path(f'{n}.html').resolve().as_uri()); pg.wait_for_timeout(500)
        pg.screenshot(path=f'{n}.png',clip={'x':0,'y':0,'width':491.34,'height':755.9})
    b.close()
from PIL import Image
pxmm=1535/130
for n,out in (('ar','تلوين-شكراً-معلمتي.png'),('en','coloring-thank-you-teacher.png')):
    im=Image.open(f'{n}.png').convert('RGB'); c=round(2*pxmm)
    im=im.crop((c,c,im.width-c,im.height-c)); im.save(out,dpi=(300,300)); print(out,im.size,'%.2f x %.2f cm'%(im.width/pxmm/10,im.height/pxmm/10))
