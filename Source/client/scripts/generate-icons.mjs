import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

const svg = await readFile(join(publicDir, 'icon.svg'));

const sizes = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'icon-maskable-512.png', size: 512, padding: 64 },
  { name: 'apple-touch-icon.png', size: 180 },
];

for (const { name, size, padding = 0 } of sizes) {
  const inner = size - padding * 2;
  let pipeline = sharp(svg).resize(inner, inner);
  if (padding > 0) {
    pipeline = pipeline.extend({
      top: padding,
      bottom: padding,
      left: padding,
      right: padding,
      background: { r: 99, g: 102, b: 241, alpha: 1 },
    });
  }
  const png = await pipeline.png().toBuffer();
  await writeFile(join(publicDir, name), png);
  console.log(`Generated ${name} (${size}x${size})`);
}
