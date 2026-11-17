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

function wordWrap(ctx, text, maxW) {
  const words = text.split(" ");
  const lines = [];
  let cur = "";
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(test).width > maxW && cur) {
      lines.push(cur);
      cur = w;
    } else cur = test;
  }
  if (cur) lines.push(cur);
  return lines;
}

// Wraps subhead/body text preferring a break at a natural clause
// boundary (a comma) over an arbitrary mid-phrase word wrap - a line
// break mid-clause ("Upper Room / Fellowship kitchen") reads far worse
// than one between whole clauses ("Drop-off November 21, / 8 to 10 AM,
// Upper Room Fellowship kitchen"). A literal \n in the text (a manual
// break, same as wrapText's allowLineBreaks) is honored first and takes
// priority over this - each resulting segment gets its own clause pass.
export function wrapSubtext(ctx, text, font, maxW) {
  ctx.font = font;
  if (text.includes('\n')) {
    return text.split('\n').flatMap(line => (line.trim() ? wrapSubtext(ctx, line, font, maxW) : ['']));
  }

  const clauses = text.split(',').map((c, i, arr) => (i < arr.length - 1 ? `${c.trim()},` : c.trim())).filter(Boolean);
  if (clauses.length <= 1) return wordWrap(ctx, text, maxW);

  const lines = [];
  let cur = "";
  for (const clause of clauses) {
    const test = cur ? `${cur} ${clause}` : clause;
    if (!cur || ctx.measureText(test).width <= maxW) {
      cur = test;
    } else {
      lines.push(cur);
      cur = clause;
    }
  }
  if (cur) lines.push(cur);

  // A clause-packed line can still itself be too wide (one very long
  // clause with no commas of its own) - word-wrap just that line rather
  // than the whole text, so short clauses elsewhere stay un-split.
  return lines.flatMap(line => (ctx.measureText(line).width > maxW ? wordWrap(ctx, line, maxW) : [line]));
}

// Finds the largest font size at which `text`, greedily word-wrapped at
// `targetW`, keeps every line's rendered width within targetW (wrapText
// never breaks a single overlong first word, so that case is caught here
// by measuring the actual widest line rather than trusting the wrap
// alone) while its total height still fits maxH.
//
// More lines means less width to fill per line, so simply maximizing
// font size over every possible line count would often prefer MORE
// lines even for short text (e.g. splitting a two-word title onto two
// single-word lines lets each word individually grow bigger than the
// two-word phrase could as one line) - a layout mistake, not a bigger,
// bolder headline. Capping how many lines get tried at roughly one per
// two words rules that out; within that cap, every line count from 1
// up is still tried and the biggest font size found at any of them
// wins, so a genuinely long title still wraps into as many lines as it
// takes to stay reasonably large rather than shrinking to fit on one.
export function fitTextToWidth(ctx, text, fontFamily, weight, targetW, maxH, lineSpacing, {minSize = 24, maxSize = 800, step = 2} = {}) {
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const maxLineCount = Math.max(1, Math.floor(wordCount / 2));

  let best = null;
  for (let allowedLines = 1; allowedLines <= maxLineCount; allowedLines++) {
    for (let size = maxSize; size >= minSize; size -= step) {
      const font = `${weight} ${size}px ${fontFamily}`;
      const lines = wrapText(ctx, text, font, targetW);
      if (lines.length > allowedLines) continue;
      const lineHeightPx = size * lineSpacing;
      const totalH = lines.length * lineHeightPx;
      const widest = Math.max(...lines.map(l => ctx.measureText(l).width));
      if (widest <= targetW + 0.5 && totalH <= maxH) {
        if (!best || size > best.fontSize) best = {lines, fontSize: size, lineHeightPx};
        break; // largest size at this line count found - try the next count
      }
    }
  }
  if (best) return best;
  // Nothing fit at any line count up to the cap, even at minSize (an
  // extreme edge case, e.g. a single very long word) - render at
  // minSize anyway rather than show nothing.
  const font = `${weight} ${minSize}px ${fontFamily}`;
  return {lines: wrapText(ctx, text, font, targetW), fontSize: minSize, lineHeightPx: minSize * lineSpacing};
}

// Splits `text` into exactly two lines, preferring a split between whole
// clauses (comma-separated) closest to the midpoint - the same "whole
// clause per line" preference as wrapSubtext, just always exactly two
// groups instead of however many a width constraint happens to produce.
// Falls back to a word-boundary split closest to the midpoint when the
// text has no comma; a single word can't be split into two lines at all
// and comes back as one.
function splitIntoTwoLines(text) {
  const pickBestSplit = (parts) => {
    if (parts.length < 2) return null;
    let bestIdx = 1, bestDiff = Infinity;
    for (let i = 1; i < parts.length; i++) {
      const a = parts.slice(0, i).join(' ');
      const b = parts.slice(i).join(' ');
      const diff = Math.abs(a.length - b.length);
      if (diff < bestDiff) { bestDiff = diff; bestIdx = i; }
    }
    return [parts.slice(0, bestIdx).join(' '), parts.slice(bestIdx).join(' ')];
  };

  const clauses = text.split(',').map((c, i, arr) => (i < arr.length - 1 ? `${c.trim()},` : c.trim())).filter(Boolean);
  const clauseSplit = clauses.length >= 2 ? pickBestSplit(clauses) : null;
  if (clauseSplit) return clauseSplit;

  const wordSplit = pickBestSplit(text.split(' ').filter(Boolean));
  return wordSplit || [text];
}

// Sizes `text` as a single line at the largest size (up to maxSize) that
// keeps it within targetW - fitSubtextToTwoLines' fallback for whenever
// splitting into two lines wouldn't actually get any closer to the
// width target than one line already does.
function fitSingleLine(ctx, text, styledWeight, fontFamily, targetW, {minSize, maxSize, step}) {
  for (let size = maxSize; size >= minSize; size -= step) {
    const font = `${styledWeight} ${size}px ${fontFamily}`;
    ctx.font = font;
    if (ctx.measureText(text).width <= targetW + 0.5) {
      return {lines: [text], fontSize: size, font};
    }
  }
  return {lines: [text], fontSize: minSize, font: `${styledWeight} ${minSize}px ${fontFamily}`};
}

// Sizes the subtext at the largest font size whose wider line still fits
// within targetW - so it reads big and consistently fills close to the
// same fraction of the slide's width no matter how long the actual text
// is. Prefers exactly two lines (see splitIntoTwoLines), but only when
// splitting actually buys something: if even the very first (largest)
// size tried already fits comfortably under targetW as two lines, the
// text was short enough that it never needed to shrink to get there -
// meaning the split isn't reaching toward the width target at all, just
// sitting under it, and one full-width line (fewer, longer lines need a
// smaller size to cover the same width) gets closer to - or reaches -
// that target than two half-width lines capped at the same size ever
// could. Also falls back to one line outright when the text has too few
// words to split into two at all.
export function fitSubtextToTwoLines(ctx, text, fontFamily, weight, italic, targetW, {minSize = 20, maxSize = 160, step = 2} = {}) {
  const lines = splitIntoTwoLines(text);
  const styledWeight = italic ? `italic ${weight}` : `${weight}`;

  if (lines.length === 2) {
    for (let size = maxSize; size >= minSize; size -= step) {
      const font = `${styledWeight} ${size}px ${fontFamily}`;
      ctx.font = font;
      const widest = Math.max(...lines.map(l => ctx.measureText(l).width));
      if (widest <= targetW + 0.5) {
        if (size === maxSize) break; // never had to shrink - the split isn't earning its keep
        return {lines, fontSize: size, font};
      }
    }
  }
  return fitSingleLine(ctx, text, styledWeight, fontFamily, targetW, {minSize, maxSize, step});
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
