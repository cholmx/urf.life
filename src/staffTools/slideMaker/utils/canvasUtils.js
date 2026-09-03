import {SW, SH, CORNER_R} from '../constants/data';

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
 * @param {boolean} uppercase
 * @returns {{lines: string[], fontSize: number, lineHeightPx: number}}
 */
export function autoFitText(ctx, text, baseSize, weight, fontFamily, maxW, maxH, lineSpacing, uppercase) {
  const formatted = uppercase ? text.toUpperCase() : text;
  let size = baseSize;
  const minSize = Math.max(24, Math.floor(baseSize * 0.3));
  let lines = [];
  let lineHeightPx = size * lineSpacing;

  while (size >= minSize) {
    const font = `${weight} ${size}px ${fontFamily}`;
    lines = wrapText(ctx, formatted, font, maxW);
    lineHeightPx = size * lineSpacing;
    const totalH = lines.length * lineHeightPx;
    if (totalH <= maxH) break;
    size -= 2;
  }

  return { lines, fontSize: size, lineHeightPx };
}

export function bgLuminance(hex) {
  const c = hex.replace('#','').match(/\w\w/g)?.map(x => {
    const v = parseInt(x,16)/255;
    return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055,2.4);
  }) || [0,0,0];
  return 0.2126*c[0] + 0.7152*c[1] + 0.0722*c[2];
}

/**
 * Relative luminance of a color (0 = black, 1 = white).
 */
export function relativeLuminance(hex) {
  return bgLuminance(hex);
}

/**
 * WCAG contrast ratio between two hex colors. Returns a number 1-21.
 */
export function contrastRatio(hex1, hex2) {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Checks if text color has sufficient contrast against the effective background.
 * When a photo is present with overlay, the effective background is darker.
 * Returns { ok, ratio, threshold }.
 */
export function checkContrast(textColor, bgColor, hasPhoto, overlayStrength) {
  let effectiveBg = bgColor;
  if (hasPhoto) {
    // With a photo + overlay, effective background gets darker proportional to overlay
    const bgRgb = hexToRgb(bgColor);
    const factor = overlayStrength / 100;
    effectiveBg = rgbToHex(
      Math.round(bgRgb.r * (1 - factor)),
      Math.round(bgRgb.g * (1 - factor)),
      Math.round(bgRgb.b * (1 - factor))
    );
  }
  const ratio = contrastRatio(textColor, effectiveBg);
  const threshold = 3.0; // WCAG AA for large text
  return { ok: ratio >= threshold, ratio, threshold };
}

function hexToRgb(hex) {
  const m = hex.replace('#','').match(/\w\w/g);
  if (!m) return { r: 0, g: 0, b: 0 };
  return { r: parseInt(m[0], 16), g: parseInt(m[1], 16), b: parseInt(m[2], 16) };
}

function rgbToHex(r, g, b) {
  const toHex = (v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function shadowColorForBg(bgHex) {
  return bgLuminance(bgHex) < 0.35 ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.55)';
}

export function drawLines(ctx,lines,x,y,font,fill,align,lineH,letterSpacing=0,shadowColor=null) {
  ctx.fillStyle=fill;
  ctx.font=font;
  ctx.textAlign=align;
  ctx.textBaseline="top";
  ctx.letterSpacing = letterSpacing ? `${letterSpacing}px` : "0px";
  if (shadowColor) {
    ctx.shadowColor = shadowColor;
    ctx.shadowBlur = 48;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 12;
  }
  lines.forEach((l,i)=> ctx.fillText(l,x,y + i * lineH));
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
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
