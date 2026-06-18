/* ------------------------------------------------------------------
   composeFramedDP — draws the framed DP to an offscreen canvas at high
   resolution and triggers a PNG download. Mirrors the on-screen
   FrameCanvas layout: gradient background, circular photo (70% box,
   white ring), then either the uploaded frame PNG or the SVG text ring.
------------------------------------------------------------------ */


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

export async function composeFramedDP({
  photo, frameUrl, x = 0, y = 0, scale = 1, rotation = 0,
  shape = "circle", ratio = "square", slot = null,
}) {
  const W = 1080;
  const H = ratio === "portrait" ? 1350 : 1080;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  // Default slot: a centered circle (legacy behaviour) when none is given.
  // slot fractions are of the WHOLE canvas: {x,y,w,h} with 0..1.
  const s = slot || (shape === "circle"
    ? { x: 0.15, y: (H - 0.70 * W) / 2 / H, w: 0.70, h: (0.70 * W) / H }
    : { x: 0.08, y: 0.08, w: 0.84, h: 0.84 });
  const slotX = s.x * W, slotY = s.y * H, slotW = s.w * W, slotH = s.h * H;

  if (rotation) {
    ctx.translate(W / 2, H / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-W / 2, -H / 2);
  }

  // Background only matters when there is NO frame PNG (legacy ring look).
  if (!frameUrl) {
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, "#8aa4c8"); g.addColorStop(0.45, "#5b7da8"); g.addColorStop(1, "#33576f");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const rg = ctx.createRadialGradient(W * 0.7, H * 0.25, 0, W * 0.7, H * 0.25, Math.max(W, H) * 0.5);
    rg.addColorStop(0, "rgba(255,255,255,0.35)"); rg.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
  }

  // ---- draw the user's photo into the slot, masked to shape ----
  if (photo) {
    const img = await loadImage(photo, false);
    ctx.save();
    ctx.beginPath();
    if (shape === "circle") {
      const r = Math.min(slotW, slotH) / 2;
      ctx.arc(slotX + slotW / 2, slotY + slotH / 2, r, 0, Math.PI * 2);
    } else {
      const rad = Math.min(slotW, slotH) * 0.06; // gentle rounded corners
      roundRect(ctx, slotX, slotY, slotW, slotH, rad);
    }
    ctx.clip();

    // cover-fit into the slot box, then user's fractional x/y offset + scale.
    const cover = Math.max(slotW / img.width, slotH / img.height);
    const drawW = img.width * cover * scale;
    const drawH = img.height * cover * scale;
    const cxp = slotX + slotW / 2 + (x || 0) * slotW;
    const cyp = slotY + slotH / 2 + (y || 0) * slotH;
    ctx.drawImage(img, cxp - drawW / 2, cyp - drawH / 2, drawW, drawH);
    ctx.restore();

    // subtle white ring for circle shape (matches preview)
    if (shape === "circle") {
      ctx.save();
      ctx.beginPath();
      const r = Math.min(slotW, slotH) / 2;
      ctx.lineWidth = Math.min(slotW, slotH) * 0.03;
      ctx.strokeStyle = "rgba(255,255,255,0.92)";
      ctx.arc(slotX + slotW / 2, slotY + slotH / 2, r - ctx.lineWidth / 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  // ---- frame on top ----
  let frameImg = null;
  try {
    frameImg = frameUrl ? await loadImage(frameUrl, true) : await loadImage(ringSvgDataUrl(), false);
  } catch (_) {
    if (!frameUrl) { try { frameImg = await loadImage(ringSvgDataUrl(), false); } catch (_) {} }
  }
  if (frameImg) ctx.drawImage(frameImg, 0, 0, W, H);

  return await new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/png"));
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
export async function downloadFramedDP(opts) {
  const blob = await composeFramedDP(opts);
  if (!blob) return null;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "rain-conference-dp.png";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return blob;
}
