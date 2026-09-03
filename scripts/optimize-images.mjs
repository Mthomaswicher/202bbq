// Generates responsive AVIF/WebP/JPEG renditions + tiny blur placeholders for the
// site's photography. Run once (npm run images) after adding or replacing a photo.
//
// Source photos live in  assets/photos/  (originals, never served).
// Output goes to         public/img/     (served) and src/data/images.json (manifest).
import sharp from 'sharp';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const OUT = path.join(ROOT, 'public/img');
const MANIFEST = path.join(ROOT, 'src/data/images.json');

// name → { src, widths, formats }
const IMAGES = {
  'brisket-slice': { src: 'assets/photos/hero-brisket.jpg', widths: [480, 800, 1200, 1600] },
  'brisket-board': { src: 'assets/photos/hero-ribs.jpg',    widths: [480, 800, 1024] },
  'chicken-egg':   { src: 'assets/photos/hero-chicken.jpg', widths: [480, 800, 1200, 1600] },
  'pork-butt':     { src: 'assets/photos/hero-pork.jpg',    widths: [480, 800, 1024] },
  'pitmaster':     { src: 'assets/photos/about-photo.jpg',         widths: [480, 600] },
  'logo':          { src: 'assets/logo.png',                widths: [80, 160, 320, 640], formats: ['webp', 'png'] },
  'right-proper':  { src: 'assets/right-proper-logo.png', widths: [320, 640], formats: ['webp', 'png'] },
};

const DEFAULT_FORMATS = ['avif', 'webp', 'jpg'];
const ENCODE = {
  avif: img => img.avif({ quality: 55, effort: 6 }),
  webp: img => img.webp({ quality: 78 }),
  jpg:  img => img.jpeg({ quality: 78, mozjpeg: true, progressive: true }),
  png:  img => img.png({ compressionLevel: 9, palette: true }),
};

await mkdir(OUT, { recursive: true });
const manifest = {};

for (const [name, cfg] of Object.entries(IMAGES)) {
  const input = path.join(ROOT, cfg.src);
  const base = sharp(input).rotate(); // applies EXIF orientation, strips metadata
  const meta = await base.metadata();
  const { width: srcW, height: srcH } = await base.clone().toBuffer({ resolveWithObject: true }).then(r => r.info);
  const formats = cfg.formats ?? DEFAULT_FORMATS;
  const widths = cfg.widths.filter(w => w <= srcW);
  if (widths.length === 0) widths.push(srcW);

  const entry = { width: srcW, height: srcH, aspect: +(srcW / srcH).toFixed(4), widths, formats, sources: {} };
  for (const fmt of formats) {
    entry.sources[fmt] = [];
    for (const w of widths) {
      const file = `${name}-${w}.${fmt}`;
      await ENCODE[fmt](base.clone().resize({ width: w, withoutEnlargement: true })).toFile(path.join(OUT, file));
      entry.sources[fmt].push(`/img/${file}`);
    }
  }
  // 24px blurred placeholder as a data URI (used for background while loading)
  const lqip = await base.clone().resize({ width: 24 }).blur(1).webp({ quality: 40 }).toBuffer();
  entry.lqip = `data:image/webp;base64,${lqip.toString('base64')}`;
  // dominant colour, handy for backgrounds
  const { dominant } = await base.clone().stats();
  entry.color = `#${[dominant.r, dominant.g, dominant.b].map(c => c.toString(16).padStart(2, '0')).join('')}`;
  manifest[name] = entry;
  console.log(`${name.padEnd(14)} ${srcW}x${srcH} (exif ${meta.orientation ?? '-'}) → ${widths.join('/')} × ${formats.join('/')}`);
}

await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
console.log(`\nmanifest → ${path.relative(ROOT, MANIFEST)}`);
