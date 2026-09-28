#!/usr/bin/env python3
"""Generate a 4-up A4 sheet of Arabic letter cards (10 x 14.8 cm each).

Example:
  python3 cards/make_card.py --letter د --word "دُبّ" --name "سالم المزروعي" --gender m
  python3 cards/make_card.py --letter ب --word "بَقَرَة" --name "شوق الرواحي" --gender f --drawing cow

Outputs <out>.pdf (exact A4) and <out>.jpg (A4, 300 dpi) next to this script.
Needs: pip install playwright pillow  (Chromium from /opt/pw-browsers or `playwright install chromium`).
"""
import argparse, glob, pathlib

HERE = pathlib.Path(__file__).resolve().parent


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--letter', required=True)
    p.add_argument('--word', required=True, help='word with harakat, e.g. دُبّ')
    p.add_argument('--name', required=True)
    p.add_argument('--gender', choices=['m', 'f'], default='f',
                   help='f -> من صديقتكم, m -> من صديقكم')
    p.add_argument('--vowels', help='override vowel row; default: letter + fatha/damma/kasra')
    p.add_argument('--drawing', default='empty',
                   help='name of an SVG in cards/drawings/ (default: empty = grass only, space for a 3D model)')
    p.add_argument('--out', help='output basename (default: card-<letter>-<name>)')
    a = p.parse_args()

    vowels = a.vowels.split() if a.vowels else [a.letter + m for m in ('َ', 'ُ', 'ِ')]
    html = (HERE / 'template.html').read_text(encoding='utf-8')
    html = (html.replace('{{LETTER}}', a.letter)
                .replace('{{VOWELS}}', ''.join(f'<span>{v}</span>' for v in vowels))
                .replace('{{DRAWING}}', (HERE / 'drawings' / f'{a.drawing}.svg').read_text(encoding='utf-8'))
                .replace('{{WORD}}', a.word)
                .replace('{{FROM}}', 'من صديقكم' if a.gender == 'm' else 'من صديقتكم')
                .replace('{{NAME}}', a.name))

    out = HERE / (a.out or f'card-{a.letter}-{a.name.replace(" ", "_")}')
    tmp = HERE / '_render.html'
    tmp.write_text(html, encoding='utf-8')

    from playwright.sync_api import sync_playwright
    from PIL import Image
    exe = glob.glob('/opt/pw-browsers/chromium*/chrome-linux*/chrome')
    with sync_playwright() as pw:
        b = pw.chromium.launch(executable_path=exe[0]) if exe else pw.chromium.launch()
        pg = b.new_page(viewport={'width': 794, 'height': 1123}, device_scale_factor=3.125)
        pg.goto(tmp.as_uri())
        pg.wait_for_timeout(500)
        pg.pdf(path=f'{out}.pdf', format='A4', print_background=True)
        pg.screenshot(path=f'{out}.png')
        b.close()
    Image.open(f'{out}.png').convert('RGB').save(f'{out}.jpg', quality=95, dpi=(300, 300))
    pathlib.Path(f'{out}.png').unlink()
    tmp.unlink()
    print(f'{out}.pdf\n{out}.jpg')


if __name__ == '__main__':
    main()
