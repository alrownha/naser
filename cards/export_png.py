#!/usr/bin/env python3
"""Export a Design-canvas artboard (.dc.html) as a Cricut-ready PNG.

The card stays solid white inside; everything outside its boundary is
transparent, and the boundary sits ~1 mm outside the drawn frame so the
cut never clips the frame line. 300 dpi.

  python3 cards/export_png.py project/Main.dc.html out.png
"""
import glob, pathlib, re, sys
from playwright.sync_api import sync_playwright
from PIL import Image

F = pathlib.Path(__file__).resolve().parent / 'fonts'
FONTS = f'''
@font-face{{font-family:Lalezar;src:url({F}/lalezar-latin.woff2)}}
@font-face{{font-family:Lalezar;src:url({F}/lalezar.ttf);unicode-range:U+0600-06FF,U+FB50-FDFF,U+FE70-FEFF}}
@font-face{{font-family:'Baloo Bhaijaan 2';font-weight:700 800;src:url({F}/baloo-latin.woff2)}}
@font-face{{font-family:'Baloo Bhaijaan 2';font-weight:700 800;src:url({F}/baloo-arabic.woff2);unicode-range:U+0600-06FF,U+FB50-FDFF,U+FE70-FEFF}}
@font-face{{font-family:Tajawal;font-weight:500 700;src:url({F}/tajawal.ttf)}}
@font-face{{font-family:Naskh;src:url({F}/naskh.ttf)}}
'''
PAD = 4  # CSS px ≈ 1 mm of white outside the drawn frame


def standalone(dc_html: str) -> str:
    body = re.search(r'<x-dc>(.*?)</x-dc>', dc_html, re.S).group(1)
    body = re.sub(r'<helmet>.*?</helmet>', '', body, flags=re.S)
    root = re.search(r'<div style="([^"]*)"', body).group(1)
    radius = re.search(r'border-radius:\s*([^;]+)', root)
    rad = radius.group(1).strip() if radius else '0px'
    outer_rad = '50%' if rad == '50%' else f'calc({rad} + {PAD}px)'
    lang = re.search(r'<html lang="(\w+)"', dc_html).group(1)
    return f'''<!doctype html><html lang="{lang}"><head><meta charset="utf-8"><style>{FONTS}
html,body{{margin:0;background:transparent}}
#wrap{{display:inline-block;padding:{PAD}px;background:#fff;border-radius:{outer_rad}}}
</style></head><body><div id="wrap">{body}</div></body></html>'''


def export(src, dst):
    html = standalone(pathlib.Path(src).read_text(encoding='utf-8'))
    tmp = pathlib.Path(dst).with_suffix('.tmp.html')
    tmp.write_text(html, encoding='utf-8')
    with sync_playwright() as pw:
        exe = glob.glob('/opt/pw-browsers/chromium*/chrome-linux*/chrome')
        b = pw.chromium.launch(executable_path=exe[0]) if exe else pw.chromium.launch()
        pg = b.new_page(viewport={'width': 1200, 'height': 1200}, device_scale_factor=3.125)
        pg.goto(tmp.as_uri()); pg.wait_for_timeout(600)
        pg.locator('#wrap').screenshot(path=dst, omit_background=True)
        b.close()
    tmp.unlink()
    im = Image.open(dst).convert('RGBA')
    im = im.crop(im.getbbox()); im.save(dst, dpi=(300, 300))
    print(dst, im.size, '%.2f x %.2f cm' % (im.width / 1181 * 10, im.height / 1181 * 10))


if __name__ == '__main__':
    export(sys.argv[1], sys.argv[2])
