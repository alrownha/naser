// توليد عرض تنفيذي: تطور شبكات الاتصالات المتنقلة من 2G إلى 6G
const pptxgen = require("pptxgenjs");
const sharp = require("sharp");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const Fa = require("react-icons/fa");
const Md = require("react-icons/md");
const path = require("path");

const OUT = process.argv[2] || "GSM_Evolution_2G_to_6G.pptx";

// ---------- الألوان ----------
const C = {
  navy: "0B1F3A",
  navy2: "13294B",
  bg: "FFFFFF",
  panel: "F3F6FB",
  text: "12233F",
  muted: "5B6B84",
  line: "D6DEEA",
  white: "FFFFFF",
  cyan: "00C2FF",
  g2: "8A94A6",
  g3: "3E7CB1",
  g4: "1FB8A6",
  g5: "00A3E0",
  g5a: "7C5CFF",
  g6: "FF6B4A",
};
const GEN = [
  { code: "2G", color: C.g2 },
  { code: "3G", color: C.g3 },
  { code: "4G", color: C.g4 },
  { code: "5G", color: C.g5 },
  { code: "5G-A", color: C.g5a },
  { code: "6G", color: C.g6 },
];
const FONT = "Arial";

// ---------- أدوات ----------
async function iconPng(Icon, color, px = 256) {
  const svg = ReactDOMServer.renderToStaticMarkup(
    React.createElement(Icon, { color: "#" + color, size: px })
  );
  const buf = await sharp(Buffer.from(svg)).resize(px, px).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}
async function svgPng(svg, width) {
  const buf = await sharp(Buffer.from(svg), { density: 200 }).resize({ width }).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}
function tint(hex, f = 0.12) {
  // مزج اللون مع الأبيض
  const r = parseInt(hex.slice(0, 2), 16), g = parseInt(hex.slice(2, 4), 16), b = parseInt(hex.slice(4, 6), 16);
  const m = (v) => Math.round(v + (255 - v) * (1 - f)).toString(16).padStart(2, "0");
  return (m(r) + m(g) + m(b)).toUpperCase();
}

// لفّ "رقم + وحدة" داخل تضمين LTR حتى لا تنعكس داخل الفقرات العربية
const UNIT = "(?:kbps|Mbps|Gbps|Tbps|kHz|MHz|GHz|THz|ms|bps\\/Hz|T\\d+R)";
const NUM = "\\d[\\d.,]*(?:\\s?[–\\-\\/]\\s?\\d[\\d.,]*)*";
const BIDI_RE = new RegExp("(" + NUM + "\\s?" + UNIT + ")(?![A-Za-z])", "g");
const hasArabic = (t) => /[\u0600-\u06FF]/.test(t);
function fixBidi(t) {
  if (typeof t !== "string" || !hasArabic(t)) return t;
  return t.replace(BIDI_RE, "\u202A$1\u202C");
}
function fixRows(rows) {
  return rows.map((r) => r.map((c) => {
    if (typeof c === "string") return fixBidi(c);
    if (c && c.options && c.options.rtlMode === false) return c;
    return Object.assign({}, c, { text: fixBidi(c.text) });
  }));
}

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
pres.rtlMode = true;
pres.lang = "ar-SA";
pres.author = "الإدارة التنفيذية";
pres.title = "تطور شبكات الاتصالات المتنقلة من 2G إلى 6G";

function T(slide, text, o = {}) {
  const base = {
    fontFace: FONT,
    color: C.text,
    fontSize: 14,
    align: "right",
    valign: "top",
    rtlMode: true,
    lang: "ar-SA",
    isTextBox: true,
    margin: 0,
    fit: "shrink",
  };
  const opts = Object.assign(base, o);
  if (typeof text === "string" && !hasArabic(text) && o.rtlMode === undefined) opts.rtlMode = false;
  slide.addText(opts.rtlMode === false ? text : fixBidi(text), opts);
}
function rect(slide, x, y, w, h, fill, o = {}) {
  slide.addShape(pres.ShapeType.roundRect, Object.assign({ x, y, w, h, fill: { color: fill }, line: { color: fill, width: 0 }, rectRadius: 0.12 }, o));
}
function circle(slide, x, y, d, fill, o = {}) {
  slide.addShape(pres.ShapeType.ellipse, Object.assign({ x, y, w: d, h: d, fill: { color: fill }, line: { color: fill, width: 0 } }, o));
}
function slideTitle(slide, title, sub, dark = false) {
  T(slide, title, { x: 0.6, y: 0.4, w: 12.13, h: 0.7, fontSize: title.length > 48 ? 25 : 30, bold: true, color: dark ? C.white : C.navy });
  if (sub) T(slide, sub, { x: 0.6, y: 1.08, w: 12.13, h: 0.4, fontSize: 14, color: dark ? "BFD3F2" : C.muted });
}
function footer(slide, n, dark = false) {
  T(slide, "تطور شبكات الاتصالات المتنقلة | عرض تنفيذي", { x: 0.6, y: 7.05, w: 6, h: 0.3, fontSize: 9, color: dark ? "8FA5C6" : "9AA8BC", align: "left" });
  T(slide, String(n), { x: 12.2, y: 7.05, w: 0.53, h: 0.3, fontSize: 9, color: dark ? "8FA5C6" : "9AA8BC", align: "right" });
}
function badge(slide, code, color, x, y, d = 1.0, fs = 22) {
  circle(slide, x, y, d, color);
  T(slide, code, { x, y, w: d, h: d, fontSize: fs, bold: true, color: C.white, align: "center", valign: "middle", rtlMode: false });
}

// ---------- SVG: برج اتصالات للغلاف ----------
function towerSvg() {
  const arcs = [1, 2, 3, 4].map((i) => `<path d="M ${300 - i * 70} ${210 - i * 20} A ${i * 80} ${i * 80} 0 0 1 ${300 + i * 70} ${210 - i * 20}" fill="none" stroke="#00C2FF" stroke-width="10" stroke-linecap="round" opacity="${1 - i * 0.18}"/>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="900" viewBox="0 0 600 900">
  ${arcs}
  <circle cx="300" cy="230" r="18" fill="#00C2FF"/>
  <rect x="292" y="230" width="16" height="120" fill="#CADCFC"/>
  <polygon points="300,330 130,880 470,880" fill="none" stroke="#CADCFC" stroke-width="12" stroke-linejoin="round"/>
  <g stroke="#CADCFC" stroke-width="7" fill="none">
    <line x1="255" y1="470" x2="345" y2="470"/><line x1="230" y1="560" x2="370" y2="560"/><line x1="205" y1="650" x2="395" y2="650"/><line x1="180" y1="740" x2="420" y2="740"/><line x1="155" y1="830" x2="445" y2="830"/>
    <line x1="255" y1="470" x2="370" y2="560"/><line x1="345" y1="470" x2="230" y2="560"/>
    <line x1="230" y1="560" x2="395" y2="650"/><line x1="370" y1="560" x2="205" y2="650"/>
    <line x1="205" y1="650" x2="420" y2="740"/><line x1="395" y1="650" x2="180" y2="740"/>
    <line x1="180" y1="740" x2="445" y2="830"/><line x1="420" y1="740" x2="155" y2="830"/>
  </g>
  <rect x="330" y="380" width="70" height="26" rx="6" fill="#1FB8A6"/><rect x="200" y="380" width="70" height="26" rx="6" fill="#1FB8A6"/>
  <rect x="120" y="880" width="360" height="14" rx="7" fill="#CADCFC"/>
</svg>`;
}

// ---------- SVG: خريطة الطيف ----------
function spectrumSvg() {
  const W = 2700, H = 1180, left = 120, right = 2160, top = 120, rowH = 140;
  const minL = Math.log10(0.3), maxL = Math.log10(1000);
  const X = (ghz) => left + ((Math.log10(ghz) - minL) / (maxL - minL)) * (right - left);
  const rows = [
    { code: "2G", name: "الجيل الثاني GSM", color: "#8A94A6", bands: [[0.85, 0.96, "850/900 MHz"], [1.71, 1.99, "1800/1900"]] },
    { code: "3G", name: "الجيل الثالث UMTS", color: "#3E7CB1", bands: [[0.85, 0.96, "850/900 MHz"], [1.85, 2.17, "1900/2100"]] },
    { code: "4G", name: "الجيل الرابع LTE", color: "#1FB8A6", bands: [[0.7, 0.96, "700-900 MHz"], [1.7, 2.7, "1.7-2.7 GHz"], [3.4, 3.8, "3.5 GHz"]] },
    { code: "5G", name: "الجيل الخامس NR", color: "#00A3E0", bands: [[0.41, 7.125, "FR1: 410 MHz - 7.125 GHz"], [24.25, 71, "FR2 mmWave: 24-71 GHz"]] },
    { code: "5G-A", name: "الجيل الخامس المتقدم", color: "#7C5CFF", bands: [[0.41, 7.125, "FR1 + Upper 6 GHz (6.4-7.1)"], [24.25, 71, "FR2 + NTN"]] },
    { code: "6G", name: "الجيل السادس IMT-2030", color: "#FF6B4A", bands: [[7.125, 24.25, "FR3: 7-24 GHz"], [100, 300, "Sub-THz: 100-300 GHz"]], dashed: [[0.41, 7.125, "إعادة استخدام الطيف الحالي"]] },
  ];
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Noto Naskh Arabic, Arial">
  <rect width="${W}" height="${H}" fill="#FFFFFF"/>`;
  const ticks = [0.5, 1, 2, 5, 10, 20, 50, 100, 300, 1000];
  ticks.forEach((t) => {
    const x = X(t);
    s += `<line x1="${x}" y1="${top - 20}" x2="${x}" y2="${top + rows.length * rowH}" stroke="#E3E9F2" stroke-width="3"/>`;
    s += `<text x="${x}" y="${top + rows.length * rowH + 50}" font-size="34" fill="#5B6B84" text-anchor="middle">${t >= 1 ? t + " GHz" : t * 1000 + " MHz"}</text>`;
  });
  // مناطق ملونة خفيفة: sub-6 / mmWave / sub-THz
  const zones = [[0.3, 7.125, "دون 7 غيغاهرتز (التغطية)", "#F4F7FB"], [7.125, 24.25, "FR3", "#FBF7FF"], [24.25, 100, "الموجات المليمترية (السعة)", "#F0FBFF"], [100, 1000, "دون التيراهرتز", "#FFF4F1"]];
  zones.forEach(([a, b, name, col]) => {
    s += `<rect x="${X(a)}" y="${top - 100}" width="${X(b) - X(a)}" height="70" fill="${col}" rx="10"/>`;
    s += `<text x="${(X(a) + X(b)) / 2}" y="${top - 52}" font-size="30" fill="#12233F" text-anchor="middle">${name}</text>`;
  });
  rows.forEach((r, i) => {
    const y = top + i * rowH;
    s += `<rect x="${left}" y="${y}" width="${right - left}" height="${rowH}" fill="${i % 2 ? "#FFFFFF" : "#FAFBFD"}"/>`;
    s += `<circle cx="${right + 110}" cy="${y + rowH / 2}" r="46" fill="${r.color}"/>`;
    s += `<text x="${right + 110}" y="${y + rowH / 2 + 14}" font-size="${r.code.length > 2 ? 30 : 38}" font-weight="bold" fill="#fff" text-anchor="middle" font-family="Arial">${r.code}</text>`;
    s += `<text x="${W - 20}" y="${y + rowH / 2 + 14}" font-size="34" fill="#12233F" direction="rtl" text-anchor="start">${r.name}</text>`;
    (r.dashed || []).forEach(([a, b, lbl]) => {
      s += `<rect x="${X(a)}" y="${y + 40}" width="${X(b) - X(a)}" height="60" rx="14" fill="none" stroke="${r.color}" stroke-width="5" stroke-dasharray="18 12"/>`;
      s += `<text x="${(X(a) + X(b)) / 2}" y="${y + 80}" font-size="28" fill="${r.color}" text-anchor="middle">${lbl}</text>`;
    });
    r.bands.forEach(([a, b, lbl], k) => {
      const x = X(a), w = Math.max(X(b) - X(a), 26);
      s += `<rect x="${x}" y="${y + 40}" width="${w}" height="60" rx="14" fill="${r.color}"/>`;
      const inside = w > 420;
      const ly = inside ? y + 80 : k % 2 ? y + 128 : y + 30;
      s += `<text x="${x + w / 2}" y="${ly}" font-size="${inside ? 28 : 25}" fill="${inside ? "#fff" : "#12233F"}" text-anchor="middle">${lbl}</text>`;
    });
  });
  s += `<text x="${(left + right) / 2}" y="${H - 30}" font-size="30" fill="#5B6B84" text-anchor="middle">التردد (مقياس لوغاريتمي)</text>`;
  s += `</svg>`;
  return s;
}

// ---------- SVG: مثلث حالات استخدام 5G ----------
function triangleSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1000" viewBox="0 0 1200 1000" font-family="Noto Naskh Arabic, Arial">
  <polygon points="600,120 100,860 1100,860" fill="#EAF7FF" stroke="#00A3E0" stroke-width="8" stroke-linejoin="round"/>
  <circle cx="600" cy="120" r="70" fill="#00A3E0"/><text x="600" y="135" font-size="40" font-weight="bold" fill="#fff" text-anchor="middle" font-family="Arial">eMBB</text>
  <circle cx="100" cy="860" r="70" fill="#7C5CFF"/><text x="100" y="875" font-size="36" font-weight="bold" fill="#fff" text-anchor="middle" font-family="Arial">URLLC</text>
  <circle cx="1100" cy="860" r="70" fill="#1FB8A6"/><text x="1100" y="875" font-size="36" font-weight="bold" fill="#fff" text-anchor="middle" font-family="Arial">mMTC</text>
  <text x="600" y="400" font-size="36" fill="#12233F" text-anchor="middle">النطاق العريض المحسّن</text>
  <text x="600" y="452" font-size="28" fill="#5B6B84" text-anchor="middle" direction="rtl">${fixBidi("ذروة 20 Gbps | للمستخدم 100 Mbps")}</text>
  <text x="300" y="690" font-size="36" fill="#12233F" text-anchor="middle">اتصال فائق الموثوقية</text>
  <text x="300" y="742" font-size="30" fill="#5B6B84" text-anchor="middle">1 ms | 99.999%</text>
  <text x="900" y="690" font-size="36" fill="#12233F" text-anchor="middle">اتصالات الآلات الضخمة</text>
  <text x="900" y="742" font-size="30" fill="#5B6B84" text-anchor="middle">مليون جهاز / كم²</text>
  <text x="600" y="560" font-size="44" font-weight="bold" fill="#00A3E0" text-anchor="middle">5G NR</text>
  <text x="600" y="612" font-size="30" fill="#5B6B84" text-anchor="middle">تقطيع الشبكة | الحوسبة الطرفية</text>
</svg>`;
}

// ---------- بيانات الأجيال ----------
const GENS = [
  {
    code: "2G", color: C.g2, year: "1991",
    title: "الجيل الثاني (2G): GSM — بداية الاتصالات الرقمية",
    sub: "الإطلاق التجاري الأول: فنلندا 1991 | المعيار: GSM / GPRS (2.5G) / EDGE (2.75G)",
    stats: [
      { l: "سرعة نقل البيانات", v: "9.6 kbps", s: "GPRS حتى 171 kbps | EDGE حتى 384 kbps" },
      { l: "المستخدمون", v: "8 لكل حامل", s: "TDMA: 8 فتحات زمنية لكل قناة 200 kHz | مئات المستخدمين لكل خلية" },
      { l: "نطاق التردد", v: "900 / 1800 MHz", s: "وفي الأمريكتين: 850 / 1900 MHz" },
      { l: "عرض القناة", v: "200 kHz", s: "تعديل GMSK | تبديل الدوائر (Circuit Switched)" },
    ],
    enabled: [
      [Fa.FaPhoneAlt, "صوت رقمي مشفّر بجودة ثابتة وتجوال دولي عبر بطاقة SIM"],
      [Fa.FaSms, "الرسائل النصية القصيرة SMS — أول خدمة بيانات جماهيرية"],
      [Fa.FaGlobe, "أول اتصال بالإنترنت عبر الجوال (WAP) مع GPRS"],
      [Fa.FaUsers, "اعتماد عالمي: أكثر من 80% من اشتراكات العالم في ذروته"],
    ],
    chips: ["TDMA / FDMA", "GMSK", "MSC / BSC / BTS", "SIM", "GPRS", "EDGE"],
    takeaway: "نقطة تنفيذية: 2G وضع أسس التشغيل البيني العالمي والتجوال، ويجري إيقافه تدريجياً في معظم الأسواق لإعادة استخدام طيفه الثمين.",
  },
  {
    code: "3G", color: C.g3, year: "2001",
    title: "الجيل الثالث (3G): UMTS — الإنترنت المتنقل",
    sub: "الإطلاق التجاري الأول: اليابان 2001 | المعيار: UMTS / WCDMA ثم HSPA (3.5G) و HSPA+",
    stats: [
      { l: "سرعة نقل البيانات", v: "384 kbps", s: "HSPA حتى 14.4 Mbps | HSPA+ حتى 42 Mbps (84 Mbps مع DC)" },
      { l: "المستخدمون", v: "≈ 100–200", s: "مستخدم صوتي متزامن لكل حامل 5 MHz | زمن استجابة 100–200 ms" },
      { l: "نطاق التردد", v: "2100 MHz", s: "النطاق الرئيسي (Band I) | إضافة 900 / 850 / 1900 MHz" },
      { l: "عرض القناة", v: "5 MHz", s: "WCDMA بالطيف المنتشر | تبديل الدوائر والحزم معاً" },
    ],
    enabled: [
      [Fa.FaVideo, "مكالمات الفيديو وتصفح الإنترنت الفعلي على الجوال"],
      [Fa.FaMobileAlt, "ولادة الهواتف الذكية ومتاجر التطبيقات (2007–2008)"],
      [Fa.FaMapMarkedAlt, "خدمات الموقع والخرائط والبث الصوتي"],
      [Fa.FaEnvelopeOpenText, "البريد الإلكتروني المتنقل والوسائط المتعددة MMS"],
    ],
    chips: ["WCDMA / CDMA", "HSDPA / HSUPA", "NodeB / RNC", "SGSN / GGSN", "64-QAM", "MIMO 2x2"],
    takeaway: "نقطة تنفيذية: 3G حوّل الشبكة من صوت إلى بيانات، لكن كفاءته الطيفية المحدودة جعلته أول جيل يُطفأ قبل 2G في عدة أسواق.",
  },
  {
    code: "4G", color: C.g4, year: "2009",
    title: "الجيل الرابع (4G): LTE — عصر النطاق العريض المتنقل",
    sub: "الإطلاق التجاري الأول: السويد والنرويج 2009 | المعيار: LTE (Rel-8) ثم LTE-Advanced و LTE-Advanced Pro",
    stats: [
      { l: "سرعة نقل البيانات", v: "100 Mbps", s: "LTE-A حتى 1 Gbps | LTE-A Pro حتى 3 Gbps | رفع 50–500 Mbps" },
      { l: "كثافة المستخدمين", v: "≈ 100 ألف / كم²", s: "مئات المستخدمين النشطين لكل خلية | زمن استجابة 30–50 ms" },
      { l: "نطاق التردد", v: "700–2600 MHz", s: "نطاقات FDD/TDD متعددة + 3.5 GHz (B42/43) | 450 MHz–5.9 GHz إجمالاً" },
      { l: "عرض القناة", v: "1.4–20 MHz", s: "تجميع الحوامل (CA) حتى 100 MHz | شبكة IP بالكامل" },
    ],
    enabled: [
      [Fa.FaPlayCircle, "بث الفيديو عالي الدقة والتطبيقات السحابية على الجوال"],
      [Fa.FaCarSide, "اقتصاد التطبيقات: النقل الذكي والتوصيل والمدفوعات"],
      [Fa.FaPhoneVolume, "الصوت عبر LTE (VoLTE) بجودة HD وشبكة IP موحدة"],
      [Fa.FaWifi, "إنترنت الأشياء منخفض الطاقة: NB-IoT و LTE-M"],
    ],
    chips: ["OFDMA / SC-FDMA", "MIMO 4x4 / 8x8", "eNodeB", "EPC (نواة IP)", "256-QAM", "Carrier Aggregation"],
    takeaway: "نقطة تنفيذية: 4G هو العمود الفقري الحالي للإيرادات عالمياً، وسيستمر لعقد آخر على الأقل كطبقة تغطية أساسية جنباً إلى جنب مع 5G.",
  },
  {
    code: "5G", color: C.g5, year: "2019",
    title: "الجيل الخامس (5G): NR — منصة الصناعة والمجتمع الرقمي",
    sub: "الإطلاق التجاري: كوريا الجنوبية والولايات المتحدة 2019 | المعيار: 5G NR (Rel-15/16/17) | متطلبات ITU IMT-2020",
    stats: [
      { l: "سرعة نقل البيانات", v: "20 Gbps", s: "ذروة التنزيل | 10 Gbps رفع | 100 Mbps سرعة مضمونة للمستخدم" },
      { l: "كثافة المستخدمين", v: "1 مليون / كم²", s: "زمن استجابة 1 ms (URLLC) | حركية حتى 500 كم/س" },
      { l: "نطاق التردد", v: "FR1 + FR2", s: "FR1: 410 MHz–7.125 GHz (n78: 3.5 GHz) | FR2: 24.25–71 GHz" },
      { l: "عرض القناة", v: "100 / 400 MHz", s: "100 MHz لكل حامل في FR1 | 400 MHz في الموجات المليمترية" },
    ],
    enabled: [
      [Fa.FaIndustry, "المصانع الذكية والشبكات الخاصة والأتمتة الصناعية"],
      [Fa.FaHome, "النطاق العريض الثابت اللاسلكي (FWA) كبديل للألياف"],
      [Fa.FaHeartbeat, "الرعاية الصحية عن بُعد والمركبات المتصلة (V2X)"],
      [Fa.FaLayerGroup, "تقطيع الشبكة (Network Slicing) والحوسبة الطرفية MEC"],
    ],
    chips: ["CP-OFDM", "Massive MIMO 64T64R", "Beamforming", "gNodeB", "5GC (SBA)", "SA / NSA", "Network Slicing"],
    takeaway: "نقطة تنفيذية: قيمة 5G الحقيقية في وضع Standalone وخدمات الأعمال (B2B)، لا في سرعة المستهلك فقط.",
  },
  {
    code: "5G-A", color: C.g5a, year: "2024",
    title: "الجيل الخامس المتقدم (5G-Advanced): الجسر نحو 6G",
    sub: "المعيار: 3GPP Release 18 (تجميد 2024) و Release 19 (2025) | أول نشر تجاري 2024–2025",
    stats: [
      { l: "سرعة نقل البيانات", v: "10 Gbps", s: "للمستخدم (تجريبي) | رفع حتى 1 Gbps أي أضعاف 5G | كفاءة طيفية +30%" },
      { l: "كثافة المستخدمين", v: "≈ 10× السعة", s: "لكل خلية عبر ELAA-MM | تحديد الموقع بدقة سنتيمترية" },
      { l: "نطاق التردد", v: "6.4–7.1 GHz", s: "النطاق العلوي من 6 GHz (قرار WRC-23) إضافة إلى FR1/FR2 | توسيع mmWave | الأقمار NTN" },
      { l: "الطاقة والذكاء", v: "AI/ML أصيل", s: "توفير طاقة حتى 30% | حالات استخدام XR و RedCap للأجهزة الخفيفة" },
    ],
    enabled: [
      [Fa.FaVrCardboard, "الواقع الممتد XR والوسائط الغامرة بزمن استجابة منخفض"],
      [Fa.FaSatellite, "التكامل مع الأقمار الصناعية (NTN) لتغطية شاملة"],
      [Fa.FaBrain, "الذكاء الاصطناعي في واجهة الراديو وإدارة الشبكة"],
      [Fa.FaMicrochip, "RedCap: أجهزة إنترنت أشياء أرخص وأقل استهلاكاً"],
    ],
    chips: ["Release 18/19", "AI/ML Air Interface", "RedCap / eRedCap", "NTN", "Passive IoT", "ISAC (بدايات)", "Network Energy Saving"],
    takeaway: "نقطة تنفيذية: 5G-Advanced ترقية برمجية إلى حد كبير على بنية 5G SA؛ فرصة لرفع الإيرادات دون استثمار رأسمالي ضخم.",
  },
  {
    code: "6G", color: C.g6, year: "2030",
    title: "الجيل السادس (6G): IMT-2030 — الشبكة الذكية الحسّاسة",
    sub: "إطار ITU-R IMT-2030 (2023) | المعيار 3GPP Release 20/21 (2027–2029) | الإطلاق التجاري المتوقع حوالي 2030",
    stats: [
      { l: "سرعة نقل البيانات", v: "1 Tbps", s: "ذروة مستهدفة (50× 5G) | 1 Gbps سرعة للمستخدم | زمن استجابة 0.1 ms" },
      { l: "كثافة المستخدمين", v: "10 مليون / كم²", s: "10× كثافة 5G | موثوقية 99.99999% | حركية حتى 1000 كم/س" },
      { l: "نطاق التردد", v: "7–24 GHz + THz", s: "FR3 السنتيمتري (7.125–24.25 GHz) | دون التيراهرتز 100–300 GHz" },
      { l: "قدرات جديدة", v: "اتصال + استشعار", s: "ISAC | ذكاء اصطناعي أصيل | كفاءة طاقة 100× | تغطية أرضية-فضائية موحدة" },
    ],
    enabled: [
      [Fa.FaRobot, "الروبوتات التعاونية والتوائم الرقمية بزمن حقيقي"],
      [Md.MdSensors, "الشبكة كمستشعر: كشف الحركة والبيئة دون أجهزة إضافية"],
      [Fa.FaCube, "الاتصالات الهولوغرافية والإنترنت اللمسي"],
      [Fa.FaLeaf, "الاستدامة: هدف صافي صفري للطاقة لكل بت"],
    ],
    chips: ["Sub-THz", "RIS (أسطح ذكية)", "AI-Native RAN", "ISAC", "Cell-free Massive MIMO", "Semantic Comms", "NTN موحدة"],
    takeaway: "نقطة تنفيذية: 6G لن يستبدل 5G بل يبنى فوقه؛ القرار الحالي هو تأمين الطيف (FR3) وتحديث النواة إلى سحابة أصيلة استعداداً له.",
  },
];

// ---------- بناء الشرائح ----------
(async () => {
  const N = { n: 0 };
  const next = () => ++N.n;

  // ===== 1. الغلاف =====
  {
    const s = pres.addSlide();
    s.background = { color: C.navy };
    s.addImage({ data: await svgPng(towerSvg(), 900), x: 0.7, y: 0.6, w: 4.2, h: 6.3 });
    T(s, "رحلة تطور شبكات الاتصالات المتنقلة", { x: 5.3, y: 1.7, w: 7.4, h: 1.2, fontSize: 40, bold: true, color: C.white });
    T(s, "من GSM (الجيل الثاني) إلى الجيل الخامس المتقدم والجيل السادس", { x: 5.3, y: 2.95, w: 7.4, h: 0.6, fontSize: 22, color: "BFD3F2" });
    // شريط الأجيال
    let x = 12.7 - 0.85;
    GEN.forEach((g) => { badge(s, g.code, g.color, x, 3.9, 0.85, g.code.length > 2 ? 14 : 18); x -= 1.05; });
    T(s, "عرض تنفيذي | القدرات: سرعة نقل البيانات — عدد المستخدمين — نطاق التردد", { x: 5.3, y: 5.1, w: 7.4, h: 0.45, fontSize: 15, color: C.cyan });
    T(s, "سبتمبر 2026", { x: 5.3, y: 5.6, w: 7.4, h: 0.4, fontSize: 13, color: "8FA5C6" });
    s.addNotes("شريحة الغلاف: عرض تنفيذي يستعرض تطور أجيال شبكات الجوال من 2G إلى 6G مع التركيز على ثلاث قدرات: سرعة البيانات، عدد المستخدمين/الكثافة، ونطاق التردد.");
    next();
  }

  // ===== 2. الملخص التنفيذي =====
  {
    const s = pres.addSlide();
    s.background = { color: C.bg };
    slideTitle(s, "الملخص التنفيذي", "ثلاثة عقود ونصف من التطور: كل جيل ضاعف القدرة نحو 10–100 مرة وفتح أسواقاً جديدة");
    const stats = [
      { v: "×2.6 مليون", l: "قفزة سرعة البيانات", s: "من 384 kbps (EDGE) إلى 1 Tbps (6G)", c: C.g6 },
      { v: "0.1 ms", l: "زمن الاستجابة المستهدف في 6G", s: "مقابل ≈500 ms في 2G", c: C.g5a },
      { v: "10 مليون", l: "جهاز لكل كم² في 6G", s: "مقابل مليون في 5G و100 ألف في 4G", c: C.g5 },
      { v: "300 GHz", l: "أقصى تردد مخطط", s: "من 900 MHz في GSM إلى دون التيراهرتز", c: C.g4 },
    ];
    let x = 12.73 - 2.9;
    stats.forEach((st) => {
      rect(s, x, 1.7, 2.9, 1.95, C.panel);
      T(s, st.v, { x: x + 0.2, y: 1.85, w: 2.5, h: 0.7, fontSize: 28, bold: true, color: st.c, align: "right" });
      T(s, st.l, { x: x + 0.2, y: 2.6, w: 2.5, h: 0.4, fontSize: 13, bold: true, color: C.text });
      T(s, st.s, { x: x + 0.2, y: 3.0, w: 2.5, h: 0.55, fontSize: 10.5, color: C.muted });
      x -= 3.11;
    });
    T(s, "الرسالة الرئيسية", { x: 6.9, y: 4.0, w: 5.83, h: 0.4, fontSize: 18, bold: true, color: C.navy });
    T(s, "انتقلت شبكات الجوال من نقل الصوت (2G) إلى نقل البيانات (3G/4G)، ثم إلى منصة تشغيل للصناعات (5G)، وتتجه لتصبح بنية تحتية ذكية تستشعر البيئة وتدمج الذكاء الاصطناعي (5G-Advanced و6G). كل جيل جديد اعتمد على طيف أعلى تردداً وأوسع عرضاً، مع تقنيات هوائيات أذكى لتعويض ضعف الانتشار.",
      { x: 6.9, y: 4.45, w: 5.83, h: 2.3, fontSize: 13.5, color: C.text, valign: "top", lineSpacingMultiple: 1.15 });
    T(s, "ما يعنيه ذلك للقيادة", { x: 0.6, y: 4.0, w: 5.83, h: 0.4, fontSize: 18, bold: true, color: C.navy });
    const pts = [
      "الطيف أصل استراتيجي: تأمين نطاقات 3.5 و6 و7–24 GHz يحدد التنافسية للعقد القادم.",
      "5G-Advanced ترقية منخفضة التكلفة تفتح إيرادات XR والصناعة وإنترنت الأشياء.",
      "الاستعداد لـ 6G يبدأ الآن: نواة سحابية أصيلة، وذكاء اصطناعي في التشغيل، وشراكات NTN.",
    ];
    let y = 4.5;
    for (const [i, p] of pts.entries()) {
      circle(s, 6.0, y + 0.05, 0.36, [C.g5, C.g5a, C.g6][i]);
      T(s, String(i + 1), { x: 6.0, y: y + 0.05, w: 0.36, h: 0.36, fontSize: 12, bold: true, color: C.white, align: "center", valign: "middle", rtlMode: false });
      T(s, p, { x: 0.6, y, w: 5.25, h: 0.7, fontSize: 13, color: C.text, valign: "top" });
      y += 0.75;
    }
    footer(s, next());
    s.addNotes("الملخص التنفيذي: أربعة أرقام رئيسية تلخص حجم القفزة بين الأجيال، والرسالة الأساسية أن كل جيل يعتمد على طيف أعلى وتقنيات هوائيات أذكى.");
  }

  // ===== 3. الخط الزمني =====
  {
    const s = pres.addSlide();
    s.background = { color: C.bg };
    slideTitle(s, "الخط الزمني: جيل جديد كل عشر سنوات تقريباً", "من الهاتف التناظري إلى الشبكة الذكية — سنوات الإطلاق التجاري الأول");
    const items = [
      { code: "1G", color: "B8C0CE", year: "1979–1981", name: "التناظري (NMT / AMPS)", d: "صوت تناظري فقط، بلا تشفير، بلا بيانات" },
      { code: "2G", color: C.g2, year: "1991", name: "GSM", d: "صوت رقمي + SMS ثم GPRS/EDGE" },
      { code: "3G", color: C.g3, year: "2001", name: "UMTS / HSPA", d: "الإنترنت المتنقل والهواتف الذكية" },
      { code: "4G", color: C.g4, year: "2009", name: "LTE / LTE-A", d: "النطاق العريض وشبكة IP الكاملة" },
      { code: "5G", color: C.g5, year: "2019", name: "5G NR", d: "eMBB + URLLC + mMTC" },
      { code: "5G-A", color: C.g5a, year: "2024–2025", name: "5G-Advanced", d: "Rel-18/19: AI، XR، NTN، RedCap" },
      { code: "6G", color: C.g6, year: "≈ 2030", name: "IMT-2030", d: "تيرابت، استشعار، ذكاء أصيل" },
    ];
    const lineY = 3.85;
    s.addShape(pres.ShapeType.line, { x: 0.9, y: lineY, w: 11.55, h: 0, line: { color: C.line, width: 4 } });
    const n = items.length, step = 10.65 / (n - 1);
    items.forEach((it, i) => {
      const cx = 12.0 - i * step; // من اليمين لليسار
      const d = 0.9;
      badge(s, it.code, it.color, cx - d / 2, lineY - d / 2, d, it.code.length > 2 ? 14 : 18);
      const above = i % 2 === 0;
      const ty = above ? lineY - 0.55 - 1.5 : lineY + 0.55;
      T(s, it.year, { x: cx - 0.95, y: above ? ty : ty, w: 1.9, h: 0.35, fontSize: 13, bold: true, color: it.color, align: "center", rtlMode: false });
      T(s, it.name, { x: cx - 0.95, y: ty + 0.36, w: 1.9, h: 0.35, fontSize: 12.5, bold: true, color: C.text, align: "center" });
      T(s, it.d, { x: cx - 0.95, y: ty + 0.72, w: 1.9, h: 0.75, fontSize: 10.5, color: C.muted, align: "center" });
    });
    // مؤشر "نحن هنا"
    const hx = 12.0 - 5.4 * step;
    s.addShape(pres.ShapeType.line, { x: hx, y: lineY - 0.6, w: 0, h: 1.2, line: { color: C.cyan, width: 2, dashType: "dash" } });
    rect(s, hx - 1.15, lineY + 0.6, 1.1, 0.32, C.cyan, { rectRadius: 0.16 });
    T(s, "نحن هنا 2026", { x: hx - 1.15, y: lineY + 0.6, w: 1.1, h: 0.32, fontSize: 9, bold: true, color: C.navy, align: "center", valign: "middle" });
    rect(s, 0.6, 6.25, 12.13, 0.65, tint(C.g5, 0.1));
    T(s, "نمط ثابت: كل جيل يستغرق نحو 10 سنوات من التقييس إلى النشر الواسع، ويتعايش مع الجيل السابق 10–15 سنة قبل إيقافه.", { x: 0.8, y: 6.25, w: 11.7, h: 0.65, fontSize: 13, color: C.navy, valign: "middle" });
    footer(s, next());
    s.addNotes("الخط الزمني: نمط الدورة العشرية. 1G ظهر في اليابان 1979 والدول الإسكندنافية 1981؛ 2G في فنلندا 1991؛ 3G في اليابان 2001؛ 4G في السويد والنرويج 2009؛ 5G في 2019؛ 5G-Advanced مع Release 18 في 2024؛ و6G متوقع حوالي 2030.");
  }

  // ===== 4-9. شرائح الأجيال =====
  for (const g of GENS) {
    const s = pres.addSlide();
    s.background = { color: C.bg };
    badge(s, g.code, g.color, 11.65, 0.35, 1.08, g.code.length > 2 ? 16 : 24);
    T(s, g.title, { x: 0.6, y: 0.4, w: 10.85, h: 0.65, fontSize: 26, bold: true, color: C.navy });
    T(s, g.sub, { x: 0.6, y: 1.05, w: 10.85, h: 0.4, fontSize: 12, color: C.muted });

    // بطاقات القدرات (يمين)
    const cw = 2.85, ch = 1.62, gx = 0.2, gy = 0.2, x0 = 12.73 - cw, y0 = 1.65;
    g.stats.forEach((st, i) => {
      const x = x0 - (i % 2) * (cw + gx), y = y0 + Math.floor(i / 2) * (ch + gy);
      rect(s, x, y, cw, ch, C.panel);
      T(s, st.l, { x: x + 0.18, y: y + 0.12, w: cw - 0.36, h: 0.3, fontSize: 11, bold: true, color: C.muted });
      T(s, st.v, { x: x + 0.18, y: y + 0.42, w: cw - 0.36, h: 0.5, fontSize: 21, bold: true, color: g.color });
      T(s, st.s, { x: x + 0.18, y: y + 0.95, w: cw - 0.36, h: 0.62, fontSize: 9.5, color: C.text, valign: "top" });
    });

    // ماذا أتاح (يسار)
    T(s, "ماذا أتاح هذا الجيل؟", { x: 0.6, y: 1.65, w: 6.2, h: 0.4, fontSize: 17, bold: true, color: C.navy });
    let y = 2.15;
    for (const [Icon, txt] of g.enabled) {
      circle(s, 6.25, y + 0.05, 0.55, tint(g.color, 0.18));
      s.addImage({ data: await iconPng(Icon, g.color), x: 6.38, y: y + 0.18, w: 0.29, h: 0.29 });
      T(s, txt, { x: 0.6, y: y + 0.02, w: 5.45, h: 0.62, fontSize: 12.5, color: C.text, valign: "middle" });
      y += 0.72;
    }

    // شرائح التقنيات
    T(s, "التقنيات الرئيسية", { x: 0.6, y: 5.35, w: 12.13, h: 0.32, fontSize: 12.5, bold: true, color: C.muted });
    let cx = 12.73, cy = 5.7;
    g.chips.forEach((chip) => {
      const w = Math.max(0.85, chip.length * 0.085 + 0.3);
      if (cx - w < 0.6) { cx = 12.73; cy += 0.42; }
      cx -= w;
      rect(s, cx, cy, w, 0.36, tint(g.color, 0.15), { rectRadius: 0.18 });
      T(s, chip, { x: cx, y: cy, w, h: 0.36, fontSize: 10, bold: true, color: g.color, align: "center", valign: "middle", rtlMode: false });
      cx -= 0.14;
    });

    // الخلاصة التنفيذية
    rect(s, 0.6, 6.25, 12.13, 0.68, tint(g.color, 0.1));
    T(s, g.takeaway, { x: 0.85, y: 6.25, w: 11.65, h: 0.68, fontSize: 12.5, bold: false, color: C.navy, valign: "middle" });
    footer(s, next());
    s.addNotes(`${g.title}. ${g.sub}. ${g.takeaway}`);
  }

  // ===== 10. مثلث حالات استخدام 5G + مقارنة الأداء الفعلي =====
  {
    const s = pres.addSlide();
    s.background = { color: C.bg };
    slideTitle(s, "5G: ثلاث ركائز للخدمة بدل خدمة واحدة", "متطلبات IMT-2020 مقابل الأداء الفعلي المُقاس في الشبكات التجارية");
    s.addImage({ data: await svgPng(triangleSvg(), 1200), x: 7.3, y: 1.6, w: 5.4, h: 4.5 });
    const rows = [
      [{ text: "المؤشر", options: { bold: true, color: C.white, fill: { color: C.navy } } }, { text: "هدف IMT-2020", options: { bold: true, color: C.white, fill: { color: C.navy } } }, { text: "الأداء الفعلي (2025)", options: { bold: true, color: C.white, fill: { color: C.navy } } }],
      ["ذروة التنزيل", "20 Gbps", "1–4 Gbps (mmWave) | 0.5–1.5 Gbps (3.5 GHz)"],
      ["متوسط سرعة المستخدم", "100 Mbps", "150–400 Mbps في الأسواق الرائدة"],
      ["زمن الاستجابة", "1 ms (راديو)", "8–20 ms طرف إلى طرف (SA)"],
      ["الكثافة", "1 مليون / كم²", "يتحقق نظرياً مع mMTC / RedCap"],
      ["كفاءة الطيف", "30 bps/Hz تنزيل", "≈ 3× كفاءة 4G عملياً"],
    ];
    const tbl = rows.map((r, i) => (i === 0 ? r : r.map((c, j) => ({ text: c, options: { bold: j === 0, color: C.text, fill: { color: i % 2 ? C.white : C.panel } } }))).reverse());
    s.addTable(fixRows(tbl), { x: 0.6, y: 1.7, w: 6.4, colW: [2.9, 1.6, 1.9], fontFace: FONT, fontSize: 11, align: "right", rtlMode: true, border: { type: "solid", color: C.line, pt: 0.75 }, rowH: 0.5, valign: "middle", margin: 0.06 });
    rect(s, 0.6, 5.1, 6.4, 1.0, tint(C.g5, 0.1));
    T(s, "الفجوة بين الهدف والواقع طبيعية: الأهداف تُقاس في ظروف مثالية بعرض نطاق كامل، بينما تحدد كمية الطيف المتاحة للمشغل (100 MHz في 3.5 GHz) الأداء الفعلي.", { x: 0.8, y: 5.1, w: 6.0, h: 1.0, fontSize: 11.5, color: C.navy, valign: "middle" });
    footer(s, next());
    s.addNotes("مثلث 5G: eMBB للنطاق العريض، URLLC للتطبيقات الحرجة، mMTC لإنترنت الأشياء الضخم. الجدول يقارن أهداف ITU بالأداء المقاس فعلياً.");
  }

  // ===== 11. جدول المقارنة الشامل =====
  {
    const s = pres.addSlide();
    s.background = { color: C.bg };
    slideTitle(s, "جدول المقارنة الشامل بين الأجيال", "القدرات الرئيسية: سرعة البيانات، المستخدمون، نطاق التردد، عرض القناة، التقنية");
    const hdr = ["الجيل", "الإطلاق", "التقنية الأساسية", "ذروة سرعة التنزيل", "زمن الاستجابة", "المستخدمون / الكثافة", "نطاق التردد", "عرض القناة"];
    const data = [
      ["2G", "1991", "GSM / TDMA — GPRS / EDGE", "\u202A9.6 kbps → 384 kbps\u202C", "≈ 500 ms", "8 لكل حامل 200 kHz | مئات لكل خلية", "850 / 900 / 1800 / 1900 MHz", "200 kHz"],
      ["3G", "2001", "UMTS / WCDMA — HSPA+", "\u202A384 kbps → 42 Mbps\u202C", "100–200 ms", "≈ 100–200 متزامن لكل حامل", "850 / 900 / 1900 / 2100 MHz", "5 MHz"],
      ["4G", "2009", "LTE / OFDMA — LTE-A Pro", "\u202A100 Mbps → 3 Gbps\u202C", "30–50 ms", "≈ 100 ألف / كم²", "450 MHz – 5.9 GHz (أساساً 700–2600)", "1.4–20 MHz (CA حتى 100)"],
      ["5G", "2019", "NR / CP-OFDM — Massive MIMO", "20 Gbps", "1–10 ms", "1 مليون / كم²", "FR1: 0.41–7.125 GHz | FR2: 24–71 GHz", "100 MHz (FR1) / 400 MHz (FR2)"],
      ["5G-A", "2024", "NR Rel-18/19 + AI/ML + NTN", "10 Gbps للمستخدم (عملياً)", "< 1–5 ms", "≈ 10× سعة الخلية", "+ 6 GHz العلوي (6.4–7.1) + mmWave موسع", "حتى 400 MHz + CA واسع"],
      ["6G", "≈ 2030", "AI-Native — ISAC — Sub-THz", "1 Tbps", "0.1 ms", "10 مليون / كم²", "FR3: 7–24 GHz | 100–300 GHz + الحالي", "غيغاهرتز متعددة"],
    ];
    const H = (t) => ({ text: t, options: { bold: true, color: C.white, fill: { color: C.navy }, fontSize: 10.5 } });
    const rows = [hdr.map(H).reverse()];
    data.forEach((r, i) => {
      const gen = GEN[i];
      rows.push(r.map((c, j) => ({
        text: c,
        options: {
          bold: j === 0, color: j === 0 ? C.white : C.text, fill: { color: j === 0 ? gen.color : i % 2 ? C.panel : C.white },
          fontSize: j === 0 ? 12 : 9.5, align: j === 0 || j === 1 ? "center" : "right", rtlMode: !(j === 0),
        },
      })).reverse());
    });
    s.addTable(fixRows(rows), { x: 0.5, y: 1.6, w: 12.33, colW: [1.95, 2.35, 1.95, 1.05, 1.75, 1.85, 0.75, 0.68], fontFace: FONT, align: "right", rtlMode: true, border: { type: "solid", color: C.line, pt: 0.75 }, rowH: [0.45, 0.66, 0.66, 0.66, 0.66, 0.66, 0.66], valign: "middle", margin: 0.05 });
    T(s, "القيم الذروية وفق معايير 3GPP وأهداف ITU (IMT-2000 / IMT-Advanced / IMT-2020 / IMT-2030). القيم المسبوقة بـ ≈ تقديرات تشغيلية نموذجية وتختلف بحسب التهيئة والطيف المتاح.", { x: 0.6, y: 6.35, w: 12.13, h: 0.5, fontSize: 9.5, color: C.muted, italic: true });
    footer(s, next());
    s.addNotes("جدول المقارنة: اقرأ الجدول من اليمين لليسار. ركّز على ثلاثة أعمدة: ذروة السرعة، الكثافة، ونطاق التردد.");
  }

  // ===== 12. مخطط سرعة البيانات =====
  {
    const s = pres.addSlide();
    s.background = { color: C.bg };
    slideTitle(s, "ذروة سرعة نقل البيانات: نمو أسّي بمعامل 10–50 لكل جيل", "بالميغابت في الثانية (Mbps) — مقياس لوغاريتمي، القيم الذروية حسب المعيار");
    const labels = ["2G (EDGE)", "3G (HSPA+)", "4G (LTE-A Pro)", "5G (NR)", "5G-A", "6G"];
    const vals = [0.384, 42, 3000, 20000, 30000, 1000000];
    s.addChart(pres.ChartType.bar, [{ name: "ذروة التنزيل (Mbps)", labels, values: vals }], {
      x: 0.6, y: 1.6, w: 8.2, h: 5.2, barDir: "col", barGapWidthPct: 60,
      chartColors: GEN.map((g) => g.color), valAxisLogScaleBase: 10,
      valAxisMinVal: 0.01, valAxisMaxVal: 10000000,
      showValue: true, dataLabelPosition: "outEnd", dataLabelFontSize: 10, dataLabelFontFace: FONT, dataLabelColor: C.text, dataLabelFormatCode: "#,##0.###",
      catAxisLabelFontFace: FONT, catAxisLabelFontSize: 11, catAxisLabelColor: C.muted,
      valAxisLabelFontFace: FONT, valAxisLabelFontSize: 10, valAxisLabelColor: C.muted, valAxisLabelFormatCode: "#,##0.##",
      valGridLine: { color: "E6ECF5", size: 0.5 }, catGridLine: { style: "none" },
      showLegend: false, showTitle: false, valAxisTitle: "Mbps", showValAxisTitle: true, valAxisTitleFontSize: 10, valAxisTitleColor: C.muted,
    });
    const cards = [
      { v: "×2.6 مليون", l: "من EDGE (384 kbps) إلى 6G (1 Tbps)", c: C.g6 },
      { v: "×50", l: "من 5G إلى 6G (20 Gbps → 1 Tbps)", c: C.g5a },
      { v: "×100", l: "سرعة المستخدم الفعلية: 4G (10 Mbps) → 6G (1 Gbps)", c: C.g5 },
    ];
    let y = 1.7;
    cards.forEach((c) => {
      rect(s, 9.1, y, 3.63, 1.45, C.panel);
      T(s, c.v, { x: 9.3, y: y + 0.15, w: 3.25, h: 0.6, fontSize: 26, bold: true, color: c.c });
      T(s, c.l, { x: 9.3, y: y + 0.78, w: 3.25, h: 0.6, fontSize: 11, color: C.text });
      y += 1.65;
    });
    footer(s, next());
    s.addNotes("مخطط سرعة البيانات على مقياس لوغاريتمي؛ كل درجة على المحور تعني عشرة أضعاف. 5G-Advanced قيمته تقريبية (30 Gbps مع تجميع حوامل موسع).");
  }

  // ===== 13. مخططا زمن الاستجابة والكثافة =====
  {
    const s = pres.addSlide();
    s.background = { color: C.bg };
    slideTitle(s, "زمن الاستجابة وكثافة المستخدمين: مفتاحا الأسواق الجديدة", "مقياس لوغاريتمي — كلما انخفض زمن الاستجابة وارتفعت الكثافة، اتسعت حالات الاستخدام الصناعية");
    const labels = ["2G", "3G", "4G", "5G", "5G-A", "6G"];
    const common = {
      barDir: "col", barGapWidthPct: 55, chartColors: GEN.map((g) => g.color), valAxisLogScaleBase: 10,
      showValue: true, dataLabelPosition: "outEnd", dataLabelFontSize: 10, dataLabelFontFace: FONT, dataLabelColor: C.text,
      catAxisLabelFontFace: FONT, catAxisLabelFontSize: 11, catAxisLabelColor: C.muted,
      valAxisLabelFontFace: FONT, valAxisLabelFontSize: 9, valAxisLabelColor: C.muted, valAxisLabelFormatCode: "#,##0.###",
      valGridLine: { color: "E6ECF5", size: 0.5 }, catGridLine: { style: "none" }, showLegend: false,
      showTitle: true, titleFontFace: FONT, titleFontSize: 14, titleColor: C.navy, titleBold: true,
    };
    s.addChart(pres.ChartType.bar, [{ name: "زمن الاستجابة (ms)", labels, values: [500, 150, 40, 5, 2, 0.1] }],
      Object.assign({ x: 6.85, y: 1.6, w: 5.9, h: 4.6, title: "زمن الاستجابة بالملّي ثانية (الأقل أفضل)", valAxisMinVal: 0.001, valAxisMaxVal: 1000, dataLabelFormatCode: "#,##0.#" }, common));
    s.addChart(pres.ChartType.bar, [{ name: "الكثافة (جهاز/كم²)", labels, values: [1000, 10000, 100000, 1000000, 5000000, 10000000] }],
      Object.assign({ x: 0.6, y: 1.6, w: 5.9, h: 4.6, title: "كثافة الاتصال المستهدفة (جهاز لكل كم²)", valAxisMinVal: 100, valAxisMaxVal: 100000000, dataLabelFormatCode: "#,##0" }, common));
    rect(s, 0.6, 6.3, 12.13, 0.62, tint(C.g5a, 0.1));
    T(s, "قيم 2G و3G و5G-A تقديرية لأغراض المقارنة؛ أما 4G و5G و6G فهي أهداف ITU الرسمية (IMT-Advanced و IMT-2020 و IMT-2030).", { x: 0.85, y: 6.3, w: 11.65, h: 0.62, fontSize: 11, color: C.navy, valign: "middle" });
    footer(s, next());
    s.addNotes("مخططان: زمن الاستجابة (يسار الجمهور: الكثافة، يمين: زمن الاستجابة). الأرقام لوغاريتمية.");
  }

  // ===== 14. خريطة الطيف =====
  {
    const s = pres.addSlide();
    s.background = { color: C.bg };
    slideTitle(s, "خريطة الطيف: كل جيل يصعد إلى ترددات أعلى", "النطاقات الترددية الرئيسية لكل جيل — التردد المنخفض يمنح التغطية، والمرتفع يمنح السعة");
    s.addImage({ data: await svgPng(spectrumSvg(), 2700), x: 0.6, y: 1.55, w: 12.13, h: 12.13 * 1180 / 2700 });
    footer(s, next());
    s.addNotes("خريطة الطيف على مقياس لوغاريتمي. لاحظ أن 5G وسّع النطاق إلى الموجات المليمترية، و6G يستهدف النطاق السنتيمتري 7–24 GHz ودون التيراهرتز مع إعادة استخدام الطيف الحالي.");
  }

  // ===== 15. تطور بنية الشبكة =====
  {
    const s = pres.addSlide();
    s.background = { color: C.bg };
    slideTitle(s, "تطور بنية الشبكة: من التبديل الدائري إلى النواة الذكية", "ثلاث طبقات: الشبكة الأساسية، شبكة الوصول الراديوي، وتقنية الهوائي والراديو");
    const cols = [
      { g: GEN[0], core: "MSC / HLR + SGSN / GGSN\nتبديل الدوائر", ran: "BTS + BSC\nهرمية مركزية", air: "TDMA — GMSK\nهوائي واحد" },
      { g: GEN[1], core: "MSC + SGSN / GGSN\nدوائر + حزم", ran: "NodeB + RNC", air: "WCDMA — 5 MHz\nMIMO 2x2" },
      { g: GEN[2], core: "EPC (MME / S-GW / P-GW)\nحزم IP بالكامل", ran: "eNodeB مسطّحة\nبلا متحكم", air: "OFDMA — CA\nMIMO 4x4 / 8x8" },
      { g: GEN[3], core: "5GC — بنية خدمية SBA\nسحابية أصيلة", ran: "gNodeB: CU / DU / RU\nOpen RAN", air: "CP-OFDM\nMassive MIMO 64T64R" },
      { g: GEN[4], core: "5GC + AI/ML\nتقطيع متقدم", ran: "RAN ذكية\nتوفير طاقة", air: "ELAA-MM\nNTN + RedCap" },
      { g: GEN[5], core: "نواة أصيلة بالذكاء\nحوسبة + اتصال + استشعار", ran: "Cell-free\nأرضية-فضائية موحدة", air: "Sub-THz — RIS\nواجهة راديو بالذكاء" },
    ];
    const rowsL = ["الشبكة الأساسية", "شبكة الوصول", "الراديو والهوائي"];
    const rx = 11.05, rw = 1.65, cw = 1.72, gap = 0.12, y0 = 1.65, rh = 1.25;
    rowsL.forEach((r, i) => {
      rect(s, rx, y0 + 0.62 + i * (rh + 0.12), rw, rh, C.navy);
      T(s, r, { x: rx + 0.1, y: y0 + 0.62 + i * (rh + 0.12), w: rw - 0.2, h: rh, fontSize: 13, bold: true, color: C.white, align: "center", valign: "middle" });
    });
    cols.forEach((c, i) => {
      const x = rx - gap - (i + 1) * (cw + gap) + gap;
      badge(s, c.g.code, c.g.color, x + cw / 2 - 0.26, y0, 0.52, c.g.code.length > 2 ? 10 : 13);
      [c.core, c.ran, c.air].forEach((txt, j) => {
        const y = y0 + 0.62 + j * (rh + 0.12);
        rect(s, x, y, cw, rh, j === 0 ? tint(c.g.color, 0.14) : C.panel);
        T(s, txt, { x: x + 0.08, y: y + 0.08, w: cw - 0.16, h: rh - 0.16, fontSize: 9.5, color: C.text, align: "center", valign: "middle" });
      });
    });
    // سهم الاتجاه
    s.addShape(pres.ShapeType.rightArrow, { x: 0.6, y: 6.4, w: 10.4, h: 0.5, fill: { color: tint(C.g5, 0.15) }, line: { color: tint(C.g5, 0.15), width: 0 }, flipH: true });
    T(s, "اتجاه التطور: مركزية → تسطيح → افتراضية سحابية → ذكاء اصطناعي أصيل", { x: 1.3, y: 6.4, w: 9.5, h: 0.5, fontSize: 12, bold: true, color: C.navy, valign: "middle", align: "center" });
    footer(s, next());
    s.addNotes("تطور البنية: اقرأ الأعمدة من اليمين (2G) إلى اليسار (6G). الاتجاه العام: تسطيح الهرمية، ثم الافتراضية السحابية، ثم الذكاء الاصطناعي الأصيل.");
  }

  // ===== 16. حالات الاستخدام =====
  {
    const s = pres.addSlide();
    s.background = { color: C.bg };
    slideTitle(s, "حالات الاستخدام: من الصوت إلى الاستشعار", "كل جيل فتح فئة جديدة من الخدمات — والقيمة انتقلت من المستهلك إلى الصناعات");
    const uc = [
      { g: GEN[0], items: [[Fa.FaPhoneAlt, "صوت رقمي"], [Fa.FaSms, "الرسائل القصيرة"], [Fa.FaSimCard, "التجوال الدولي"]] },
      { g: GEN[1], items: [[Fa.FaVideo, "مكالمات فيديو"], [Fa.FaMobileAlt, "الهواتف الذكية"], [Fa.FaMapMarkedAlt, "الخرائط والموقع"]] },
      { g: GEN[2], items: [[Fa.FaPlayCircle, "بث الفيديو HD"], [Fa.FaCarSide, "اقتصاد التطبيقات"], [Fa.FaWifi, "NB-IoT / LTE-M"]] },
      { g: GEN[3], items: [[Fa.FaIndustry, "المصانع الذكية"], [Fa.FaHome, "FWA بديل الألياف"], [Fa.FaCar, "المركبات المتصلة"]] },
      { g: GEN[4], items: [[Fa.FaVrCardboard, "الواقع الممتد XR"], [Fa.FaSatellite, "تغطية الأقمار NTN"], [Fa.FaMicrochip, "RedCap للأجهزة"]] },
      { g: GEN[5], items: [[Fa.FaRobot, "الروبوتات والتوائم"], [Md.MdSensors, "الشبكة كمستشعر"], [Fa.FaCube, "الهولوغرام واللمس"]] },
    ];
    const cw = 1.86, gap = 0.19, y0 = 1.65;
    for (const [i, c] of uc.entries()) {
      const x = 12.73 - cw - i * (cw + gap);
      rect(s, x, y0, cw, 4.35, C.panel);
      badge(s, c.g.code, c.g.color, x + cw / 2 - 0.32, y0 + 0.2, 0.64, c.g.code.length > 2 ? 12 : 16);
      for (const [j, [Icon, lbl]] of c.items.entries()) {
        const y = y0 + 1.05 + j * 1.08;
        circle(s, x + cw / 2 - 0.27, y, 0.54, tint(c.g.color, 0.18));
        s.addImage({ data: await iconPng(Icon, c.g.color), x: x + cw / 2 - 0.15, y: y + 0.12, w: 0.3, h: 0.3 });
        T(s, lbl, { x: x + 0.08, y: y + 0.6, w: cw - 0.16, h: 0.42, fontSize: 10.5, color: C.text, align: "center" });
      }
    }
    rect(s, 0.6, 6.2, 12.13, 0.7, tint(C.g6, 0.1));
    T(s, "الاتجاه: تحوّل مصدر القيمة من الاشتراك الفردي (ARPU) إلى الشبكات الخاصة والخدمات الصناعية، ومن الاتصال إلى «الاتصال + الحوسبة + الاستشعار».", { x: 0.85, y: 6.2, w: 11.65, h: 0.7, fontSize: 12.5, color: C.navy, valign: "middle" });
    footer(s, next());
    s.addNotes("حالات الاستخدام لكل جيل. لاحظ الانتقال من خدمات المستهلك إلى خدمات الصناعة والأقمار والاستشعار.");
  }

  // ===== 17. التوجهات والتوصيات =====
  {
    const s = pres.addSlide();
    s.background = { color: C.bg };
    slideTitle(s, "التوجهات الاستراتيجية والتوصيات التنفيذية", "ما الذي ينبغي أن يكون على أجندة القيادة خلال 2026–2030");
    const trends = [
      [Fa.FaBroadcastTower, "الطيف يزداد ندرة وارتفاعاً", "المعركة القادمة على 6 GHz العلوي و7–24 GHz؛ WRC-27 سيحدد نطاقات 6G."],
      [Fa.FaCloud, "الشبكة تصبح برمجيات", "النواة السحابية و Open RAN يحولان الإنفاق من الأجهزة إلى البرمجيات والتشغيل."],
      [Fa.FaBrain, "الذكاء الاصطناعي في قلب الشبكة", "من تحسين الطاقة في 5G-A إلى واجهة راديو مصممة بالذكاء في 6G."],
      [Fa.FaSatellite, "التقارب الأرضي-الفضائي", "الأقمار منخفضة المدار جزء من الشبكة (NTN) لا منافس لها."],
    ];
    T(s, "التوجهات", { x: 6.9, y: 1.6, w: 5.83, h: 0.4, fontSize: 18, bold: true, color: C.navy });
    let y = 2.1;
    for (const [Icon, h, d] of trends) {
      circle(s, 12.15, y + 0.05, 0.58, tint(C.g5, 0.18));
      s.addImage({ data: await iconPng(Icon, C.g5), x: 12.29, y: y + 0.19, w: 0.3, h: 0.3 });
      T(s, h, { x: 6.9, y, w: 5.05, h: 0.35, fontSize: 13.5, bold: true, color: C.text });
      T(s, d, { x: 6.9, y: y + 0.36, w: 5.05, h: 0.6, fontSize: 11, color: C.muted });
      y += 1.1;
    }
    const recs = [
      ["تأمين الطيف", "المشاركة في مزادات 6 GHz و mmWave، وحجز موقف واضح تجاه FR3 قبل WRC-27."],
      ["الانتقال إلى 5G SA ثم 5G-Advanced", "استكمال النواة المستقلة خلال 18 شهراً؛ فهي شرط XR والتقطيع وRedCap."],
      ["تحقيق الدخل من B2B", "بناء عروض شبكات خاصة وتقطيع للقطاعات الصناعية واللوجستية والصحة."],
      ["الاستعداد المبكر لـ 6G", "الانخراط في 3GPP/ITU، وتجارب Sub-THz وISAC، وشراكات الأقمار NTN."],
    ];
    T(s, "التوصيات التنفيذية", { x: 0.6, y: 1.6, w: 5.83, h: 0.4, fontSize: 18, bold: true, color: C.navy });
    y = 2.1;
    recs.forEach(([h, d], i) => {
      rect(s, 0.6, y, 5.83, 0.98, C.panel);
      circle(s, 5.75, y + 0.2, 0.5, [C.g4, C.g5, C.g5a, C.g6][i]);
      T(s, String(i + 1), { x: 5.75, y: y + 0.2, w: 0.5, h: 0.5, fontSize: 14, bold: true, color: C.white, align: "center", valign: "middle", rtlMode: false });
      T(s, h, { x: 0.8, y: y + 0.12, w: 4.8, h: 0.35, fontSize: 13, bold: true, color: C.text });
      T(s, d, { x: 0.8, y: y + 0.47, w: 4.8, h: 0.48, fontSize: 10.5, color: C.muted });
      y += 1.1;
    });
    footer(s, next());
    s.addNotes("التوجهات والتوصيات: أربعة توجهات وأربع توصيات قابلة للتنفيذ خلال 2026–2030.");
  }

  // ===== 18. الختام =====
  {
    const s = pres.addSlide();
    s.background = { color: C.navy };
    T(s, "الخلاصة", { x: 0.6, y: 0.9, w: 12.13, h: 0.8, fontSize: 36, bold: true, color: C.white });
    const pts = [
      ["2G → 3G", "من الصوت الرقمي إلى الإنترنت المتنقل", C.g3],
      ["4G", "النطاق العريض وشبكة IP الكاملة — أساس اقتصاد التطبيقات", C.g4],
      ["5G → 5G-A", "منصة الصناعات: سرعة، موثوقية، كثافة، وذكاء اصطناعي", C.g5a],
      ["6G", "اتصال + حوسبة + استشعار بسرعة تيرابت وزمن 0.1 ملّي ثانية", C.g6],
    ];
    let y = 2.0;
    pts.forEach(([k, v, c]) => {
      rect(s, 10.0, y, 2.73, 0.75, c, { rectRadius: 0.1 });
      T(s, k, { x: 10.0, y, w: 2.73, h: 0.75, fontSize: 18, bold: true, color: C.white, align: "center", valign: "middle", rtlMode: false });
      T(s, v, { x: 0.6, y, w: 9.1, h: 0.75, fontSize: 17, color: "DCE6F5", valign: "middle" });
      y += 0.95;
    });
    T(s, "شكراً لكم — أسئلة ونقاش", { x: 0.6, y: 6.1, w: 12.13, h: 0.6, fontSize: 22, bold: true, color: C.cyan });
    T(s, "المصادر: مواصفات 3GPP (Rel-99 إلى Rel-19)، تقارير ITU-R (IMT-2000، IMT-Advanced، IMT-2020، IMT-2030)، GSMA Intelligence، Ericsson Mobility Report.", { x: 0.6, y: 6.75, w: 12.13, h: 0.5, fontSize: 9.5, color: "8FA5C6" });
    s.addNotes("الختام: أربع رسائل، ثم فتح باب النقاش.");
    next();
  }

  await pres.writeFile({ fileName: OUT });
  console.log("wrote", OUT, "slides:", N.n);
})().catch((e) => { console.error(e); process.exit(1); });
