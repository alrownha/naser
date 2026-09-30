# Arabic letter cards — reference design

This is the approved reference for all future letter cards. Match it unless the user asks otherwise.

## Spec
- **Sheet:** one A4 page (21 × 29.7 cm) with **4 cards** (2 × 2), all upright, with grey dashed cut lines between them.
- **Card:** 10 × 14.8 cm (the largest size that fits 4 on A4). White background, orange dashed frame with **sharp (square) corners**.
- **Top to bottom on each card:**
  1. The letter inside an outlined green circle (Lalezar font).
  2. A row with the letter and its three short vowels, e.g. `دَ دُ دِ` (Noto Naskh, green).
  3. The middle is **empty** with a grass line, so a 3D-printed model can be glued on. For sea animals (dolphin, fish, whale…) use `--drawing sea` so the base is blue waves instead of grass. Use `--drawing cow|bear` only when a drawing is asked for.
  4. The word with full harakat, e.g. `دُبّ`, `بَقَرَة` (Noto Naskh, red).
  5. `من صديقتكم ♥ <name>` for a girl, or `من صديقكم ♥ <name>` for a boy.
  6. One line: Instagram logo + `s.3d.ae`, then WhatsApp logo + `+971 50 914 7566`.
- **Ink-saving (always):** the cards are printed at home on white paper. Keep a white background with no large solid color areas: use outlines, thin strokes and small color accents instead of filled shapes. No dark or fully colored backgrounds.
- **Delivery:** send **PNG only**: one card per file for Cricut Print Then Cut. Solid white background, cropped 1 mm outside the dotted frame (about 9.28 × 14.06 cm at 300 dpi), so the Cricut cuts one clean rectangle around the frame. No PDF or A4 sheet unless asked.

## Usage
```sh
pip install playwright pillow
python3 cards/make_card.py --letter د --word "دُبّ" --name "سالم المزروعي" --gender m
python3 cards/make_card.py --letter ب --word "بَقَرَة" --name "شوق الرواحي" --gender f
```
