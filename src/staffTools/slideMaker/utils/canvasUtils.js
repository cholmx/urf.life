import {SW, SH, CORNER_R} from '../constants/data';

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// Downscales the image onto a tiny offscreen canvas and averages its
// perceived luminance (0 = black, 1 = white) - cheap way to decide whether
// an auto-picked background texture reads as "dark" or "light" overall,
// without caring about its exact pixel dimensions.
export function averageBrightness(img) {
  const size = 16;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, size, size);
  const {data} = ctx.getImageData(0, 0, size, size);
  let total = 0;
  for (let i = 0; i < data.length; i += 4) {
    total += (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;
  }
  return total / (size * size);
}

export function wrapText(ctx,text,font,maxW,allowLineBreaks=false) {
  ctx.font=font;

  // Handle manual line breaks if allowed
  if (allowLineBreaks && text.includes('\n')) {
    const manualLines = text.split('\n');
    const allLines = [];
    for (const manualLine of manualLines) {
      if (!manualLine.trim()) {
        allLines.push('');
        continue;
      }
      const words = manualLine.split(" ");
      let cur = "";
      for (const w of words) {
        const test = cur ? cur + " " + w : w;
        if (ctx.measureText(test).width > maxW && cur) {
          allLines.push(cur);
          cur = w;
        } else cur = test;
      }
      if (cur) allLines.push(cur);
    }
    return allLines;
  }

  // Original wrapping logic
  const words=text.split(" "),lines=[];
  let cur="";
  for (const w of words) {
    const test=cur ? cur + " " + w : w;
    if (ctx.measureText(test).width > maxW && cur) {
      lines.push(cur);
      cur=w;
    } else cur=test;
  }
  if (cur) lines.push(cur);
  return lines;
}

/**
 * Auto-fit text: wraps text at maxW, then shrinks font size until all lines
 * fit within maxH (or minimum font size reached). Returns { lines, fontSize, lineHeightPx }.
 * @param {object} ctx - canvas 2d context
 * @param {string} text - text to fit
 * @param {number} baseSize - starting font size in px
 * @param {string} fontFamily - CSS font-family string
 * @param {number} weight - font weight number
 * @param {number} maxW - max width in px
 * @param {number} maxH - max height in px
 * @param {number} lineSpacing - line height multiplier (e.g. 1.12)
 * @returns {{lines: string[], fontSize: number, lineHeightPx: number}}
 */
export function autoFitText(ctx, text, baseSize, weight, fontFamily, maxW, maxH, lineSpacing) {
  let size = baseSize;
  const minSize = Math.max(24, Math.floor(baseSize * 0.3));
  let lines = [];
  let lineHeightPx = size * lineSpacing;

  while (size >= minSize) {
    const font = `${weight} ${size}px ${fontFamily}`;
    lines = wrapText(ctx, text, font, maxW);
    lineHeightPx = size * lineSpacing;
    const totalH = lines.length * lineHeightPx;
    if (totalH <= maxH) break;
    size -= 2;
  }

  return { lines, fontSize: size, lineHeightPx };
}

export function drawLines(ctx,lines,x,y,font,fill,align,lineH,letterSpacing=0) {
  ctx.fillStyle=fill;
  ctx.font=font;
  ctx.textAlign=align;
  ctx.textBaseline="top";
  ctx.letterSpacing = letterSpacing ? `${letterSpacing}px` : "0px";
  lines.forEach((l,i)=> ctx.fillText(l,x,y + i * lineH));
  ctx.letterSpacing = "0px";
  return y + lines.length * lineH;
}

export function blockHeight(lines,lineH) {
  return lines.length * lineH;
}

export function sharpenCanvas(source) {
  const w = source.width, h = source.height;
  const out = document.createElement("canvas");
  out.width = w; out.height = h;
  const ctx = out.getContext("2d");
  ctx.drawImage(source, 0, 0);

  const src = ctx.getImageData(0, 0, w, h);
  const dst = ctx.createImageData(w, h);
  const s = src.data, d = dst.data;

  const kernel = [
     0, -0.1,    0,
    -0.1, 1.4, -0.1,
     0, -0.1,    0,
  ];

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      for (let c = 0; c < 3; c++) {
        let v = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const ny = Math.min(Math.max(y + ky, 0), h - 1);
            const nx = Math.min(Math.max(x + kx, 0), w - 1);
            v += s[(ny * w + nx) * 4 + c] * kernel[(ky + 1) * 3 + (kx + 1)];
          }
        }
        d[i + c] = Math.min(255, Math.max(0, v));
      }
      d[i + 3] = s[i + 3];
    }
  }

  ctx.putImageData(dst, 0, 0);
  return out;
}

export function clipRounded(ctx, w = SW, h = SH, r = CORNER_R) {
  if (r === 0) {
    ctx.beginPath();
    ctx.rect(0, 0, w, h);
    ctx.closePath();
    return;
  }
  ctx.beginPath();
  ctx.moveTo(r,0);
  ctx.lineTo(w - r,0);
  ctx.quadraticCurveTo(w,0,w,r);
  ctx.lineTo(w,h - r);
  ctx.quadraticCurveTo(w,h,w - r,h);
  ctx.lineTo(r,h);
  ctx.quadraticCurveTo(0,h,0,h - r);
  ctx.lineTo(0,r);
  ctx.quadraticCurveTo(0,0,r,0);
  ctx.closePath();
}

/**
 * Draws an overlay on top of the background photo.
 * @param {object} ctx - canvas 2d context
 * @param {number} cw - canvas width
 * @param {number} ch - canvas height
 * @param {string} bgColor - hex color for the overlay tint
 * @param {number} ov - overlay strength (20-90, maps to opacity %)
 */
export function drawOverlay(ctx, cw, ch, bgColor, ov) {
  const overlayColor = bgColor.match(/\w\w/g)?.map(x => parseInt(x, 16)) || [0,0,0];
  const alpha = ov / 100;
  ctx.fillStyle = `rgba(${overlayColor[0]},${overlayColor[1]},${overlayColor[2]},${alpha})`;
  ctx.fillRect(0, 0, cw, ch);
}
