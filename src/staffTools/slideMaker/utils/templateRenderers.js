import {wrapText,drawLines,blockHeight,autoFitText} from './canvasUtils';

const hw = (brand, fallback) => brand.hWeight ?? fallback;
const bw = (brand, fallback) => brand.bWeight ?? fallback;

/**
 * Compute headline lines, line height, and effective font size.
 * Uses autoFitText when data.autoFit is true, otherwise uses wrapText with manual size.
 * Uses data.headLineHeight (default 1.12) for line spacing.
 */
function computeHeadline(ctx, data, brand, maxW, weight, fallbackSize) {
  const baseSize = data.s1 || fallbackSize;
  const lineSpacing = data.headLineHeight ?? 1.12;
  const headText = data.line1 || "YOUR TEXT HERE";
  const fontFamily = brand.hFont;

  if (data.autoFit) {
    // maxH: roughly 60% of canvas height for headline
    const ch = ctx.canvas.height;
    const maxH = ch * 0.55;
    const result = autoFitText(ctx, headText, baseSize, weight, fontFamily, maxW, maxH, lineSpacing);
    return {
      lines: result.lines,
      headLH: result.lineHeightPx,
      headFont: `${weight} ${result.fontSize}px ${fontFamily}`,
    };
  }

  const headFont = `${weight} ${baseSize}px ${fontFamily}`;
  const lines = wrapText(ctx, headText, headFont, maxW);
  const headLH = baseSize * lineSpacing;
  return { lines, headLH, headFont };
}

// Shared layout math for every template below: measure the headline,
// optionally measure a subtitle (line2), and sum their heights into one
// block - each template previously repeated this ~15-line measurement
// (and the matching draw calls in drawTextBlock) with only its
// x/width/weight/gap/alignment differing.
function computeTextBlock(ctx, data, brand, {
  textW,
  headlineWeight,
  headlineFallbackSize,
  subGap = 32,
  subFallbackSize = 40,
}) {
  const { lines: headLines, headLH, headFont } = computeHeadline(ctx, data, brand, textW, headlineWeight, headlineFallbackSize);
  let totalH = blockHeight(headLines, headLH);

  let subLines = [], subLH = 0, subFont = '';
  if (data.line2) {
    const subSize = data.s2 || subFallbackSize;
    // Subhead is always italic Aleo, regardless of the headline's weight.
    subFont = `italic ${bw(brand, 600)} ${subSize}px ${brand.bFont}`;
    subLines = wrapText(ctx, data.line2, subFont, textW, true);
    subLH = subSize * 1.35;
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
    textW: contentW, headlineWeight: hw(brand, 900), headlineFallbackSize: 128,
    subGap: 40, subFallbackSize: 45,
  });
  drawTextBlock(ctx, block, brand, cw / 2, centerY(block.totalH, 0, ch), "center");
};
