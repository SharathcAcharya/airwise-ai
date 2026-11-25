import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function generateAssets() {
  const original = path.join(process.cwd(), 'public', 'Airwise AI Eco-Tech Logo.png');
  
  if (!fs.existsSync(original)) {
    throw new Error('Original logo not found at ' + original);
  }

  // 1. Full logo cropped tightly to artwork bounds:
  // Artwork bounds from our analysis: left: 59, top: 83, width: 1418, height: 752
  const pad = 24;
  const left = Math.max(0, 59 - pad);
  const top = Math.max(0, 83 - pad);
  const width = Math.min(1536 - left, 1418 + pad * 2);
  const height = Math.min(1024 - top, 752 + pad * 2);

  console.log('Cropping full logo:', { left, top, width, height });
  await sharp(original)
    .extract({ left, top, width, height })
    .png({ compressionLevel: 9 })
    .toFile(path.join(process.cwd(), 'public', 'airwise-logo-full.png'));
  console.log('Created public/airwise-logo-full.png');

  // 2. Icon emblem:
  // Top emblem: X: 385 to 1185 (width 801), Y: 83 to 556 (height 474). Center: 785, 319.5
  const ePad = 16;
  const eLeft = Math.max(0, 385 - ePad);
  const eTop = Math.max(0, 83 - ePad);
  const eWidth = Math.min(1536 - eLeft, 801 + ePad * 2);
  const eHeight = Math.min(1024 - eTop, 474 + ePad * 2);

  console.log('Cropping emblem:', { eLeft, eTop, eWidth, eHeight });
  
  const emblemBuffer = await sharp(original)
    .extract({ left: eLeft, top: eTop, width: eWidth, height: eHeight })
    .toBuffer();

  // Place into a square 512x512 canvas with transparent background
  await sharp(emblemBuffer)
    .resize(512, 512, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png({ compressionLevel: 9 })
    .toFile(path.join(process.cwd(), 'public', 'airwise-logo-icon.png'));
  console.log('Created public/airwise-logo-icon.png');

  // Next.js App Router icons
  await sharp(emblemBuffer)
    .resize(512, 512, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toFile(path.join(process.cwd(), 'app', 'icon.png'));

  await sharp(emblemBuffer)
    .resize(180, 180, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toFile(path.join(process.cwd(), 'app', 'apple-icon.png'));

  // Create favicon-32x32.png
  await sharp(emblemBuffer)
    .resize(32, 32, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toFile(path.join(process.cwd(), 'public', 'favicon-32x32.png'));
  console.log('Created app/icon.png, app/apple-icon.png, public/favicon-32x32.png');

  // 3. OpenGraph Social Card (1200x630)
  const logoResized = await sharp(path.join(process.cwd(), 'public', 'airwise-logo-full.png'))
    .resize(960, 520, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  const ogBgSvg = Buffer.from(`
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bg" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stop-color="#39414B" />
          <stop offset="60%" stop-color="#23272B" />
          <stop offset="100%" stop-color="#181B1E" />
        </radialGradient>
        <radialGradient id="glow" cx="50%" cy="40%" r="40%">
          <stop offset="0%" stop-color="#4BA9FF" stop-opacity="0.18" />
          <stop offset="60%" stop-color="#3D7AB2" stop-opacity="0.08" />
          <stop offset="100%" stop-color="#23272B" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="1200" height="630" fill="url(#bg)" />
      <rect width="1200" height="630" fill="url(#glow)" />
      <rect x="24" y="24" width="1152" height="582" rx="20" fill="none" stroke="#677580" stroke-opacity="0.4" stroke-width="1.5" />
    </svg>
  `);

  await sharp(ogBgSvg)
    .composite([{ input: logoResized, gravity: 'center' }])
    .png()
    .toFile(path.join(process.cwd(), 'public', 'airwise-og.png'));
  console.log('Created public/airwise-og.png');

  // Also create a light-container logo asset if needed for high-contrast card embedding:
  // e.g. public/airwise-logo-card.png
  const cardLogoBuffer = await sharp(path.join(process.cwd(), 'public', 'airwise-logo-full.png'))
    .resize(800, null, { fit: 'contain' })
    .toBuffer();
  
  await sharp(cardLogoBuffer).toFile(path.join(process.cwd(), 'public', 'airwise-logo-card.png'));
  console.log('Created public/airwise-logo-card.png');
}

generateAssets().then(() => {
  console.log('All brand assets generated successfully!');
}).catch(err => {
  console.error('Asset generation failed:', err);
  process.exit(1);
});
