# عرض تنفيذي: تطور شبكات الاتصالات المتنقلة من 2G إلى 6G

- `GSM_Evolution_2G_to_6G.pptx` — العرض الجاهز (18 شريحة، عربي، اتجاه من اليمين لليسار، مقاس 16:9).
- `build_gsm_evolution_deck.js` — سكربت توليد العرض (Node.js) لإعادة البناء أو التعديل.

## إعادة البناء

```bash
npm install pptxgenjs sharp react react-dom react-icons
node presentations/build_gsm_evolution_deck.js presentations/GSM_Evolution_2G_to_6G.pptx
```

ملاحظة: الرسوم المتجهة داخل السكربت تستخدم خط Noto Naskh Arabic عند التحويل إلى صور؛ ثبّته على النظام قبل إعادة البناء.
