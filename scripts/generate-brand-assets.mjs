/**
 * Renders public/brand SVG marks into PNG/ICO assets for PWA + favicon.
 * Run: node scripts/generate-brand-assets.mjs
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const brandDir = path.join(root, "public", "brand");

async function renderSvg(svgPath, size) {
  const svg = await readFile(svgPath);
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: size },
    background: "transparent",
  });
  return resvg.render().asPng();
}

async function writePng(name, png) {
  const out = path.join(brandDir, name);
  await writeFile(out, png);
  console.log("wrote", path.relative(root, out));
}

await mkdir(brandDir, { recursive: true });

const mark = path.join(brandDir, "logo-mark.svg");
const maskable = path.join(brandDir, "logo-mark-maskable.svg");

await writePng("icon-192.png", await renderSvg(mark, 192));
await writePng("icon-512.png", await renderSvg(mark, 512));
await writePng("icon-maskable-512.png", await renderSvg(maskable, 512));
await writePng("apple-touch-icon.png", await renderSvg(mark, 180));
await writePng("favicon-32.png", await renderSvg(mark, 32));
await writePng("og.png", await renderOg());

/** Simple OG card from SVG string */
async function renderOg() {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
      <stop stop-color="#EAF0EC"/>
      <stop offset="0.55" stop-color="#F3F6F4"/>
      <stop offset="1" stop-color="#F8EDE8"/>
    </linearGradient>
    <linearGradient id="mark" x1="120" y1="160" x2="360" y2="420" gradientUnits="userSpaceOnUse">
      <stop stop-color="#3A8A74"/>
      <stop offset="1" stop-color="#2F6F5E"/>
    </linearGradient>
    <linearGradient id="egg" x1="210" y1="250" x2="270" y2="330" gradientUnits="userSpaceOnUse">
      <stop stop-color="#F0D48A"/>
      <stop offset="1" stop-color="#D4A84B"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="980" cy="80" r="220" fill="#D4846A" fill-opacity="0.12"/>
  <circle cx="80" cy="560" r="180" fill="#2F6F5E" fill-opacity="0.1"/>
  <rect x="120" y="165" width="220" height="220" rx="56" fill="url(#mark)"/>
  <path d="M155 340c22-55 55-85 90-95 35 10 68 40 90 95-35 22-58 32-90 32s-55-10-90-32Z" fill="#F4FBF7"/>
  <ellipse cx="245" cy="278" rx="28" ry="34" fill="url(#egg)"/>
  <circle cx="300" cy="220" r="10" fill="#D4846A"/>
  <text x="400" y="290" fill="#1A221E" font-family="Nunito, ui-rounded, system-ui, sans-serif" font-size="92" font-weight="800" letter-spacing="-0.03em">MyNinho</text>
  <text x="400" y="360" fill="#5C6B63" font-family="Nunito, ui-rounded, system-ui, sans-serif" font-size="36" font-weight="600">O ninho da sua família</text>
</svg>`;
  const resvg = new Resvg(Buffer.from(svg), {
    fitTo: { mode: "width", value: 1200 },
  });
  return resvg.render().asPng();
}

// favicon.ico as PNG fallback copied — browsers accept PNG named .ico poorly;
// also write favicon.png and keep ico as 32px PNG bytes for simplicity
const fav32 = await renderSvg(mark, 32);
await writeFile(path.join(brandDir, "favicon.ico"), fav32);
console.log("wrote public/brand/favicon.ico (png bytes)");
