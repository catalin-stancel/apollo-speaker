const fs = require('fs');
const img = f => 'data:image/jpeg;base64,' + fs.readFileSync(__dirname + '/parts/' + f).toString('base64');
const three = fs.readFileSync(__dirname + '/three147.min.js', 'utf8');

// ---------- engineering drawing sheets (ISO-style dimensioning, orthogonal only) ----------
const PAP = '#f4f2ea', INKC = '#1a1c22', GRIDA = '#d9dfd2', GRIDB = '#bcc9b3', FACEC = '#e8e5db';
const CL = '11 3 2 3';                      // centerline dash
const GAP = 54;                             // spacing between parallel dimension lines
const M0 = 46;                              // first dim line offset from the part edge
function sheet(tag, W, H, gp) {
  return `<svg viewBox="0 0 ${W} ${H}" role="img"><defs>
<marker id="da${tag}" viewBox="0 0 12 12" refX="10.5" refY="6" markerWidth="10" markerHeight="10" orient="auto-start-reverse"><path d="M1 2 L11 6 L1 10 Z" fill="${INKC}"/></marker>
<pattern id="g1${tag}" width="${gp}" height="${gp}" patternUnits="userSpaceOnUse"><path d="M ${gp} 0 L 0 0 0 ${gp}" fill="none" stroke="${GRIDA}" stroke-width="0.35"/></pattern>
<pattern id="g10${tag}" width="${gp * 10}" height="${gp * 10}" patternUnits="userSpaceOnUse"><path d="M ${gp * 10} 0 L 0 0 0 ${gp * 10}" fill="none" stroke="${GRIDB}" stroke-width="0.7"/></pattern>
<pattern id="ht${tag}" width="7" height="7" patternTransform="rotate(45)" patternUnits="userSpaceOnUse"><line x1="0" y1="0" x2="0" y2="7" stroke="${INKC}" stroke-width="0.5"/></pattern>
</defs>
<rect width="${W}" height="${H}" fill="${PAP}"/><rect width="${W}" height="${H}" fill="url(#g1${tag})"/><rect width="${W}" height="${H}" fill="url(#g10${tag})"/>
<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" fill="none" stroke="${INKC}" stroke-width="1.2"/>`;
}
const ln = (x1, y1, x2, y2, w = 1, dash = '') => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${INKC}" stroke-width="${w}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;
const ci = (cx, cy, r, w = 1.1, dash = '') => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${INKC}" stroke-width="${w}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;
const tx = (x, y, s, rot = 0, size = 13.5) => `<text x="${x}" y="${y}" fill="${INKC}" font-size="${size}" text-anchor="middle" font-family="Consolas,ui-monospace,monospace"${rot ? ` transform="rotate(${rot} ${x} ${y})"` : ''}>${s}</text>`;
const gridnote = (tag, W, H) => `<text x="${W - 14}" y="${H - 12}" fill="#7d8a76" font-size="10.5" text-anchor="end" font-family="Consolas,ui-monospace,monospace" data-i18n="gridn">grid = 10 mm</text>`;

function dimV(tag, x, y1, y2, label, ex) {
  const side = x > ex ? 1 : -1, g = Math.max(12, label.length * 4.7), m = (y1 + y2) / 2, ov = side * 6;
  let o = ln(ex, y1, x + ov, y1, 0.4) + ln(ex, y2, x + ov, y2, 0.4);
  o += `<line x1="${x}" y1="${y1}" x2="${x}" y2="${m - g}" stroke="${INKC}" stroke-width="0.6" marker-start="url(#da${tag})"/>`;
  o += `<line x1="${x}" y1="${m + g}" x2="${x}" y2="${y2}" stroke="${INKC}" stroke-width="0.6" marker-end="url(#da${tag})"/>`;
  return o + tx(x, m, label, -90);
}
function dimH(tag, y, x1, x2, label, ey) {
  const side = y > ey ? 1 : -1, g = Math.max(13, label.length * 5.0), m = (x1 + x2) / 2, ov = side * 6;
  let o = ln(x1, ey, x1, y + ov, 0.4) + ln(x2, ey, x2, y + ov, 0.4);
  o += `<line x1="${x1}" y1="${y}" x2="${m - g}" y2="${y}" stroke="${INKC}" stroke-width="0.6" marker-start="url(#da${tag})"/>`;
  o += `<line x1="${m + g}" y1="${y}" x2="${x2}" y2="${y}" stroke="${INKC}" stroke-width="0.6" marker-end="url(#da${tag})"/>`;
  return o + tx(m, y + 5, label);
}
const diaV = (tag, cx, cy, r, x, d) => dimV(tag, x, cy - r, cy + r, 'Ø' + d, cx);
const clH = (cx, cy, r) => ln(cx - r - 12, cy, cx + r + 12, cy, 0.5, CL);
const clV = (cx, y1, y2) => ln(cx, y1, cx, y2, 0.5, CL);

// ISO counterbore-with-depth schedule: rows of [dia, depth] -> "⊔ Ødia ↧depth"
function recessBlock(x, y, rows) {
  let o = '';
  rows.forEach(function (r, i) {
    const ry = y + i * 28;
    o += `<path d="M ${x} ${ry - 10} L ${x} ${ry} L ${x + 12} ${ry} L ${x + 12} ${ry - 10}" fill="none" stroke="${INKC}" stroke-width="1.2"/>`;
    const dia = 'Ø' + r[0];
    o += `<text x="${x + 19}" y="${ry}" fill="${INKC}" font-size="13.5" font-family="Consolas,ui-monospace,monospace">${dia}</text>`;
    const dx = x + 19 + dia.length * 8.4 + 14;
    o += `<line x1="${dx}" y1="${ry - 11}" x2="${dx}" y2="${ry - 1}" stroke="${INKC}" stroke-width="1.2"/>`;
    o += `<path d="M ${dx - 4} ${ry - 4.5} L ${dx} ${ry} L ${dx + 4} ${ry - 4.5}" fill="none" stroke="${INKC}" stroke-width="1.2"/>`;
    o += `<text x="${dx + 7}" y="${ry}" fill="${INKC}" font-size="13.5" font-family="Consolas,ui-monospace,monospace">${r[1]}</text>`;
  });
  return o;
}

function makeBaffle() {
  const g = 'ba', s = 1.32, ox = 320, oy = 74;
  const px = mm => ox + mm * s, py = mm => oy + mm * s;
  const cx = px(105), tY = py(100), wY = py(265), R = px(210), B = py(380);
  const r105 = 52.5 * s, r73 = 36.5 * s, rBC = 46 * s, r176 = 88 * s, r145 = 72.5 * s;
  let o = sheet(g, 980, 690, s);
  o += `<rect x="${px(0)}" y="${py(0)}" width="${210 * s}" height="${380 * s}" fill="${FACEC}" stroke="${INKC}" stroke-width="1.3"/>`;
  o += `<polygon points="${px(15)},${py(15)} ${px(195)},${py(15)} ${px(195)},${py(365)} ${px(15)},${py(365)}" fill="none" stroke="${INKC}" stroke-width="0.7" stroke-dasharray="7 4"/>`;
  o += clV(cx, py(0) - 14, B + 14) + clH(cx, tY, r105) + clH(cx, wY, r176);
  o += ci(cx, tY, r105);
  (function () { const ex = 8.5 * s, ey = 45 * s, r = r73, my = Math.sqrt(r * r - ex * ex);
    o += `<path d="M ${cx + ex} ${tY - my} L ${cx + ex} ${tY - ey} L ${cx - ex} ${tY - ey} L ${cx - ex} ${tY - my} A ${r} ${r} 0 0 0 ${cx - ex} ${tY + my} L ${cx - ex} ${tY + ey} L ${cx + ex} ${tY + ey} L ${cx + ex} ${tY + my} A ${r} ${r} 0 0 0 ${cx + ex} ${tY - my} Z" fill="none" stroke="${INKC}" stroke-width="1.1"/>`; })();
  o += ci(cx, wY, r176) + ci(cx, wY, r145);
  // top / left — overall + positions (nested: shortest innermost)
  o += dimH(g, oy - 44, px(0), R, '210', py(0));
  o += dimV(g, ox - M0, py(0), tY, '100', px(0));
  o += dimV(g, ox - M0 - GAP, py(0), wY, '265', px(0));
  o += dimV(g, ox - M0 - GAP * 2, py(0), B, '380', px(0));
  o += dimH(g, oy - 20, px(195), R, '15', py(0));
  // right — diameters (nested: smallest innermost)
  o += diaV(g, cx, tY, r73, R + M0, '73');
  o += diaV(g, cx, tY, r105, R + M0 + GAP, '105');
  o += diaV(g, cx, wY, r145, R + M0, '145');
  o += diaV(g, cx, wY, r176, R + M0 + GAP, '176');
  // keyhole slots
  o += dimH(g, tY - 45 * s - 20, cx - 8.5 * s, cx + 8.5 * s, '17', tY - 45 * s);
  o += dimV(g, cx - r105 - 24, tY - 45 * s, tY + 45 * s, '90', cx - r105);
  o += recessBlock(88, 616, [[105, 6], [176, 4.5]]);
  o += gridnote(g, 980, 690);
  return o + '</svg>';
}

function makeSide() {
  const g = 'sd', s = 1.32, ox = 156, oy = 74;
  const px = mm => ox + mm * s, py = mm => oy + mm * s;
  const cx = px(180), cy = py(185), R = px(286), B = py(380);
  const r176 = 88 * s, r145 = 72.5 * s;
  let o = sheet(g, 980, 648, s);
  o += `<rect x="${px(0)}" y="${py(0)}" width="${286 * s}" height="${380 * s}" fill="${FACEC}" stroke="${INKC}" stroke-width="1.3"/>`;
  o += clH(cx, cy, r176) + clV(cx, cy - r176 - 12, cy + r176 + 12);
  o += ci(cx, cy, r176) + ci(cx, cy, r145);
  o += dimH(g, oy - 44, px(0), R, '286', py(0));
  o += dimV(g, ox - M0, py(0), cy, '185', px(0));
  o += dimV(g, ox - M0 - GAP, py(0), B, '380', px(0));
  o += dimH(g, B + 34, px(0), cx, '180', B);
  o += diaV(g, cx, cy, r145, R + M0, '145');
  o += diaV(g, cx, cy, r176, R + M0 + GAP, '176');
  o += tx(px(8), oy - 16, 'FRONT', 0, 12) + ln(px(38), oy - 16, px(56), oy - 16, 0.8) + `<line x1="${px(56)}" y1="${oy - 16}" x2="${px(64)}" y2="${oy - 16}" stroke="${INKC}" stroke-width="0.8" marker-end="url(#da${g})"/>`;
  o += tx(cx, B + 62, '2×  (MIRRORED)', 0, 12);
  o += recessBlock(720, 120, [[176, 4.5]]);
  o += gridnote(g, 980, 648);
  return o + '</svg>';
}

function makeBack() {
  const g = 'bk', s = 1.32, ox = 250, oy = 74;
  const px = mm => ox + mm * s, py = mm => oy + mm * s;
  const cx = px(105), cy = py(330), R = px(210), B = py(380), rd = 40 * s;
  let o = sheet(g, 980, 660, s);
  o += `<rect x="${px(0)}" y="${py(0)}" width="${210 * s}" height="${380 * s}" fill="${FACEC}" stroke="${INKC}" stroke-width="1.3"/>`;
  o += clH(cx, cy, rd) + clV(cx, py(0) - 14, B + 14);
  o += ci(cx, cy, rd);
  [[-18, -15], [18, -15], [-18, 15], [18, 15]].forEach(v => { o += ci(px(105 + v[0]), py(330 + v[1]), 4 * s); });
  o += dimH(g, oy - 44, px(0), R, '210', py(0));
  o += dimV(g, ox - M0, py(0), B, '380', px(0));
  o += dimV(g, R + M0, py(0), cy, '330', R);
  o += diaV(g, cx, cy, rd, R + M0 + GAP, '80');
  o += dimH(g, B + 34, px(105 - 18), px(105 + 18), '36', py(330 + 15));
  o += dimV(g, cx - rd - 26, py(330 - 15), py(330 + 15), '30', px(105 - 18));
  o += tx(cx + rd + 34, cy, '4×Ø8', 0, 13);
  o += recessBlock(80, 120, [[80, 12]]);
  o += gridnote(g, 980, 660);
  return o + '</svg>';
}

function makeTopBottom() {
  const g = 'tb', s = 1.5, ox = 300, oy = 90;
  const px = mm => ox + mm * s, py = mm => oy + mm * s;
  let o = sheet(g, 980, 580, s);
  o += `<rect x="${px(0)}" y="${py(0)}" width="${172 * s}" height="${286 * s}" fill="${FACEC}" stroke="${INKC}" stroke-width="1.3"/>`;
  o += dimH(g, oy - 44, px(0), px(172), '172', py(0));
  o += dimV(g, ox - M0, py(0), py(286), '286', px(0));
  o += tx(px(86), py(286) + 42, '2×', 0, 13);
  o += gridnote(g, 980, 580);
  return o + '</svg>';
}

function makeBrace() {
  const g = 'br', s = 1.5, ox = 300, oy = 64;
  const px = mm => ox + mm * s, py = mm => oy + mm * s;
  const cx = px(86), R = px(172), rw = 65 * s;
  let o = sheet(g, 980, 600, s);
  o += `<rect x="${px(0)}" y="${py(0)}" width="${172 * s}" height="${342 * s}" fill="${FACEC}" stroke="${INKC}" stroke-width="1.3"/>`;
  [91, 246].forEach(y => { o += clH(cx, py(y), rw) + ci(cx, py(y), rw); });
  o += clV(cx, py(0) - 12, py(342) + 12);
  o += dimH(g, oy - 44, px(0), R, '172', py(0));
  o += dimV(g, ox - M0, py(0), py(342), '342', px(0));
  o += dimV(g, R + M0, py(0), py(91), '91', R);
  o += dimV(g, R + M0 + GAP, py(0), py(246), '246', R);
  o += diaV(g, cx, py(91), rw, R + M0 + GAP * 2, '130');
  o += gridnote(g, 980, 600);
  return o + '</svg>';
}

function makeFacetOp() {
  const g = 'fc', S = 6, fx = 430, fy = 150;
  let o = sheet(g, 980, 470, S);
  o += `<path d="M ${fx} ${fy + 15 * S} L ${fx + 15 * S} ${fy} L ${fx + 25 * S} ${fy} L ${fx + 25 * S} ${fy + 40 * S} L ${fx} ${fy + 40 * S} Z" fill="url(#ht${g})" stroke="${INKC}" stroke-width="1.3"/>`;
  o += dimH(g, fy - 26, fx, fx + 15 * S, '15', fy);
  o += dimH(g, fy - 26, fx + 15 * S, fx + 25 * S, '10', fy);
  o += dimV(g, fx + 25 * S + 30, fy, fy + 40 * S, '25', fx + 25 * S);
  (function () { const ax = fx, ay = fy + 15 * S, r = 40;
    o += `<path d="M ${ax} ${ay - r} A ${r} ${r} 0 0 0 ${ax + r * Math.cos(Math.PI / 4)} ${ay - r * Math.sin(Math.PI / 4)}" fill="none" stroke="${INKC}" stroke-width="0.6" marker-start="url(#da${g})" marker-end="url(#da${g})"/>`;
    o += tx(ax + 34, ay - 34, '45°', 0, 13); })();
  o += gridnote(g, 980, 470);
  return o + '</svg>';
}

const TABDEFS = [
  ['01 · Baffle', 'MDF 25 mm · qty 1 · 210 × 380', makeBaffle, null],
  ['02 · Side', 'MDF 19 mm · qty 2 mirrored · 286 × 380', makeSide, null],
  ['03 · Back', 'MDF 19 mm · qty 1 · 210 × 380', makeBack, null],
  ['04 · Top / Bottom', 'MDF 19 mm · qty 2 · 172 × 286', makeTopBottom, null],
  ['05 · Brace', 'MDF 19 mm · qty 1 · 172 × 342', makeBrace, null],
  ['06 · Facet operation', 'post-assembly · all 4 front edges', makeFacetOp, null],
];
const tabsBar = '<div class="tabs" role="tablist">' + TABDEFS.map((d, i) =>
  `<button class="tab" role="tab" data-tab="tp${i}" aria-selected="${i === 0 ? 'true' : 'false'}"><strong>${d[0]}</strong></button>`).join('') + '</div>';
const drawings = TABDEFS.map((d, i) =>
  `<div class="tpane${i === 0 ? ' on' : ''}" id="tp${i}" role="tabpanel"><figure class="draw"><figcaption><span>${d[1]}</span></figcaption>${d[2]()}${d[3] ? `<p class="note">${d[3]}</p>` : ''}</figure></div>`).join('\n');



const html = `<title>Apollo — YellowGrid audio lab</title>
<style>
:root{--yg:#FDF501;--bg:#0F0F0F;--panel:#161719;--ink:#FEFAF6;--mut:#A4A4A4;--line:#2A2B2E}
body{background:var(--bg);color:var(--ink);margin:0;font-family:Inter,'Segoe UI',system-ui,sans-serif;line-height:1.6}
.wrap{max-width:1020px;margin:0 auto;padding:0 22px 90px}
.mono{font-family:Consolas,ui-monospace,monospace;font-variant-numeric:tabular-nums}
.yel{color:var(--yg)}
header.hero{padding:64px 0 20px}
.brand{display:flex;align-items:center;gap:10px;font-weight:700;letter-spacing:0.06em;font-size:14px}
.langs{margin-left:auto;display:flex;gap:6px}
.langs button{font:inherit;font-size:12px;font-weight:600;padding:4px 12px;border:1px solid var(--line);background:var(--panel);color:var(--ink);cursor:pointer}
.langs button[aria-pressed="true"]{border-color:var(--yg);color:var(--yg)}
.langs button:focus-visible{outline:2px solid var(--yg);outline-offset:2px}
.brand .sq{width:14px;height:14px;background:var(--yg)}
.brand em{font-style:normal;color:var(--mut);font-weight:400}
h1{font-size:clamp(52px,9vw,96px);line-height:0.95;margin:22px 0 14px;font-weight:800;letter-spacing:-0.02em}
h1 .dot{color:var(--yg)}
.sub{max-width:60ch;color:var(--mut);font-size:17px;margin:0}
.tagrow{display:flex;gap:10px;flex-wrap:wrap;margin-top:22px}
.tag{border:1px solid var(--line);padding:5px 12px;font-size:12.5px;color:var(--mut)}
.tag b{color:var(--yg);font-weight:600}
section{margin-top:78px}
h2{display:flex;align-items:baseline;gap:12px;font-size:14px;letter-spacing:0.2em;text-transform:uppercase;font-weight:700;margin:0 0 8px;padding-bottom:10px;border-bottom:1px solid var(--line)}
h2 .n{color:var(--yg)}
.lede{color:var(--mut);max-width:72ch;margin:12px 0 24px;font-size:15px}
#stage{width:100%;height:560px;touch-action:none;cursor:grab;border:1px solid var(--line)}
#stage.bgw{background:radial-gradient(120% 100% at 50% 0%,#ffffff 0%,#e7e6e2 75%)}
#stage.bgb{background:radial-gradient(120% 100% at 50% 0%,#1a1b1e 0%,#0F0F0F 70%)}
.stagebar button{font:inherit;font-size:12px;font-weight:600;padding:4px 12px;border:1px solid var(--line);background:var(--panel);color:var(--ink);cursor:pointer}
.stagebar button[aria-pressed="true"]{border-color:var(--yg);color:var(--yg)}
.stagebar button:focus-visible{outline:2px solid var(--yg);outline-offset:2px}
.stagebar{display:flex;gap:18px;align-items:center;justify-content:space-between;flex-wrap:wrap;padding:12px 2px;color:var(--mut);font-size:13px}
.stagebar input[type=range]{accent-color:var(--yg);width:190px}
.palbar{display:flex;gap:28px;flex-wrap:wrap;padding:2px 2px 12px;color:var(--mut);font-size:13px}
.pal{display:flex;align-items:center;gap:8px}
.pal b{font-weight:600;color:var(--ink);font-size:12.5px;letter-spacing:0.08em;text-transform:uppercase}
.pal span{display:flex;gap:5px}
.sw{width:22px;height:22px;border:1px solid var(--line);padding:0;cursor:pointer}
.sw[aria-pressed="true"]{outline:2px solid var(--yg);outline-offset:1px}
.sw:focus-visible{outline:2px solid var(--yg);outline-offset:1px}
.pal input[type=color]{width:26px;height:24px;border:1px solid var(--line);background:none;padding:0;cursor:pointer}
.tabs{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 16px}
.tab{font:inherit;font-size:13px;padding:7px 14px;border:1px solid var(--line);background:var(--panel);color:var(--mut);cursor:pointer}
.tab strong{font-weight:600}
.tab[aria-selected="true"]{color:var(--yg);border-color:var(--yg)}
.tab:focus-visible{outline:2px solid var(--yg);outline-offset:2px}
.tpane{display:none}
.tpane.on{display:block}
figure.draw{margin:0;background:var(--panel);border:1px solid var(--line);padding:14px}
figure.draw figcaption{display:flex;justify-content:space-between;gap:10px;align-items:baseline;padding:2px 4px 12px;font-size:13px}
figure.draw strong{font-size:14px;font-weight:700;letter-spacing:0.04em}
figure.draw span{color:var(--mut);text-align:right}
figure.draw svg{display:block;width:100%;height:auto}
figure.draw .note{color:var(--mut);font-size:12.5px;margin:10px 4px 2px}
.parts{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:16px}
figure.part{margin:0;background:var(--panel);border:1px solid var(--line)}
figure.part img{width:100%;aspect-ratio:1;object-fit:cover;display:block;background:#fff}
figure.part figcaption{display:flex;flex-direction:column;gap:2px;padding:12px 14px 16px;font-size:12.5px}
figure.part strong{font-size:13px;font-weight:600}
figure.part span{color:var(--mut)}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:14px}
.stat{background:var(--panel);border:1px solid var(--line);padding:18px}
.stat b{display:block;font-size:28px;font-weight:800;letter-spacing:-0.01em;color:var(--yg)}
.stat i{font-style:normal;font-size:11.5px;letter-spacing:0.15em;text-transform:uppercase;color:var(--mut)}
footer{margin-top:84px;color:var(--mut);font-size:13px;border-top:1px solid var(--line);padding-top:18px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px}
@media (prefers-reduced-motion: reduce){#stage{cursor:default}}
</style>
<div class="wrap">
<header class="hero">
  <div class="brand"><span class="sq"></span>YELLOWGRID <em>· audio lab</em>
    <span class="langs"><button id="lEN" aria-pressed="true">EN</button><button id="lRO" aria-pressed="false">RO</button></span>
  </div>
  <h1>Apollo<span class="dot">.</span></h1>
  <p class="sub" data-i18n="sub">An active two-way monitor with gem-cut geometry. Purifi bass, SEAS DXT waveguide, four opposed passive radiators, DSP brain with eARC — engineered for the wall beside the television, tuned for the bottom octave.</p>
  <div class="tagrow">
    <span class="tag"><b>28 Hz</b> F6</span>
    <span class="tag"><b>0</b> ports</span>
    <span class="tag"><b>4 × 250 W</b> Ncore</span>
    <span class="tag"><b>210 × 380 × 330</b> mm</span>
    <span class="tag"><b>14 L</b> · 30 Hz tuning</span>
  </div>
</header>

<section>
  <h2><span class="n">01</span> Cabinet</h2>
  <p class="lede">Bare carcass with exact machining — every rebate at its real depth. Stone for the baffle and its facets, graphite for everything else. Drag to rotate; the slider opens the joinery: 25 mm baffle, 19 mm carcass, inset top and bottom, window brace, mirrored radiator rebates, four-post connector dish.</p>
  <div id="stage" role="img" aria-label="Interactive 3D model of the Apollo cabinet with explode control"></div>
  <div class="stagebar">
    <span>drag to rotate · auto-spins when idle</span>
    <span style="display:flex;align-items:center;gap:8px">explode <input id="xp" type="range" min="0" max="100" value="0" aria-label="Explode view"></span>
    <span style="display:flex;gap:8px"><button id="bgW" data-i18n="bgw" aria-pressed="true">White</button><button id="bgB" data-i18n="bgb" aria-pressed="false">Black</button></span>
    <span style="display:flex;gap:8px"><button id="drBare" data-i18n="drbare" aria-pressed="true">Bare</button><button id="drFit" data-i18n="drfit" aria-pressed="false">Fitted</button></span>
  </div>
  <div class="palbar">
    <div class="pal"><b>Baffle</b><span id="palBaffle"></span><input type="color" id="pickBaffle" value="#B3ADA3" aria-label="Custom baffle color"></div>
    <div class="pal"><b>Body</b><span id="palBody"></span><input type="color" id="pickBody" value="#363A41" aria-label="Custom body color"></div>
  </div>
</section>

<section>
  <h2><span class="n">02</span> Parts &amp; machining — all dimensions in mm</h2>
  <p class="lede">Six parts per cabinet, MDF, butt-jointed and glued. Facets are cut after assembly so the creases run unbroken across baffle and carcass. Rebate depths: woofer and radiators 4.5 mm, tweeter face 6 mm, connector dish 12 mm.</p>
${tabsBar}
  <div class="tpanes">
${drawings}
  </div>
</section>



<section>
  <h2><span class="n">03</span> System</h2>
  <div class="stats">
    <div class="stat"><b class="mono">28 Hz</b><i>F6 anechoic</i></div>
    <div class="stat"><b class="mono">103 dB</b><i>max @ 30 Hz / speaker</i></div>
    <div class="stat"><b class="mono">2.1 kHz</b><i>LR4 crossover, DSP</i></div>
    <div class="stat"><b class="mono">1–2 ms</b><i>latency — lip-sync safe</i></div>
    <div class="stat"><b class="mono">€3,700</b><i>system incl VAT</i></div>
    <div class="stat"><b class="mono">30 Hz</b><i>radiator tuning · +47 g/cone</i></div>
  </div>
</section>

<footer>
  <span><span class="yel">■</span> YELLOWGRID audio lab · Apollo</span>
  <span class="mono">active 2-way · 210 × 380 × 330 mm</span>
</footer>
</div>

<script>${three}</script>
<script>
(function(){
var stage=document.getElementById('stage');
var scene=new THREE.Scene();
var cam=new THREE.PerspectiveCamera(34,1,0.1,100);
cam.position.set(3.6,1.5,7.8);cam.lookAt(0,-0.1,0);
var ren=new THREE.WebGLRenderer({antialias:true,alpha:true});
ren.setPixelRatio(Math.min(window.devicePixelRatio,2));
ren.outputEncoding=THREE.sRGBEncoding;
ren.toneMapping=THREE.ACESFilmicToneMapping;
ren.toneMappingExposure=1.05;
ren.shadowMap.enabled=true;
ren.shadowMap.type=THREE.PCFSoftShadowMap;
stage.appendChild(ren.domElement);
var pm=new THREE.PMREMGenerator(ren);
(function(){
var env=new THREE.Scene();
function lightPlane(w,h,x,y,z,ry,rx,c){
var m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial());
m.material.color.setRGB(c,c,c);m.position.set(x,y,z);m.rotation.y=ry;m.rotation.x=rx;env.add(m);
}
lightPlane(8,8,0,9,0,0,Math.PI/2,7);
lightPlane(4,10,-9,2,0,Math.PI/2,0,2.6);
lightPlane(4,10,9,2,0,-Math.PI/2,0,1.1);
lightPlane(14,8,0,2,-9,0,0,0.45);
lightPlane(20,20,0,-6,0,0,-Math.PI/2,0.12);
scene.environment=pm.fromScene(env,0.04).texture;
})();
scene.add(new THREE.AmbientLight(0xffffff,0.12));
var d1=new THREE.DirectionalLight(0xfff6e8,1.55);
d1.position.set(7,4.5,2.5);
d1.castShadow=true;
d1.shadow.mapSize.set(2048,2048);
d1.shadow.camera.left=-4;d1.shadow.camera.right=4;
d1.shadow.camera.top=4;d1.shadow.camera.bottom=-4;
d1.shadow.camera.near=2;d1.shadow.camera.far=20;
d1.shadow.bias=-0.0004;d1.shadow.normalBias=0.01;
scene.add(d1);
var d2=new THREE.DirectionalLight(0xfdf501,0.06);d2.position.set(-6,-2,-3);scene.add(d2);
var d3=new THREE.DirectionalLight(0xeef2ff,0.30);d3.position.set(-4,1.5,6);scene.add(d3);
var ground=new THREE.Mesh(new THREE.CircleGeometry(6,64),new THREE.ShadowMaterial({opacity:0.32}));
ground.rotation.x=-Math.PI/2;ground.position.y=-2.06;ground.receiveShadow=true;
scene.add(ground);
var STONE=0xb3ada3,GRAPH=0x363a41;
var matStone=new THREE.MeshPhysicalMaterial({color:STONE,roughness:0.68,clearcoat:0.10,clearcoatRoughness:0.55,envMapIntensity:0.32,side:THREE.DoubleSide});
var matGraph=new THREE.MeshPhysicalMaterial({color:GRAPH,roughness:0.62,clearcoat:0.12,clearcoatRoughness:0.5,envMapIntensity:0.35,side:THREE.DoubleSide});
matStone.color.convertSRGBToLinear();matGraph.color.convertSRGBToLinear();
var matFacet=matStone.clone();
matFacet.color=matStone.color;
matFacet.roughness=0.45;matFacet.clearcoat=0.28;matFacet.clearcoatRoughness=0.3;matFacet.envMapIntensity=0.5;
function shapeOf(pts,holes){
var s=new THREE.Shape();
s.moveTo(pts[0][0],pts[0][1]);
for(var i=1;i<pts.length;i++)s.lineTo(pts[i][0],pts[i][1]);
s.closePath();
(holes||[]).forEach(function(h){var p=new THREE.Path();p.absarc(h[0],h[1],h[2],0,Math.PI*2,true);s.holes.push(p);});
return s;
}
function circShape(r,holes){
var s=new THREE.Shape();s.absarc(0,0,r,0,Math.PI*2,false);
(holes||[]).forEach(function(h){var p=new THREE.Path();p.absarc(h[0],h[1],h[2],0,Math.PI*2,true);s.holes.push(p);});
return s;
}
function panel(pts,holes,depth,faceMat){
var g=new THREE.ExtrudeGeometry(shapeOf(pts,holes),{depth:depth,bevelEnabled:false,curveSegments:48});
return new THREE.Mesh(g,faceMat);
}
function ring(inner,outer,mat){return new THREE.Mesh(new THREE.RingGeometry(inner,outer,56),mat);}
function quads(list,mat){
var v=[];list.forEach(function(q){v.push.apply(v,q[0]);v.push.apply(v,q[1]);v.push.apply(v,q[2]);v.push.apply(v,q[0]);v.push.apply(v,q[2]);v.push.apply(v,q[3]);});
var g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.computeVertexNormals();return new THREE.Mesh(g,mat);
}
var A=[-0.90,1.75,1.65],B=[0.90,1.75,1.65],C=[0.90,-1.75,1.65],D=[-0.90,-1.75,1.65];
var TL=[-1.05,1.90,1.50],TR=[1.05,1.90,1.50],BR=[1.05,-1.90,1.50],BL=[-1.05,-1.90,1.50];
var gF=new THREE.Group(),gR=new THREE.Group(),gL=new THREE.Group(),gRt=new THREE.Group(),gBr=new THREE.Group();
var front=panel([[-0.90,1.75],[0.90,1.75],[0.90,-1.75],[-0.90,-1.75]],[[0,0.90,0.525],[0,-0.75,0.88]],0.25,matStone);
front.position.z=1.40;gF.add(front);
var facets=quads([[A,B,TR,TL],[B,C,BR,TR],[C,D,BL,BR],[D,A,TL,BL]],matFacet);gF.add(facets);
var frOut=new THREE.Shape();
frOut.moveTo(-1.05,-1.90);frOut.lineTo(1.05,-1.90);frOut.lineTo(1.05,1.90);frOut.lineTo(-1.05,1.90);frOut.closePath();
var frIn=new THREE.Path();
frIn.moveTo(-0.90,1.75);frIn.lineTo(-0.90,-1.75);frIn.lineTo(0.90,-1.75);frIn.lineTo(0.90,1.75);frIn.closePath();
frOut.holes.push(frIn);
var frame=new THREE.Mesh(new THREE.ExtrudeGeometry(frOut,{depth:0.105,bevelEnabled:false}),matGraph);
frame.position.z=1.395;gF.add(frame);
var kh=new THREE.Shape();kh.absarc(0,0,0.525,0,Math.PI*2,false);
(function(){
var ex=0.085,ey=0.45,my=0.3553,R=0.365;
var hp=new THREE.Path();
hp.moveTo(ex,-my);hp.lineTo(ex,-ey);hp.lineTo(-ex,-ey);hp.lineTo(-ex,-my);
hp.absarc(0,0,R,Math.atan2(-my,-ex),Math.atan2(my,-ex),true);
hp.lineTo(-ex,ey);hp.lineTo(ex,ey);hp.lineTo(ex,my);
hp.absarc(0,0,R,Math.atan2(my,ex),Math.atan2(-my,ex),true);
kh.holes.push(hp);
})();
var f1=new THREE.Mesh(new THREE.ShapeGeometry(kh,48),matStone);
f1.position.set(0,0.90,1.59);gF.add(f1);
var f2=ring(0.725,0.88,matStone);f2.position.set(0,-0.75,1.605);gF.add(f2);

var rear=panel([[-1.05,1.90],[1.05,1.90],[1.05,-1.90],[-1.05,-1.90]],[[0,-1.40,0.40]],0.19,matGraph);
rear.position.z=-1.65;gR.add(rear);
var dishHoles=[[-0.18,-0.15,0.04],[0.18,-0.15,0.04],[-0.18,0.15,0.04],[0.18,0.15,0.04]];
var floorGeo=new THREE.ExtrudeGeometry(circShape(0.40,dishHoles),{depth:0.07,bevelEnabled:false,curveSegments:48});
var floor=new THREE.Mesh(floorGeo,matGraph);
floor.position.set(0,-1.40,-1.53);gR.add(floor);
function sidePanel(){return panel([[1.46,1.90],[-1.40,1.90],[-1.40,-1.90],[1.46,-1.90]],[[0.40,0.05,0.88]],0.19,matGraph);}
var sl=sidePanel();sl.rotation.y=Math.PI/2;sl.position.x=-1.05;gL.add(sl);
var fl=ring(0.725,0.88,matGraph);fl.rotation.y=-Math.PI/2;fl.position.set(-1.00,0.05,-0.40);gL.add(fl);
var sr=sidePanel();sr.rotation.y=Math.PI/2;sr.position.x=0.86;gRt.add(sr);
var fr=ring(0.725,0.88,matGraph);fr.rotation.y=Math.PI/2;fr.position.set(1.00,0.05,-0.40);gRt.add(fr);
var topM=new THREE.Mesh(new THREE.BoxGeometry(1.72,0.19,2.86),matGraph);
topM.position.set(0,1.805,-0.03);
var botM=new THREE.Mesh(new THREE.BoxGeometry(1.72,0.19,2.86),matGraph);
botM.position.set(0,-1.805,-0.03);
var brace=panel([[-0.86,1.71],[0.86,1.71],[0.86,-1.71],[-0.86,-1.71]],[[0,-0.75,0.65],[0,0.80,0.65]],0.19,matGraph);
brace.position.z=0.485;gBr.add(brace);
// ---- drivers: procedural, datasheet-dimensioned; canonical frame = facing +Z ----
// All rotations are baked into geometry (rotateX) so groups only translate/rotate as wholes.
function dlathe(prof,mat,seg){
var geo=new THREE.LatheGeometry(prof.map(function(p){return new THREE.Vector2(p[0],p[1]);}),seg||72);
geo.rotateX(Math.PI/2);
return new THREE.Mesh(geo,mat);
}
function dcyl(r,h,zc,mat){
var geo=new THREE.CylinderGeometry(r,r,h,48);
geo.rotateX(Math.PI/2);
var m=new THREE.Mesh(geo,mat);m.position.z=zc;return m;
}
function dring2(ri,ro,zc,mat){var m=new THREE.Mesh(new THREE.RingGeometry(ri,ro,72),mat);m.position.z=zc;return m;}
var dCone=new THREE.MeshStandardMaterial({color:0x3b3d40,roughness:0.55,metalness:0.15,side:THREE.DoubleSide});
var dSurr=new THREE.MeshStandardMaterial({color:0x141416,roughness:0.92,side:THREE.DoubleSide});
var dBlk =new THREE.MeshStandardMaterial({color:0x1b1d20,roughness:0.6,metalness:0.1,side:THREE.DoubleSide});
var dDome=new THREE.MeshStandardMaterial({color:0x3c4045,roughness:0.85,side:THREE.DoubleSide});
var dPR  =new THREE.MeshPhysicalMaterial({color:0x161719,roughness:0.45,clearcoat:0.35,clearcoatRoughness:0.35,side:THREE.DoubleSide});
var dMag =new THREE.MeshStandardMaterial({color:0x5a2226,roughness:0.55,metalness:0.25});
var dChr =new THREE.MeshStandardMaterial({color:0xcfd3d8,roughness:0.3,metalness:0.9});
[dCone,dSurr,dBlk,dDome,dPR,dMag,dChr].forEach(function(m){m.color.convertSRGBToLinear();});
var driverGroups=[];
function mountDriver(g,panel){g.visible=false;driverGroups.push(g);panel.add(g);}

// SEAS DXT: faceplate O104.2 x 6 flush, DXT lens flare, fabric dome, rear can O72
(function(){var g=new THREE.Group();g.name='drv_tweeter';
g.add(dlathe([[0.13,-0.068],[0.145,-0.068],[0.20,-0.055],[0.30,-0.030],[0.42,-0.002],[0.5245,-0.002],[0.5245,-0.060]],dBlk));
g.add(dlathe([[0,-0.040],[0.05,-0.046],[0.09,-0.056],[0.13,-0.068]],dDome,48));
g.add(dcyl(0.36,0.50,-0.31,dBlk));
g.position.set(0,0.90,1.652);mountDriver(g,gF);})();

// Purifi PTT6.5X04: flange O176 flush, corrugated surround, fiber cone, raised dome cap,
// basket frustum, maroon ring + black magnet stack (build-in ~85)
(function(){var g=new THREE.Group();g.name='drv_woofer';
g.add(dring2(0.725,0.879,0.002,dBlk));
g.add(dlathe([[0.725,0.002],[0.700,0.020],[0.672,0.008],[0.645,0.024],[0.618,0.010],[0.590,0.018],[0.565,0.010]],dSurr));
g.add(dlathe([[0.565,0.010],[0.44,-0.075],[0.30,-0.150],[0.185,-0.205]],dCone));
g.add(dlathe([[0.185,-0.205],[0.145,-0.150],[0.09,-0.098],[0,-0.072]],dCone,64));
g.add(dlathe([[0.86,-0.030],[0.74,-0.130],[0.56,-0.320],[0.50,-0.430]],dBlk));
g.add(dcyl(0.50,0.14,-0.50,dMag));
g.add(dcyl(0.50,0.28,-0.71,dBlk));
g.position.set(0,-0.75,1.650);mountDriver(g,gF);})();

// Purifi PTT6.5PR: convex satin dome, corrugated surround, shallow basket, M6 mass plug
function makePR(){var g=new THREE.Group();
g.add(dring2(0.725,0.879,0.002,dBlk));
g.add(dlathe([[0.725,0.002],[0.700,0.020],[0.672,0.008],[0.645,0.024],[0.618,0.010],[0.590,0.024]],dSurr));
g.add(dlathe([[0.590,0.024],[0.565,0.012],[0.44,-0.062],[0.30,-0.125],[0.185,-0.170]],dPR));
g.add(dlathe([[0.185,-0.170],[0.145,-0.120],[0.09,-0.075],[0,-0.050]],dPR,64));
g.add(dlathe([[0.86,-0.030],[0.72,-0.10],[0.56,-0.20],[0.50,-0.26]],dBlk));
g.add(dcyl(0.10,0.16,-0.30,dChr));
return g;}
(function(){var r=makePR();r.name='drv_pr_R';r.rotation.y=Math.PI/2;r.position.set(1.052,0.05,-0.40);mountDriver(r,gRt);
var l=makePR();l.name='drv_pr_L';l.rotation.y=-Math.PI/2;l.position.set(-1.052,0.05,-0.40);mountDriver(l,gL);})();

// Jantzen gold binding posts: 4x through the dish floor (top pair tweeter, bottom woofer)
var dGold=new THREE.MeshStandardMaterial({color:0xC8A24A,roughness:0.32,metalness:0.85});
var dRed =new THREE.MeshStandardMaterial({color:0x8a1f1f,roughness:0.5,metalness:0.1});
dGold.color.convertSRGBToLinear();dRed.color.convertSRGBToLinear();
(function(){
function makePost(ringMat){var p=new THREE.Group();
p.add(dcyl(0.065,0.030,-0.015,dGold));
p.add(dcyl(0.045,0.100,-0.080,dGold));
p.add(dcyl(0.055,0.025,-0.140,ringMat));
p.add(dcyl(0.050,0.030,-0.170,dGold));
return p;}
var gPosts=new THREE.Group();gPosts.name='drv_posts';
[[0.18,0.15,dRed],[-0.18,0.15,dBlk],[0.18,-0.15,dRed],[-0.18,-0.15,dBlk]].forEach(function(q){
var p=makePost(q[2]);p.position.set(q[0],q[1],0);gPosts.add(p);});
gPosts.position.set(0,-1.40,-1.53);
mountDriver(gPosts,gR);
})();

(function(){var db=document.getElementById('drBare'),df=document.getElementById('drFit');
function set(on){driverGroups.forEach(function(g){g.visible=on;});db.setAttribute('aria-pressed',String(!on));df.setAttribute('aria-pressed',String(on));try{localStorage.setItem('apolloDrivers',on?'1':'0');}catch(e){}}
db.addEventListener('click',function(){set(false);});df.addEventListener('click',function(){set(true);});
var v='0';try{v=localStorage.getItem('apolloDrivers')||'0';}catch(e){}set(v==='1');})();

var root=new THREE.Group();
[gF,gR,gL,gRt,gBr].forEach(function(g){root.add(g);});
root.add(topM);root.add(botM);
root.rotation.set(0.1,-0.5,0);root.position.y=-0.05;
root.traverse(function(m){if(m.isMesh){m.castShadow=true;m.receiveShadow=true;}});
scene.add(root);window.__root=root;
var t=0;
function applyX(){gF.position.z=1.5*t;gR.position.z=-1.3*t;gL.position.x=-1.4*t;gRt.position.x=1.4*t;gBr.position.z=0.5*t;topM.position.y=1.805+1.1*t;botM.position.y=-1.805-1.1*t;}
document.getElementById('xp').addEventListener('input',function(e){t=e.target.value/100;applyX();});
var PAL={
baffle:['#B3ADA3','#E8E4DC','#1E2023','#363A41','#2A3648','#6B6A55','#7A3B32','#FDF501'],
body:['#363A41','#17181B','#0F0F0F','#B3ADA3','#E8E4DC','#6E4B2A','#2A3648','#4A4E55']
};
var mats={baffle:matStone,body:matGraph};
var saved={};
try{saved=JSON.parse(localStorage.getItem('facetColors')||'{}');}catch(e){}
function setCol(role,hex){
mats[role].color.set(hex).convertSRGBToLinear();
saved[role]=hex;
try{localStorage.setItem('facetColors',JSON.stringify(saved));}catch(e){}
document.getElementById('pick'+(role==='baffle'?'Baffle':'Body')).value=hex;
var box=document.getElementById('pal'+(role==='baffle'?'Baffle':'Body'));
Array.prototype.forEach.call(box.children,function(b){b.setAttribute('aria-pressed',String(b.dataset.c.toLowerCase()===hex.toLowerCase()));});
}
['baffle','body'].forEach(function(role){
var box=document.getElementById('pal'+(role==='baffle'?'Baffle':'Body'));
PAL[role].forEach(function(c){
var b=document.createElement('button');
b.className='sw';b.style.background=c;b.dataset.c=c;
b.setAttribute('aria-label',role+' color '+c);b.setAttribute('aria-pressed','false');
b.addEventListener('click',function(){setCol(role,c);});
box.appendChild(b);
});
document.getElementById('pick'+(role==='baffle'?'Baffle':'Body')).addEventListener('input',function(e){setCol(role,e.target.value);});
setCol(role,saved[role]||PAL[role][0]);
});
var bW=document.getElementById('bgW'),bB=document.getElementById('bgB');
function setBg(m){
stage.classList.toggle('bgw',m==='w');stage.classList.toggle('bgb',m==='b');
bW.setAttribute('aria-pressed',String(m==='w'));bB.setAttribute('aria-pressed',String(m==='b'));
try{localStorage.setItem('facetBg',m);}catch(e){}
}
bW.addEventListener('click',function(){setBg('w');});
bB.addEventListener('click',function(){setBg('b');});
var bgm='w';try{bgm=localStorage.getItem('facetBg')||'w';}catch(e){}
setBg(bgm);
var drag=false,px=0,py=0,auto=true;
var el=ren.domElement;
el.addEventListener('pointerdown',function(e){drag=true;auto=false;px=e.clientX;py=e.clientY;stage.style.cursor='grabbing';el.setPointerCapture(e.pointerId);});
el.addEventListener('pointermove',function(e){if(!drag)return;
root.rotation.y+=(e.clientX-px)*0.008;
root.rotation.x=Math.max(-0.9,Math.min(0.9,root.rotation.x+(e.clientY-py)*0.006));
px=e.clientX;py=e.clientY;});
el.addEventListener('pointerup',function(){drag=false;stage.style.cursor='grab';});
var reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var visible=true;
if('IntersectionObserver' in window){
new IntersectionObserver(function(en){visible=en[0].isIntersecting;},{threshold:0}).observe(stage);
}
function size(){var w=stage.clientWidth,h=stage.clientHeight;ren.setSize(w,h);cam.aspect=w/h;cam.updateProjectionMatrix();}
size();
if(window.ResizeObserver)new ResizeObserver(size).observe(stage);
(function anim(){requestAnimationFrame(anim);if(!visible)return;if(auto&&!reduced)root.rotation.y+=0.0032;ren.render(scene,cam);})();
})();
</script>
`;
// ---------- i18n: EN default in markup, RO via dictionary ----------
const TR = {
  sub: ['An active two-way monitor with gem-cut geometry. Purifi bass, SEAS DXT waveguide, four opposed passive radiators, DSP brain with eARC — engineered for the wall beside the television, tuned for the bottom octave.',
        'Un monitor activ în două căi cu geometrie de piatră șlefuită. Bas Purifi, ghid de undă SEAS DXT, patru radiatoare pasive opuse, creier DSP cu eARC — gândit pentru peretele de lângă televizor, acordat pentru octava de jos.'],
  tag2: ['<b>0</b> ports', '<b>0</b> porturi'],
  tag5: ['<b>14 L</b> · 30 Hz tuning', '<b>14 L</b> · acord 30 Hz'],
  s1: ['Cabinet', 'Incinta'],
  s2: ['Parts &amp; machining — all dimensions in mm', 'Piese și prelucrări — toate cotele în mm'],
  s3: ['Drive units &amp; electronics', 'Difuzoare și electronică'],
  s4: ['System', 'Sistem'],
  l1: ['Bare carcass with exact machining — every rebate at its real depth. Stone for the baffle and its facets, graphite for everything else. Drag to rotate; the slider opens the joinery: 25 mm baffle, 19 mm carcass, inset top and bottom, window brace, mirrored radiator rebates, four-post connector dish.',
       'Carcasă goală, cu prelucrări exacte — fiecare falț la adâncimea lui reală. Piatră pentru panoul frontal și fațete, grafit pentru rest. Trage pentru a roti; cursorul desface îmbinările: panou frontal de 25 mm, carcasă de 19 mm, capac și bază încastrate, rigidizare cu ferestre, falțuri oglindite pentru radiatoare, cuvă de conectori cu patru borne.'],
  l2: ['Seven parts per cabinet, MDF, butt-jointed and glued. Facets are cut after assembly so the creases run unbroken across baffle and carcass. Rebate depths: woofer and radiators 4.5 mm, DXT face 6 mm in plate, connector dish 12 mm.',
       'Șase piese per incintă, MDF, îmbinate cap la cap și lipite. Fațetele se taie după asamblare, astfel încât muchiile trec neîntrerupt peste panoul frontal și carcasă. Adâncimi de falț: woofer și radiatoare 4,5 mm, fața tweeterului 6 mm, cuva de conectori 12 mm.'],
  l3: ['Single-source order, SoundImports, everything in stock 23 July 2026 — plus four pairs of Jantzen gold binding posts (~€23) for the connector dish.',
       'Comandă dintr-o singură sursă, SoundImports, totul în stoc la 23 iulie 2026 — plus patru perechi de borne aurite Jantzen (~23 €) pentru cuva de conectori.'],
  sb1: ['drag to rotate · auto-spins when idle', 'trage pentru rotire · se rotește singur în repaus'],
  bgw: ['White', 'Alb'],
  drbare: ['Bare', 'Gol'],
  drfit: ['Fitted', 'Cu difuzoare'],
  gridn: ['grid = 10 mm', 'caroiaj = 10 mm'],
  svA: ['cut at tweeter axis', 'secțiune la axul tweeterului'],
  svB: ['Ø73 thru', 'Ø73 străpuns'],
  svC: ['Ø150 recess', 'falț Ø150'],
  svD: ['floor 7 · posts Ø8 thru floor', 'fund 7 · borne Ø8 prin fund'],
  svE: ['edge detail (6:1)', 'detaliu muchie (6:1)'],
  svP: ['the Ø150×12 pocket seats the removable tweeter plate — tab 02', 'buzunarul Ø150×12 găzduiește placa demontabilă a tweeterului — tab 02'],
  bgb: ['Black', 'Negru'],
  xpl: ['explode', 'explodare'],
  palA: ['Baffle', 'Frontal'],
  palB: ['Body', 'Corp'],
  c1t: ['01 · Baffle', '01 · Panou frontal'], c2t: ['02 · Side', '02 · Lateral'],
  c3t: ['03 · Back', '03 · Spate'], c4t: ['04 · Top / Bottom', '04 · Capac / Bază'],
  c5t: ['05 · Brace', '05 · Rigidizare'], c6t: ['06 · Facet operation', '06 · Operația de fațetare'],
  m1: ['MDF 25 mm · qty 1 · 210 × 380', 'MDF 25 mm · buc 1 · 210 × 380'],
  m2: ['MDF/ply 12 mm · qty 1 + spare', 'MDF/placaj 12 mm · buc 1 + rezervă'],
  m3: ['MDF 19 mm · qty 2 mirrored · 286 × 380', 'MDF 19 mm · buc 2, oglindite · 286 × 380'],
  m4: ['MDF 19 mm · qty 1 · 210 × 380', 'MDF 19 mm · buc 1 · 210 × 380'],
  m5: ['MDF 19 mm · qty 2 · 172 × 286', 'MDF 19 mm · buc 2 · 172 × 286'],
  m6: ['MDF 19 mm · qty 1 · 172 × 342', 'MDF 19 mm · buc 1 · 172 × 342'],
  m7: ['post-assembly · all 4 front edges', 'după asamblare · toate cele 4 muchii frontale'],
  n2: ['Swappable: a second plate machined for the Purifi WG147 drops into the same Ø150 recess.',
       'Interschimbabilă: o a doua placă, frezată pentru Purifi WG147, intră în același falț Ø150.'],
  db1: ['dashed: facet creases — cut after assembly', 'punctat: muchiile fațetelor — tăiate după asamblare'],
  sv1: ['rec Ø105×6 · thru Ø73', 'falț Ø105×6 · străpuns Ø73'],
  sv16: ['DXT face Ø104.2', 'fața DXT Ø104,2'],
  sv2: ['rec Ø176×4.5 · thru Ø145', 'falț Ø176×4,5 · străpuns Ø145'],
  sv2b: ['rec Ø176×4.5 · thru Ø145', 'falț Ø176×5 · străpuns Ø145'],
  sv15: ['rec Ø105×6 · face Ø104.2', 'falț Ø105×6 · față Ø104,2'],
  sv3: ['thru Ø73 (DXT)', 'străpuns Ø73 (DXT)'],
  sv4: ['screws 4× Ø4.5 on Ø92 BC · terminal tabs span 85×17', 'șuruburi 4× Ø4,5 pe Ø92 · terminalele ocupă 85×17'],
  sv17: ['terminal slots 2× 17 wide, thru', 'sloturi terminale 2× lățime 17, străpunse'],
  sv5: ['Ø150 · t 12', 'Ø150 · g 12'],
  sv6: ['180 from FRONT edge', '180 de la muchia din FAȚĂ'],
  sv7: ['FRONT →', 'FAȚĂ →'],
  sv8: ['qty 2, MIRRORED pair · front edge faceted after assembly', 'buc 2, pereche OGLINDITĂ · muchia frontală fațetată după asamblare'],
  sv9: ['dish Ø80×12', 'cuvă Ø80×12'],
  sv10: ['binding posts: top pair = tweeter, bottom pair = woofer', 'borne: perechea de sus = tweeter, cea de jos = woofer'],
  sv11: ['qty 2 · no machining · inset between sides', 'buc 2 · fără prelucrări · încastrat între laterale'],
  sv12: ['97–117 mm behind front · lower window on the woofer axis', 'stă la 100 mm după panoul frontal, înaintea radiatoarelor'],
  sv13: ['w — 15 mm all around · terminates on baffle rim', 'w — sus 22 · laterale 24 → 11 (conic liniar) · bază 15'],
  sv14: ['flat planes only: rip at 45° or one CNC pass per edge', 'numai plane drepte: tăiere la 45° sau o trecere CNC pe muchie'],
  r1: ['Bass-midwoofer', 'Difuzor bas-mediu'],
  r2: ['Tweeter · DXT waveguide', 'Tweeter · ghid de undă DXT'],
  r3: ['4× passive radiators, opposed', '4× radiatoare pasive, opuse'],
  r4: ['DSP · eARC · CEC volume', 'DSP · eARC · volum din telecomanda TV (CEC)'],
  st1: ['F6 anechoic', 'F6 anecoic'],
  st2: ['max @ 30 Hz / speaker', 'maxim @ 30 Hz / boxă'],
  st3: ['LR4 crossover, DSP', 'crossover LR4, în DSP'],
  st4: ['latency — lip-sync safe', 'latență — sincron perfect cu imaginea'],
  st5: ['system incl VAT', 'sistem, cu TVA'],
  st6: ['radiator tuning · +47 g/cone', 'acord radiatoare · +47 g/con'],
  foot: ['<span class="yel">■</span> YELLOWGRID audio lab · Apollo',
         '<span class="yel">■</span> YELLOWGRID audio lab · Apollo'],
};
// annotate markup: insert data-i18n on the tag right before each EN string
let out = html;
function tagKey(needle, key, all) {
  const rep = needle.replace('>', ` data-i18n="${key}">`);
  out = all ? out.split(needle).join(rep) : out.replace(needle, rep);
}
tagKey('<p class="sub">An active', 'sub');
tagKey('<span class="tag"><b>0</b> ports', 'tag2');
tagKey('<span class="tag"><b>14 L</b> · 30 Hz tuning', 'tag5');
out = out.replace('</span> Cabinet</h2>', '</span> <span data-i18n="s1">Cabinet</span></h2>');
out = out.replace('</span> Parts &amp; machining — all dimensions in mm</h2>', '</span> <span data-i18n="s2">Parts &amp; machining — all dimensions in mm</span></h2>');
out = out.replace('</span> Drive units &amp; electronics</h2>', '</span> <span data-i18n="s3">Drive units &amp; electronics</span></h2>');
out = out.replace('</span> System</h2>', '</span> <span data-i18n="s4">System</span></h2>');
tagKey('<p class="lede">Bare carcass', 'l1');
tagKey('<p class="lede">Six parts', 'l2');
tagKey('<p class="lede">Single-source order', 'l3');
tagKey('<span>drag to rotate · auto-spins when idle</span>', 'sb1');
out = out.replace('gap:8px">explode <input', 'gap:8px"><span data-i18n="xpl">explode</span> <input');
tagKey('<b>Baffle</b>', 'palA');
tagKey('<b>Body</b>', 'palB');
[['01 · Baffle','c1t'],['02 · Side','c2t'],['03 · Back','c3t'],['04 · Top / Bottom','c4t'],['05 · Brace','c5t'],['06 · Facet operation','c6t']].forEach(p => tagKey(`<strong>${p[0]}</strong>`, p[1]));
[['MDF 25 mm · qty 1 · 210 × 380','m1'],['MDF/ply 12 mm · qty 1 + spare','m2'],['MDF 19 mm · qty 2 mirrored · 286 × 380','m3'],['MDF 19 mm · qty 1 · 210 × 380','m4'],['MDF 19 mm · qty 2 · 172 × 286','m5'],['MDF 19 mm · qty 1 · 172 × 342','m6'],['post-assembly · all 4 front edges','m7']].forEach(p => tagKey(`<span>${p[0]}</span>`, p[1]));
tagKey('<p class="note">Swappable', 'n2');
[['db1',TR.db1[0],false],['sv1',TR.sv1[0],false],['sv2',TR.sv2[0],true],['gridn',TR.gridn[0],true],['svA',TR.svA[0],false],['svB',TR.svB[0],false],['svC',TR.svC[0],false],['svD',TR.svD[0],false],['svE',TR.svE[0],false],['svP',TR.svP[0],false],['sv2b',TR.sv2b[0],false],['sv15',TR.sv15[0],false],['sv16',TR.sv16[0],false],['sv17',TR.sv17[0],false],['sv3',TR.sv3[0],false],['sv4',TR.sv4[0],false],['sv5',TR.sv5[0],false],['sv6',TR.sv6[0],false],['sv7',TR.sv7[0],true],['sv8',TR.sv8[0],false],['sv9',TR.sv9[0],false],['sv10',TR.sv10[0],false],['sv11',TR.sv11[0],false],['sv12',TR.sv12[0],false],['sv13',TR.sv13[0],false],['sv14',TR.sv14[0],false]].forEach(p => tagKey(`>${p[1]}</text>`, p[0], p[2]));
[['Bass-midwoofer','r1'],['Tweeter · DXT waveguide','r2'],['4× passive radiators, opposed','r3'],['DSP · eARC · CEC volume','r4']].forEach(p => tagKey(`<span>${p[0]}</span>`, p[1]));
[['F6 anechoic','st1'],['max @ 30 Hz / speaker','st2'],['LR4 crossover, DSP','st3'],['latency — lip-sync safe','st4'],['system incl VAT','st5'],['radiator tuning · +47 g/cone','st6']].forEach(p => tagKey(`<i>${p[0]}</i>`, p[1]));
tagKey('<span><span class="yel">■', 'foot');
const dict = { en: {}, ro: {} };
Object.keys(TR).forEach(k => { dict.en[k] = TR[k][0]; dict.ro[k] = TR[k][1]; });
out += `
<script>
(function(){
var I18N=${JSON.stringify(dict)};
var bEN=document.getElementById('lEN'),bRO=document.getElementById('lRO');
function setLang(l){
document.documentElement.lang=(l==='ro')?'ro':'en';
document.querySelectorAll('[data-i18n]').forEach(function(el){
var v=I18N[l][el.dataset.i18n];
if(v==null)return;
if(el.namespaceURI==='http://www.w3.org/2000/svg')el.textContent=v;else el.innerHTML=v;
});
bEN.setAttribute('aria-pressed',String(l==='en'));
bRO.setAttribute('aria-pressed',String(l==='ro'));
try{localStorage.setItem('facetLang',l);}catch(e){}
}
bEN.addEventListener('click',function(){setLang('en');});
bRO.addEventListener('click',function(){setLang('ro');});
var l='en';try{l=localStorage.getItem('facetLang')||'en';}catch(e){}
if(l==='ro')setLang('ro');
})();
(function(){
var tabs=document.querySelectorAll('.tab');
tabs.forEach(function(b){b.addEventListener('click',function(){
tabs.forEach(function(x){x.setAttribute('aria-selected','false');});
document.querySelectorAll('.tpane').forEach(function(p){p.classList.remove('on');});
b.setAttribute('aria-selected','true');
document.getElementById(b.dataset.tab).classList.add('on');
});});
})();
<\/script>
`;
fs.mkdirSync('D:/claude/speakers/s400ish/site', { recursive: true });
const page = '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
  out.replace(/^(<title>.*?<\/title>)/s, '$1\n</head>\n<body>') + '\n</body>\n</html>\n';
fs.writeFileSync('D:/claude/speakers/s400ish/site/index.html', page);
fs.writeFileSync('D:/claude/speakers/s400ish/site/facet_site.html', out);
console.log('written index.html', (page.length / 1024).toFixed(0) + ' KB');
