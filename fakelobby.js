/**
 * ZYNORA - Fake Lobby (.fakeff & .fakeml)
 * Taruh file ini di samping index.js, aset di ./assets/{fakeff,fakeml,fonts}
 */
const fs = require("fs");
const path = require("path");

const ASSETS = path.join(__dirname, "assets");
const FF_DIR = path.join(ASSETS, "fakeff");
const ML_DIR = path.join(ASSETS, "fakeml");
const FONT_DIR = path.join(ASSETS, "fonts");

const readJson = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
let FF_META = null, ML_META = null;
const ffMeta = () => (FF_META ||= readJson(path.join(FF_DIR, "meta.json")));
const mlMeta = () => (ML_META ||= readJson(path.join(ML_DIR, "meta.json")));

// ---------- Font ----------
const FF_FONT = "FFName", ML_FONT = "MLName";
let fontsReady = false;
async function setupFonts(canvasLib, getBuf) {
  if (fontsReady) return;
  const G = canvasLib.GlobalFonts;
  const reg = (p, n) => { try { return fs.existsSync(p) && !!G.registerFromPath(p, n); } catch { return false; } };
  reg(path.join(FONT_DIR, "Inter-Regular.otf"), ML_FONT);
  // Nama FF: Rajdhani (mirip game). Kalau belum ada, coba unduh sekali; gagal -> pakai TeX Gyre Heros Cn.
  const raj = ["Rajdhani-SemiBold.ttf", "Rajdhani-Bold.ttf"].map((f) => path.join(FONT_DIR, f));
  let ok = raj.some((p) => reg(p, FF_FONT));
  if (!ok && getBuf) {
    try {
      const p = raj[0];
      const buf = await getBuf("https://raw.githubusercontent.com/google/fonts/main/ofl/rajdhani/Rajdhani-SemiBold.ttf", {}, { timeout: 15000 });
      if (buf?.length > 20000) { fs.writeFileSync(p, buf); ok = reg(p, FF_FONT); }
    } catch {}
  }
  if (!ok) reg(path.join(FONT_DIR, "texgyreheroscn-bold.otf"), FF_FONT);
  fontsReady = true;
}

// ---------- Parser argumen ----------
const GENDER = {
  l: "l", cowok: "l", cowo: "l", pria: "l", laki: "l", lakilaki: "l", boy: "l", male: "l", m: "l",
  p: "p", cewek: "p", cewe: "p", wanita: "p", perempuan: "p", girl: "p", female: "p", f: "p",
};

/** Pisahkan "Nama|a|b" atau "Nama a b" -> { name, rest[] } (rest = token pilihan di belakang nama) */
function splitArgs(args, isOption, maxRest) {
  args = String(args || "").trim();
  if (args.includes("|")) {
    const [name, ...rest] = args.split("|").map((s) => s.trim());
    return { name, rest: rest.filter(Boolean) };
  }
  const words = args.split(/\s+/).filter(Boolean), rest = [];
  while (words.length > 1 && rest.length < maxRest && isOption(words[words.length - 1].toLowerCase())) rest.unshift(words.pop().toLowerCase());
  return { name: words.join(" "), rest };
}

function parseFF(args) {
  const meta = ffMeta();
  const { name, rest } = splitArgs(args, (w) => w in GENDER || /^\d$/.test(w), 2);
  let gender = "l", design = 1;
  for (const r of rest) {
    const t = r.toLowerCase().replace(/[^a-z0-9]/g, "");
    const mt = t.match(/^([a-z]*?)(\d)$/); // "cowok2" / "l3"
    if (mt && (mt[1] === "" || mt[1] in GENDER)) { if (mt[1]) gender = GENDER[mt[1]]; design = +mt[2]; }
    else if (t in GENDER) gender = GENDER[t];
    else return { error: `Pilihan "${r}" tidak dikenali.` };
  }
  const list = meta.models[gender];
  if (!name) return { error: "Nama kosong." };
  if (design < 1 || design > list.length) return { error: `Desain ${gender === "l" ? "cowok" : "cewek"} hanya 1-${list.length}.` };
  return { name, gender, design, file: list[design - 1] };
}

function rankKey(w) {
  const t = String(w || "").toLowerCase().replace(/[^a-z]/g, "");
  const al = mlMeta().aliases;
  for (const k of Object.keys(al)) if (k === t || al[k].includes(t)) return k;
  return null;
}

function parseML(args) {
  const meta = mlMeta();
  const { name, rest } = splitArgs(args, (w) => !!rankKey(w), 2);
  if (!name) return { error: "Nama kosong." };
  let rank = null, border = null;
  if (rest[0]) { rank = rankKey(rest[0]); if (!rank) return { error: `Rank "${rest[0]}" tidak dikenali.` }; }
  if (rest[1]) { border = rankKey(rest[1]); if (!border) return { error: `Border "${rest[1]}" tidak dikenali.` }; }
  rank = rank || meta.ranks[0];
  return { name, rank, border: border || rank };
}

// ---------- Gambar ----------
const imgCache = new Map();
async function loadAsset(canvasLib, file) {
  if (!imgCache.has(file)) imgCache.set(file, fs.readFileSync(file));
  return canvasLib.loadImage(imgCache.get(file));
}

/** Gambar foto ke kotak [x,y,w,h] dengan mode "cover" */
function drawCover(ctx, img, x, y, w, h) {
  const sc = Math.max(w / img.width, h / img.height);
  const dw = img.width * sc, dh = img.height * sc;
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  ctx.restore();
}

/** FF: ganti nama di lobi. Mengembalikan Buffer JPEG */
async function makeFakeFF(canvasLib, { name, file }) {
  const meta = ffMeta().files[file];
  const bg = await loadAsset(canvasLib, path.join(FF_DIR, file + ".jpg"));
  const c = canvasLib.createCanvas(meta.w, meta.h), ctx = c.getContext("2d");
  ctx.drawImage(bg, 0, 0, meta.w, meta.h);

  const bw = meta.tx1 - meta.tx0, bh = meta.ty1 - meta.ty0;
  // Ukuran font: tinggi huruf besar ~ 85% tinggi kotak; kecilkan bila nama terlalu lebar
  let size = bh * 1.18;
  const font = (s) => `${s}px "${FF_FONT}"`;
  ctx.font = font(size);
  const w0 = ctx.measureText(name).width;
  if (w0 > bw) { size *= bw / w0; ctx.font = font(size); }
  const m = ctx.measureText(name);

  // Lapisan teks terpisah supaya bisa diberi gradasi emas + grain
  const pad = Math.ceil(size * 0.3);
  const lw = Math.ceil(Math.min(bw, m.width) + pad * 2), lh = Math.ceil(bh + pad * 2);
  const layer = canvasLib.createCanvas(lw, lh), lc = layer.getContext("2d");
  lc.font = font(size); lc.textAlign = "center"; lc.textBaseline = "alphabetic";
  // baseline: huruf kapital dipusatkan vertikal di kotak
  const cap = m.actualBoundingBoxAscent || size * 0.7;
  const baseline = pad + bh / 2 + cap / 2;
  // sedikit bayangan gelap agar terbaca seperti di game
  lc.shadowColor = "rgba(60,25,0,0.55)"; lc.shadowBlur = size * 0.06; lc.shadowOffsetY = size * 0.03;
  lc.fillStyle = "#000"; lc.fillText(name, lw / 2, baseline);
  lc.shadowColor = "transparent";
  // gradasi vertikal (stops dari meta) hanya pada piksel huruf
  lc.globalCompositeOperation = "source-in";
  const g = lc.createLinearGradient(0, pad + bh / 2 - cap / 2, 0, pad + bh / 2 + cap / 2);
  for (const [p, col] of meta.stops) g.addColorStop(p, col);
  lc.fillStyle = g; lc.fillRect(0, 0, lw, lh);
  // grain mengikuti foto asli (jangan kelihatan "bersih" sendiri)
  if (meta.grain) {
    const id = lc.getImageData(0, 0, lw, lh), d = id.data, a = meta.grain;
    for (let i = 0; i < d.length; i += 4) {
      if (!d[i + 3]) continue;
      const n = (Math.random() - 0.5) * 2 * a;
      d[i] = Math.max(0, Math.min(255, d[i] + n)); d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + n)); d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + n));
    }
    lc.globalCompositeOperation = "source-over"; lc.putImageData(id, 0, 0);
  }
  ctx.drawImage(layer, (meta.tx0 + meta.tx1) / 2 - lw / 2, meta.ty0 - pad);
  return c.toBuffer("image/jpeg", 92);
}

/** ML: ganti nama, foto profil, rank & border. Mengembalikan Buffer JPEG */
async function makeFakeML(canvasLib, { name, rank, border, avatar }) {
  const meta = mlMeta();
  const base = await loadAsset(canvasLib, path.join(ML_DIR, `base_${rank}.png`));
  const ring = await loadAsset(canvasLib, path.join(ML_DIR, `ring_${border}.png`));
  const c = canvasLib.createCanvas(meta.w, meta.h), ctx = c.getContext("2d");
  ctx.drawImage(base, 0, 0, meta.w, meta.h);

  const [ax, ay, aw, ah] = meta.avatarRect;
  let av = null;
  if (avatar) { try { av = await canvasLib.loadImage(avatar); } catch {} }
  if (av) drawCover(ctx, av, ax, ay, aw, ah);
  else { // tanpa foto: siluet abu-abu
    ctx.fillStyle = "#3a4a63"; ctx.fillRect(ax, ay, aw, ah);
    ctx.fillStyle = "#8d9bb3"; ctx.beginPath(); ctx.arc(ax + aw / 2, ay + ah * 0.40, aw * 0.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(ax + aw / 2, ay + ah * 0.95, aw * 0.38, ah * 0.32, 0, Math.PI, 0); ctx.fill();
  }
  const [rx, ry, rx1, ry1] = meta.ringBox;
  ctx.drawImage(ring, rx, ry, rx1 - rx, ry1 - ry);

  // Nama: rata tengah di pita, tinggi huruf kapital = capH, kecilkan bila kepanjangan
  const n = meta.name, maxW = n.x1 - n.x0;
  const CAP_RATIO = 0.727; // tinggi huruf kapital Inter
  let size = n.capH / CAP_RATIO;
  ctx.font = `${size}px "${ML_FONT}"`;
  const w = ctx.measureText(name).width;
  if (w > maxW) { size *= maxW / w; ctx.font = `${size}px "${ML_FONT}"`; }
  ctx.fillStyle = n.color; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
  ctx.fillText(name, (n.x0 + n.x1) / 2, n.baseline);
  return c.toBuffer("image/jpeg", 92);
}

const FF_USAGE = `🔥 *FAKE LOBBY FREE FIRE*
Format: *.fakeff <nama>|<gender>|<desain>*

• Gender: *cowok* / *cewek*
• Desain: cowok *1-4*, cewek *1-3*

Contoh:
*.fakeff Zynora|cowok|2*
*.fakeff Zynora|cewek|3*
_(Tanpa gender & desain = cowok desain 1)_`;

const ML_USAGE = `⚔️ *FAKE LOBBY MOBILE LEGENDS*
Format: *.fakeml <nama>|<rank>|<border>*

• Rank: *immortal* / *glory* / *honor* / *mawi*
• Border: sama seperti rank (kosong = ikut rank)
• 📷 Kirim / reply foto = foto profil. Tanpa foto, dipakai foto profil WhatsApp-mu.

Contoh:
*.fakeml Zynora|immortal|glory*
*.fakeml Zynora|mawi*`;

module.exports = { setupFonts, parseFF, parseML, makeFakeFF, makeFakeML, FF_USAGE, ML_USAGE };
