/* ------------------------------------------------------------------
   composeFramedDP — draws the framed DP to an offscreen canvas at high
   resolution and triggers a PNG download. Mirrors the on-screen
   FrameCanvas layout: gradient background, circular photo (70% box,
   white ring), then either the uploaded frame PNG or the SVG text ring.
------------------------------------------------------------------ */

const SIZE = 1080; // output resolution (square)

function loadImage(src, crossOrigin) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (crossOrigin) img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// Draw the same SVG text ring used on-screen, as an image, so the fallback
// frame also appears in the download.
function ringSvgDataUrl() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 360" width="360" height="360">
    <defs>
      <path id="rt" d="M 180,180 m -150,0 a 150,150 0 1 1 300,0" fill="none"/>
      <path id="rb" d="M 180,180 m -130,0 a 130,130 0 0 0 260,0" fill="none"/>
    </defs>
    <text fill="#fff" font-family="sans-serif" font-weight="800" font-size="20" letter-spacing="2">
      <textPath href="#rt" startOffset="6%">RAIN CONFERENCE '26 \u00b7 ANOTHER MEASURE</textPath>
    </text>
    <text fill="#fff" font-family="sans-serif" font-weight="700" font-size="13" letter-spacing="2">
      <textPath href="#rb" startOffset="14%">ABUJA JUNE 26\u201328 \u00b7 LAGOS JULY 3\u20135</textPath>
    </text>
  </svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

export async function composeFramedDP({ photo, frameUrl, x = 0, y = 0, scale = 1, rotation = 0 }) {
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d");

  // Apply rotation about the canvas center (mirrors the CSS rotate on the
  // preview, which spins the whole framed disc). 90° steps stay corner-clean.
  if (rotation) {
    ctx.translate(SIZE / 2, SIZE / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-SIZE / 2, -SIZE / 2);
  }

  // 1. gradient background (matches the on-screen blue gradient)
  const g = ctx.createLinearGradient(0, 0, SIZE, SIZE);
  g.addColorStop(0, "#8aa4c8");
  g.addColorStop(0.45, "#5b7da8");
  g.addColorStop(1, "#33576f");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // soft highlight
  const rg = ctx.createRadialGradient(SIZE * 0.7, SIZE * 0.25, 0, SIZE * 0.7, SIZE * 0.25, SIZE * 0.5);
  rg.addColorStop(0, "rgba(255,255,255,0.35)");
  rg.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = rg;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // 2. circular photo — the on-screen circle is 70% of the box
  const circleD = SIZE * 0.70;
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const r = circleD / 2;

  // white ring behind the photo — preview uses an 8px border on the circle,
  // which is ~3% of the circle diameter; mirror that here.
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r + circleD * 0.03, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.fill();
  ctx.restore();

  if (photo) {
    const img = await loadImage(photo, false);
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();

    // Mirror the preview EXACTLY:
    //  - object-fit: cover into the circle's bounding box (circleD square)
    //  - translate by x/y as a FRACTION of the circle box
    //  - scale about the center
    const cover = Math.max(circleD / img.width, circleD / img.height);
    const baseW = img.width * cover;
    const baseH = img.height * cover;
    // scale about center
    const drawW = baseW * scale;
    const drawH = baseH * scale;
    // center of the circle box, plus fractional offset (x,y are fractions of circleD)
    const centerX = cx + (x || 0) * circleD;
    const centerY = cy + (y || 0) * circleD;
    const dx = centerX - drawW / 2;
    const dy = centerY - drawH / 2;
    ctx.drawImage(img, dx, dy, drawW, drawH);
    ctx.restore();
  }

  // 3. frame overlay — uploaded PNG, or the SVG text ring fallback
  let frameImg = null;
  try {
    frameImg = frameUrl
      ? await loadImage(frameUrl, true)
      : await loadImage(ringSvgDataUrl(), false);
  } catch (_) {
    // if a remote frame fails CORS, fall back to the ring
    try { frameImg = await loadImage(ringSvgDataUrl(), false); } catch (_) {}
  }
  if (frameImg) {
    // contain-fit the frame across the full square
    ctx.drawImage(frameImg, 0, 0, SIZE, SIZE);
  }

  // 4. export
  return await new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/png");
  });
}

export async function downloadFramedDP(opts) {
  const blob = await composeFramedDP(opts);
  if (!blob) return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "rain-conference-dp.png";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
