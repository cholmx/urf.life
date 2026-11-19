import {wrapText,wrapSubtext,drawLines,blockHeight} from './canvasUtils';

const hw = (brand, fallback) => brand.hWeight ?? fallback;
const bw = (brand, fallback) => brand.bWeight ?? fallback;

// The headline/subhead's literal font size (at canvas width 2560 - see
// SW in constants/data.js, the only canvas width this app ever renders
// at) when a font pairing's own hSizeScale/bSizeScale is 1. Multiplied
// by that scale (set per pairing in the Fonts tab) to get the size
// actually used - a pairing set to a given size renders at that same
// literal size on every slide, whatever that slide's own title/subtext
// text happens to be. This replaced an earlier "size the text to fill a
// target width" approach, which looked inconsistent across slides: a
// short title would stretch to a visibly bigger font than a long one
// even on the exact same pairing, since both were being sized to fill
// the same width rather than to a fixed size.
const BASE_HEADLINE_SIZE = 150;
const BASE_SUBTEXT_SIZE = 72;

const HEADLINE_LINE_SPACING = 1.08;
const SUBTEXT_LINE_SPACING = 1.15;

// Safety net only - renders at the pairing's literal target size unless
// that would overflow maxH (an unusually long title at a large
// hSizeScale), in which case it shrinks just enough to fit rather than
// running text off the slide. Wrapping itself is left entirely to wrapFn
// (wrapText for the headline, wrapSubtext for the subhead - see below)
// at whatever size is settled on, so line count follows naturally from
// the text and the available width instead of being chosen to maximize
// font size the way the old width-fill search did.
function fitFixedSize(ctx, text, fontFamily, styledWeight, targetSize, maxW, maxH, lineSpacing, wrapFn = wrapText, minSize = 20, step = 4) {
  let size = Math.max(minSize, Math.round(targetSize));
  let lines, lineHeightPx, totalH;
  for (;;) {
    const font = `${styledWeight} ${size}px ${fontFamily}`;
    lines = wrapFn(ctx, text, font, maxW);
    lineHeightPx = size * lineSpacing;
    totalH = lines.length * lineHeightPx;
    if (totalH <= maxH || size <= minSize) break;
    size -= step;
  }
  return {lines, fontSize: size, lineHeightPx, font: `${styledWeight} ${size}px ${fontFamily}`};
}

function computeHeadline(ctx, data, brand, maxW, weight) {
  const rawHeadText = data.line1 || "YOUR TEXT HERE";
  // hUppercase is purely a render-time transform for display faces that
  // read as all-caps by design (set per pairing in the Fonts tab - see
  // FontsTab.jsx) - it never touches data.line1 itself, so the
  // announcement's actual title stays normal-case everywhere else (the
  // editor's own text field, the queue list, etc).
  const headText = brand.hUppercase ? rawHeadText.toUpperCase() : rawHeadText;
  const fontFamily = brand.hFont;
  // The automatic slide maker's font pairing decides this per slide (see
  // computeAutoSlide); DEFAULT_BRAND's own fallback is upright.
  const styledWeight = brand.hItalic ? `italic ${weight}` : `${weight}`;

  const ch = ctx.canvas.height;
  const maxH = ch * 0.55;
  const targetSize = BASE_HEADLINE_SIZE * (brand.hSizeScale ?? 1);
  const result = fitFixedSize(ctx, headText, fontFamily, styledWeight, targetSize, maxW, maxH, HEADLINE_LINE_SPACING);
  return {
    lines: result.lines,
    headLH: result.lineHeightPx,
    headFont: result.font,
    headFontSize: result.fontSize,
  };
}

// Caps how wide a subtext line is allowed to wrap - narrower than the
// headline's own content-box width so it reads as a secondary, quieter
// block rather than a second headline, independent of brand.bSizeScale
// (which sets how BIG it renders, not how wide it's allowed to wrap).
const SUBTEXT_WRAP_FRACTION = 0.55;

// Shared layout math for every template below: measure the headline,
// optionally measure a subtitle (line2), and sum their heights into one
// block - each template previously repeated this ~15-line measurement
// (and the matching draw calls in drawTextBlock) with only its
// x/width/weight/gap/alignment differing.
function computeTextBlock(ctx, data, brand, {
  textW,
  headlineWeight,
  subGap = 48,
}) {
  const { lines: headLines, headLH, headFont, headFontSize } = computeHeadline(ctx, data, brand, textW, headlineWeight);
  let totalH = blockHeight(headLines, headLH);

  let subLines = [], subLH = 0, subFont = '';
  if (data.line2) {
    const wrapW = Math.min(ctx.canvas.width * SUBTEXT_WRAP_FRACTION, textW);
    const styledWeight = brand.bItalic ? `italic ${bw(brand, 600)}` : `${bw(brand, 600)}`;
    const targetSize = BASE_SUBTEXT_SIZE * (brand.bSizeScale ?? 1);
    // Subtext gets a generous height allowance of its own (the shared
    // maxH above only ever applied to the headline) - this only matters
    // as a safety net for an extreme bSizeScale on a long subtext line,
    // same role as the headline's own fitFixedSize call.
    const maxH = ctx.canvas.height * 0.3;
    const sub = fitFixedSize(ctx, data.line2, brand.bFont, styledWeight, targetSize, wrapW, maxH, SUBTEXT_LINE_SPACING, wrapSubtext);
    subLines = sub.lines;
    subFont = sub.font;
    subLH = sub.lineHeightPx;
    totalH += subGap + blockHeight(subLines, subLH);
  }

  return { headLines, headLH, headFont, subLines, subLH, subFont, subGap, totalH };
}

function drawTextBlock(ctx, block, brand, x, startY, align) {
  const hLS = brand.hLetterSpacing ?? 0;
  let y = drawLines(ctx, block.headLines, x, startY, block.headFont, brand.textColor, align, block.headLH, hLS);
  if (block.subLines.length) {
    drawLines(ctx, block.subLines, x, y + block.subGap, block.subFont, brand.textColor, align, block.subLH, 0);
  }
}

// Vertically centers a block of height totalH within [rangeStart,
// rangeStart + rangeHeight) - most templates center within the whole
// canvas (rangeStart 0, rangeHeight ch); a couple reserve space for a
// header bar/banner first and center within what's left.
const centerY = (totalH, rangeStart, rangeHeight) => rangeStart + (rangeHeight - totalH) / 2;

export const renderLeftBlock=(ctx,data,brand,contentW,margin,cw,ch)=> {
  const block = computeTextBlock(ctx, data, brand, { textW: contentW, headlineWeight: hw(brand, 800) });
  drawTextBlock(ctx, block, brand, margin, centerY(block.totalH, 0, ch), "left");
};

export const renderMinimal=(ctx,data,brand,contentW,cw,ch)=> {
  const block = computeTextBlock(ctx, data, brand, {
    textW: contentW, headlineWeight: hw(brand, 900), subGap: 56,
  });
  drawTextBlock(ctx, block, brand, cw / 2, centerY(block.totalH, 0, ch), "center");
};
