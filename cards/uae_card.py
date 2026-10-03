import sys, pathlib
sys.path.insert(0, '/home/user/naser/cards')
from export_png import export

RED, GREEN, BLACK, GREY = '#c8102e', '#00843d', '#1a1a1a', '#555'
INSTA = '<svg width="{s}" height="{s}" viewBox="0 0 24 24" fill="none" stroke="#dd2a7b" stroke-width="2.2"><rect x="2.5" y="2.5" width="19" height="19" rx="5.5"/><circle cx="12" cy="12" r="4.3"/><circle cx="17.6" cy="6.4" r="1.2" fill="#dd2a7b" stroke="none"/></svg>'
WA = '<svg width="{s}" height="{s}" viewBox="0 0 24 24" fill="none" stroke="#25a35a" stroke-width="2"><path d="M3.6 20.4l1.2-4.1A8.6 8.6 0 1 1 7.9 19.3z" stroke-linejoin="round"/></svg>'

def flag(w, h):
    q = w / 4; t = h / 3
    return f'''<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" fill="none" stroke-width="1.4" stroke-linejoin="round">
<rect x="0.7" y="0.7" width="{q-1.4}" height="{h-1.4}" fill="{RED}" stroke="{RED}"/>
<rect x="{q+0.7}" y="0.7" width="{w-q-1.4}" height="{t-1.4}" stroke="{GREEN}" stroke-width="2"/>
<rect x="{q+0.7}" y="{t+0.7}" width="{w-q-1.4}" height="{t-1.4}" stroke="#999" stroke-width="1"/>
<rect x="{q+0.7}" y="{2*t+0.7}" width="{w-q-1.4}" height="{t-1.4}" fill="{BLACK}" stroke="{BLACK}"/>
</svg>'''

def stripe(w):
    # thin 4-colour line: red, green, white(outline), black
    s = w / 4
    return f'''<svg width="{w}" height="5" viewBox="0 0 {w} 5" fill="none" stroke-width="5">
<line x1="0" y1="2.5" x2="{s}" y2="2.5" stroke="{RED}"/><line x1="{s}" y1="2.5" x2="{2*s}" y2="2.5" stroke="{GREEN}"/>
<rect x="{2*s}" y="0.6" width="{s}" height="3.8" stroke="{BLACK}" stroke-width="1.2"/><line x1="{3*s}" y1="2.5" x2="{w}" y2="2.5" stroke="{BLACK}"/>
</svg>'''

def contact(fs, ic):
    return f'''<div dir="ltr" style="position:relative;display:flex;align-items:center;gap:5px;font-family:Baloo;font-weight:700;font-size:{fs}px;color:{BLACK}">
{INSTA.format(s=ic)}<span>s.3d.ae</span><span style="width:6px"></span>{WA.format(s=ic)}<span>+971 50 914 7566</span></div>'''

def fromline(name, gender, fs):
    w = 'من صديقتكم' if gender == 'f' else 'من صديقكم'
    return f'<div dir="rtl" style="position:relative;display:flex;align-items:baseline;gap:5px;font-family:Baloo;font-weight:700;font-size:{fs}px;color:{BLACK}"><span>{w}</span><span style="color:{RED}">♥</span><span>{name}</span></div>'

def wrap(w, h, inner):
    return f'''<!doctype html><html lang="ar"><head><meta charset="utf-8"></head><body><x-dc><helmet></helmet>
<style>@font-face{{font-family:Baloo;font-weight:700 800;src:url(/home/user/naser/cards/fonts/baloo-latin.woff2)}}@font-face{{font-family:Baloo;font-weight:700 800;src:url(/home/user/naser/cards/fonts/baloo-arabic.woff2);unicode-range:U+0600-06FF,U+FB50-FDFF,U+FE70-FEFF}}</style>
<div style="width: {w}px; height: {h}px; position: relative; box-sizing: border-box; background: #ffffff; border: 2.5px solid {BLACK}; border-radius: 14px; display: flex; flex-direction: column; align-items: center; padding: 0">
{inner}</div></x-dc></body></html>'''

# ---------- backer card for the clicker badges: 92 x 140 mm (same as letter cards) ----------
def backer(name, gender):
    W, H = 348, 529
    inner = f'''
<svg width="{W}" height="{H}" viewBox="0 0 {W} {H}" style="position:absolute;left:0;top:0" fill="none">
<rect x="9" y="9" width="{W-18}" height="{H-18}" rx="9" stroke="{GREY}" stroke-width="1" stroke-dasharray="5 4"/>
<g stroke="{GREEN}" stroke-width="1.4" stroke-linecap="round"><path d="M34 86 l0 9 M29.5 90.5 l9 0"/><path d="M312 110 l0 9 M307.5 114.5 l9 0"/></g>
<g stroke="{RED}" stroke-width="1.4" stroke-linecap="round"><path d="M40 380 l0 9 M35.5 384.5 l9 0"/><path d="M306 350 l0 9 M301.5 354.5 l9 0"/></g>
<circle cx="52" cy="140" r="2" stroke="{BLACK}" stroke-width="1.2"/><circle cx="296" cy="160" r="2" stroke="{BLACK}" stroke-width="1.2"/>
</svg>
<div style="position:relative;margin-top:22px">{flag(54, 27)}</div>
<div style="position:relative;margin-top:6px;font-family:Lalezar;font-size:34px;line-height:1.1;color:{RED}">اليوم الوطني ٥٥</div>
<div style="position:relative;margin-top:-2px;font-family:Baloo;font-weight:800;font-size:20px;line-height:1.1;letter-spacing:1px;color:{GREEN}">UAE NATIONAL DAY</div>
<div style="position:relative;margin-top:6px">{stripe(120)}</div>
<div style="position:relative;flex-grow:1"></div>
<div style="position:relative;font-family:Lalezar;font-size:19px;line-height:1.2;color:{BLACK}">روح الاتحاد · Spirit of the Union</div>
<div style="position:relative;margin-top:10px">{fromline(name, gender, 12)}</div>
<div style="position:relative;margin-top:7px;margin-bottom:20px">{contact(11, 12)}</div>'''
    return wrap(W, H, inner)

# ---------- keychain header card: 70 x 100 mm with punch hole ----------
def keychain(name, gender):
    W, H = 265, 378
    inner = f'''
<svg width="{W}" height="{H}" viewBox="0 0 {W} {H}" style="position:absolute;left:0;top:0" fill="none">
<rect x="8" y="8" width="{W-16}" height="{H-16}" rx="9" stroke="{GREY}" stroke-width="1" stroke-dasharray="5 4"/>
<circle cx="{W/2}" cy="24" r="8" fill="#ffffff" stroke="{BLACK}" stroke-width="1.5"/>
<g stroke="{GREEN}" stroke-width="1.3" stroke-linecap="round"><path d="M28 70 l0 8 M24 74 l8 0"/><path d="M236 58 l0 8 M232 62 l8 0"/></g>
<g stroke="{RED}" stroke-width="1.3" stroke-linecap="round"><path d="M34 290 l0 8 M30 294 l8 0"/><path d="M232 262 l0 8 M228 266 l8 0"/></g>
</svg>
<div style="position:relative;margin-top:42px">{flag(44, 22)}</div>
<div style="position:relative;margin-top:4px;font-family:Lalezar;font-size:26px;line-height:1.1;color:{RED}">اليوم الوطني ٥٥</div>
<div style="position:relative;margin-top:-2px;font-family:Baloo;font-weight:800;font-size:15px;line-height:1.1;letter-spacing:1px;color:{GREEN}">UAE NATIONAL DAY</div>
<div style="position:relative;margin-top:5px">{stripe(90)}</div>
<div style="position:relative;flex-grow:1"></div>
<div style="position:relative;font-family:Lalezar;font-size:14px;line-height:1.2;color:{BLACK}">روح الاتحاد · Spirit of the Union</div>
<div style="position:relative;margin-top:7px">{fromline(name, gender, 10.5)}</div>
<div style="position:relative;margin-top:5px;margin-bottom:14px">{contact(9.5, 10)}</div>'''
    return wrap(W, H, inner)

out = pathlib.Path(sys.argv[1] if len(sys.argv)>1 and sys.argv[1].startswith('/') else 'out').resolve(); out.mkdir(exist_ok=True)
proj = pathlib.Path('project').resolve()
kids = [('شوق الرواحي', 'f', 'شوق'), ('سالم المزروعي', 'm', 'سالم'), ('محمد حارب الشامسي', 'm', 'محمد')]
sel = sys.argv[1:] or [k[2] for k in kids]
for name, g, short in kids:
    if short not in sel: continue
    for kind, fn in (('بادج', backer), ('ميدالية', keychain)):
        src = proj / f'{kind}-{short}.dc.html'
        src.write_text(fn(name, g), encoding='utf-8')
        export(src, out / f'قص-اليوم-الوطني-{kind}-{short}.png')
