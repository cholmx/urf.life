import {wrapText,fitTextToWidth,fitSubtextToTwoLines,drawLines,blockHeight} from './canvasUtils';

const hw = (brand, fallback) => brand.hWeight ?? fallback;
const bw = (brand, fallback) => brand.bWeight ?? fallback;

// Headline target/cap width as a fraction of the slide's own width (not
// the margin box maxW) - the automatic generator always sizes the
// headline to fill close to this fraction, however short or long the
// title is (see fitTextToWidth), rather than starting from a fixed size
// and only shrinking when it overflows. maxW stays as a hard ceiling in
// case this fraction ever exceeds the margin box on some future aspect
// ratio.
const HEADLINE_WIDTH_FRACTION = 0.75;

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
  const targetW = Math.min(ctx.canvas.width * HEADLINE_WIDTH_FRACTION, maxW);
  // maxH: roughly 55% of canvas height for headline
  const maxH = ch * 0.55;
  const result = fitTextToWidth(ctx, headText, fontFamily, styledWeight, targetW, maxH);
  return {
    lines: result.lines,
    headLH: result.lineHeightPx,
    headFont: `${styledWeight} ${result.fontSize}px ${fontFamily}`,
    headFontSize: result.fontSize,
  };
}

// Subtext target/cap width, same idea as HEADLINE_WIDTH_FRACTION above
// but narrower and paired with always-exactly-two-lines (see
// fitSubtextToTwoLines) rather than a flexible line count - a smaller,
// secondary block that still reads as deliberately sized relative to
// the slide, not just "whatever's left over" at a fixed pixel size.
const SUBTEXT_WIDTH_FRACTION = 0.55;

// Shared layout math for every template below: measure the headline,
// optionally measure a subtitle (line2), and sum their heights into one
// block - each template previously repeated this ~15-line measurement
// (and the matching draw calls in drawTextBlock) with only its
// x/width/weight/gap/alignment differing.
function computeTextBlock(ctx, data, brand, {
  textW,
  headlineWeight,
  subGap = 32,
}) {
  const { lines: headLines, headLH, headFont, headFontSize } = computeHeadline(ctx, data, brand, textW, headlineWeight);
  let totalH = blockHeight(headLines, headLH);

  let subLines = [], subLH = 0, subFont = '';
  if (data.line2) {
    const targetW = Math.min(ctx.canvas.width * SUBTEXT_WIDTH_FRACTION, textW);
    // Always exactly two lines, preferring a natural clause break (see
    // fitSubtextToTwoLines/splitIntoTwoLines in canvasUtils.js) - italic/
    // weight/family come from the brand's font pairing (DEFAULT_BRAND's
    // own fallback is always italic Playfair Display). Capped relative
    // to the headline's own resolved size (never more than a bit over
    // half of it) rather than a fixed pixel ceiling - a short subtext
    // paired with a short, large headline still scales up with it
    // instead of hitting an arbitrary cap well under the 55% target.
    const subMaxSize = Math.max(28, Math.round(headFontSize * 0.55));
    const sub = fitSubtextToTwoLines(ctx, data.line2, brand.bFont, bw(brand, 600), !!brand.bItalic, targetW, {maxSize: subMaxSize});
    subLines = sub.lines;
    subFont = sub.font;
    subLH = sub.fontSize * 1.35;
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
    textW: contentW, headlineWeight: hw(brand, 900), subGap: 40,
  });
  drawTextBlock(ctx, block, brand, cw / 2, centerY(block.totalH, 0, ch), "center");
};
