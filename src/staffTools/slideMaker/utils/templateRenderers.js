import {wrapText,drawLines,blockHeight,autoFitText} from './canvasUtils';

const formatHeadline = (text, uppercase) => uppercase ? text.toUpperCase() : text;
const hw = (brand, fallback) => brand.hWeight ?? fallback;
const bw = (brand, fallback) => brand.bWeight ?? fallback;
const sh = (brand) => brand.shadowColor ?? null;

/**
 * Compute headline lines, line height, and effective font size.
 * Uses autoFitText when data.autoFit is true, otherwise uses wrapText with manual size.
 * Uses data.headLineHeight (default 1.12) for line spacing.
 */
function computeHeadline(ctx, data, brand, maxW, weight, fallbackSize) {
  const baseSize = data.s1 || fallbackSize;
  const lineSpacing = data.headLineHeight ?? 1.12;
  const headText = formatHeadline(data.line1 || "YOUR TEXT HERE", data.uppercaseHeadline);
  const fontFamily = brand.hFont;

  if (data.autoFit) {
    // maxH: roughly 60% of canvas height for headline
    const ch = ctx.canvas.height;
    const maxH = ch * 0.55;
    const result = autoFitText(ctx, headText, baseSize, weight, fontFamily, maxW, maxH, lineSpacing, data.uppercaseHeadline);
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
// optionally measure a subtitle (line2) and a detail line (line3), and
// sum their heights into one block - each template previously repeated
// this ~15-line measurement (and the matching draw calls in
// drawTextBlock) with only its x/width/weights/gaps/alignment differing.
function computeTextBlock(ctx, data, brand, {
  textW,
  headlineWeight,
  headlineFallbackSize,
  subGap = 32,
  subFallbackSize = 40,
  detGap = 26,
  detFallbackSize = 32,
  includeDetail = true,
}) {
  const { lines: headLines, headLH, headFont } = computeHeadline(ctx, data, brand, textW, headlineWeight, headlineFallbackSize);
  let totalH = blockHeight(headLines, headLH);

  let subLines = [], subLH = 0, subFont = '';
  if (data.line2) {
    const subSize = data.s2 || subFallbackSize;
    subFont = `${bw(brand, 600)} ${subSize}px ${brand.bFont}`;
    subLines = wrapText(ctx, data.line2, subFont, textW, true);
    subLH = subSize * 1.35;
    totalH += subGap + blockHeight(subLines, subLH);
  }

  let detLines = [], detLH = 0, detFont = '';
  if (includeDetail && data.line3) {
    const detSize = data.s3 || detFallbackSize;
    detFont = `400 ${detSize}px ${brand.bFont}`;
    detLines = wrapText(ctx, data.line3, detFont, textW, true);
    detLH = detSize * 1.4;
    totalH += detGap + blockHeight(detLines, detLH);
  }

  return { headLines, headLH, headFont, subLines, subLH, subFont, subGap, detLines, detLH, detFont, detGap, totalH };
}

function drawTextBlock(ctx, block, brand, x, startY, align) {
  const hLS = brand.hLetterSpacing ?? 0;
  let y = drawLines(ctx, block.headLines, x, startY, block.headFont, brand.textColor, align, block.headLH, hLS, sh(brand));
  if (block.subLines.length) {
    y = drawLines(ctx, block.subLines, x, y + block.subGap, block.subFont, brand.accentColor, align, block.subLH, 0, sh(brand));
  }
  if (block.detLines.length) {
    drawLines(ctx, block.detLines, x, y + block.detGap, block.detFont, brand.accentColor, align, block.detLH, 0, sh(brand));
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

export const renderLeftBand=(ctx,data,brand,margin,cw,ch)=> {
  const bandW=16;
  const bandX=margin + 54;
  ctx.fillStyle=brand.accentColor;
  ctx.fillRect(bandX, ch * 0.22, bandW, ch * 0.56);

  const textX=bandX + bandW + 66;
  const textW=cw - textX - margin;

  const block = computeTextBlock(ctx, data, brand, { textW, headlineWeight: hw(brand, 800), headlineFallbackSize: 98 });
  drawTextBlock(ctx, block, brand, textX, centerY(block.totalH, 0, ch), "left");
};

export const renderMinimal=(ctx,data,brand,contentW,cw,ch)=> {
  const block = computeTextBlock(ctx, data, brand, {
    textW: contentW, headlineWeight: hw(brand, 900), headlineFallbackSize: 128,
    subGap: 40, subFallbackSize: 45, includeDetail: false,
  });
  drawTextBlock(ctx, block, brand, cw / 2, centerY(block.totalH, 0, ch), "center");
};

export const renderOffsetHeader=(ctx,data,brand,margin,cw,ch)=> {
  const barW=cw * 0.42;
  const barH=133;
  const barX=margin;
  const barY=ch * 0.24;

  ctx.fillStyle=brand.accentColor;
  ctx.fillRect(barX, barY, barW, barH);

  const textW = cw - margin * 2;
  const block = computeTextBlock(ctx, data, brand, {
    textW, headlineWeight: hw(brand, 800), headlineFallbackSize: 101,
    subGap: 35, subFallbackSize: 40, includeDetail: false,
  });

  const startY=barY + barH + 93;
  const availH=ch - startY - margin;
  drawTextBlock(ctx, block, brand, margin, centerY(block.totalH, startY, availH), "left");
};

const drawAccentImage=(ctx,img,x,y,w,h,accentColor)=> {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  const sc=Math.max(w/img.width, h/img.height);
  const iw=img.width*sc, ih=img.height*sc;
  ctx.drawImage(img, x+(w-iw)/2, y+(h-ih)/2, iw, ih);
  const rgb=accentColor.match(/\w\w/g)?.map(v=>parseInt(v,16))||[0,0,0];
  ctx.fillStyle=`rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.55)`;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
};

export const renderRightAccent=(ctx,data,brand,margin,accentImg,cw,ch)=> {
  const accentW=cw * 0.22;
  const accentX=cw - accentW;
  if (accentImg) {
    drawAccentImage(ctx, accentImg, accentX, 0, accentW, ch, brand.accentColor);
  } else {
    ctx.fillStyle=brand.accentColor;
    ctx.fillRect(accentX, 0, accentW, ch);
  }

  const textW = cw - accentW - margin;
  const block = computeTextBlock(ctx, data, brand, {
    textW, headlineWeight: hw(brand, 800), headlineFallbackSize: 101,
    subGap: 35, subFallbackSize: 40, includeDetail: false,
  });
  drawTextBlock(ctx, block, brand, margin, centerY(block.totalH, 0, ch), "left");
};

export const renderBottomBanner=(ctx,data,brand,contentW,cw,ch)=> {
  const bannerH=187;
  const bannerY=ch - bannerH;
  ctx.fillStyle=brand.accentColor;
  ctx.fillRect(0, bannerY, cw, bannerH);

  const block = computeTextBlock(ctx, data, brand, {
    textW: contentW, headlineWeight: hw(brand, 800), headlineFallbackSize: 110,
    subGap: 37, subFallbackSize: 43, includeDetail: false,
  });

  const availH=bannerY - 107;
  drawTextBlock(ctx, block, brand, cw / 2, centerY(block.totalH, 107, availH), "center");
};

export const renderSidePanel=(ctx,data,brand,margin,accentImg,cw,ch)=> {
  const panelW=cw * 0.18;
  if (accentImg) {
    drawAccentImage(ctx, accentImg, 0, 0, panelW, ch, brand.accentColor);
  } else {
    ctx.fillStyle=brand.accentColor;
    ctx.fillRect(0, 0, panelW, ch);
  }

  const textX=panelW + 80;
  const textW=cw - textX - margin;

  const block = computeTextBlock(ctx, data, brand, { textW, headlineWeight: hw(brand, 800), headlineFallbackSize: 101 });
  drawTextBlock(ctx, block, brand, textX, centerY(block.totalH, 0, ch), "left");
};
