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

export const renderLeftBlock=(ctx,data,brand,contentW,margin,cw,ch)=> {
  const {lines:headLines,headLH,headFont}=computeHeadline(ctx,data,brand,contentW,hw(brand,800));
  const headH=blockHeight(headLines,headLH);

  let totalH=headH,subLines=[],subLH=0,detLines=[],detLH=0;
  if (data.line2) {
    subLines=wrapText(ctx,data.line2,`${bw(brand,600)} ${data.s2 || 40}px ${brand.bFont}`,contentW,true);
    subLH=(data.s2 || 40) * 1.35;
    totalH +=32 + blockHeight(subLines,subLH);
  }
  if (data.line3) {
    detLines=wrapText(ctx,data.line3,`400 ${data.s3 || 32}px ${brand.bFont}`,contentW,true);
    detLH=(data.s3 || 32) * 1.4;
    totalH +=26 + blockHeight(detLines,detLH);
  }

  const hLS = brand.hLetterSpacing ?? 0;
  let y=(ch - totalH) / 2;
  y=drawLines(ctx,headLines,margin,y,headFont,brand.textColor,"left",headLH,hLS,sh(brand));
  if (data.line2) y=drawLines(ctx,subLines,margin,y + 32,`${bw(brand,600)} ${data.s2 || 40}px ${brand.bFont}`,brand.accentColor,"left",subLH,0,sh(brand));
  if (data.line3) drawLines(ctx,detLines,margin,y + 26,`400 ${data.s3 || 32}px ${brand.bFont}`,brand.accentColor,"left",detLH,0,sh(brand));
};

export const renderLeftBand=(ctx,data,brand,margin,cw,ch)=> {
  const bandW=16;
  const bandX=margin + 54;
  ctx.fillStyle=brand.accentColor;
  ctx.fillRect(bandX, ch * 0.22, bandW, ch * 0.56);

  const textX=bandX + bandW + 66;
  const textW=cw - textX - margin;

  const {lines:headLines,headLH,headFont}=computeHeadline(ctx,data,brand,textW,hw(brand,800),98);
  const headH=blockHeight(headLines,headLH);

  let totalH=headH,subLines=[],subLH=0,detLines=[],detLH=0;
  if (data.line2) {
    subLines=wrapText(ctx,data.line2,`${bw(brand,600)} ${data.s2||40}px ${brand.bFont}`,textW,true);
    subLH=(data.s2||40)*1.35;
    totalH +=32 + blockHeight(subLines,subLH);
  }
  if (data.line3) {
    detLines=wrapText(ctx,data.line3,`400 ${data.s3||32}px ${brand.bFont}`,textW,true);
    detLH=(data.s3||32)*1.4;
    totalH +=26 + blockHeight(detLines,detLH);
  }

  const hLS = brand.hLetterSpacing ?? 0;
  let y=(ch - totalH) / 2;
  y=drawLines(ctx,headLines,textX,y,headFont,brand.textColor,"left",headLH,hLS,sh(brand));
  if (data.line2) y=drawLines(ctx,subLines,textX,y + 32,`${bw(brand,600)} ${data.s2||40}px ${brand.bFont}`,brand.accentColor,"left",subLH,0,sh(brand));
  if (data.line3) drawLines(ctx,detLines,textX,y + 26,`400 ${data.s3||32}px ${brand.bFont}`,brand.accentColor,"left",detLH,0,sh(brand));
};

export const renderMinimal=(ctx,data,brand,contentW,cw,ch)=> {
  const {lines:headLines,headLH,headFont}=computeHeadline(ctx,data,brand,contentW,hw(brand,900),128);
  const headH=blockHeight(headLines,headLH);

  let totalH=headH,subLines=[],subLH=0;
  if (data.line2) {
    subLines=wrapText(ctx,data.line2,`${bw(brand,600)} ${data.s2||45}px ${brand.bFont}`,contentW,true);
    subLH=(data.s2||45)*1.35;
    totalH +=40 + blockHeight(subLines,subLH);
  }

  const hLS = brand.hLetterSpacing ?? 0;
  let y=(ch - totalH) / 2;
  y=drawLines(ctx,headLines,cw / 2,y,headFont,brand.textColor,"center",headLH,hLS,sh(brand));
  if (data.line2) drawLines(ctx,subLines,cw / 2,y + 40,`${bw(brand,600)} ${data.s2||45}px ${brand.bFont}`,brand.accentColor,"center",subLH,0,sh(brand));
};

export const renderOffsetHeader=(ctx,data,brand,margin,cw,ch)=> {
  const barW=cw * 0.42;
  const barH=133;
  const barX=margin;
  const barY=ch * 0.24;

  ctx.fillStyle=brand.accentColor;
  ctx.fillRect(barX, barY, barW, barH);

  const {lines:headLines,headLH,headFont}=computeHeadline(ctx,data,brand,cw-margin*2,hw(brand,800),101);
  const headH=blockHeight(headLines,headLH);

  let totalH=headH,subLines=[],subLH=0;
  if (data.line2) {
    subLines=wrapText(ctx,data.line2,`${bw(brand,600)} ${data.s2||40}px ${brand.bFont}`,cw-margin*2,true);
    subLH=(data.s2||40)*1.35;
    totalH +=35 + blockHeight(subLines,subLH);
  }

  const hLS = brand.hLetterSpacing ?? 0;
  const startY=barY + barH + 93;
  const availH=ch - startY - margin;
  let y=startY + (availH - totalH) / 2;
  y=drawLines(ctx,headLines,margin,y,headFont,brand.textColor,"left",headLH,hLS,sh(brand));
  if (data.line2) drawLines(ctx,subLines,margin,y + 35,`${bw(brand,600)} ${data.s2||40}px ${brand.bFont}`,brand.accentColor,"left",subLH,0,sh(brand));
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

  const {lines:headLines,headLH,headFont}=computeHeadline(ctx,data,brand,cw-accentW-margin,hw(brand,800),101);
  const headH=blockHeight(headLines,headLH);

  let totalH=headH,subLines=[],subLH=0;
  if (data.line2) {
    subLines=wrapText(ctx,data.line2,`${bw(brand,600)} ${data.s2||40}px ${brand.bFont}`,cw-accentW-margin,true);
    subLH=(data.s2||40)*1.35;
    totalH +=35 + blockHeight(subLines,subLH);
  }

  const hLS = brand.hLetterSpacing ?? 0;
  let y=(ch - totalH) / 2;
  y=drawLines(ctx,headLines,margin,y,headFont,brand.textColor,"left",headLH,hLS,sh(brand));
  if (data.line2) drawLines(ctx,subLines,margin,y + 35,`${bw(brand,600)} ${data.s2||40}px ${brand.bFont}`,brand.accentColor,"left",subLH,0,sh(brand));
};

export const renderBottomBanner=(ctx,data,brand,contentW,cw,ch)=> {
  const bannerH=187;
  const bannerY=ch - bannerH;
  ctx.fillStyle=brand.accentColor;
  ctx.fillRect(0, bannerY, cw, bannerH);

  const {lines:headLines,headLH,headFont}=computeHeadline(ctx,data,brand,contentW,hw(brand,800),110);
  const headH=blockHeight(headLines,headLH);

  let totalH=headH,subLines=[],subLH=0;
  if (data.line2) {
    subLines=wrapText(ctx,data.line2,`${bw(brand,600)} ${data.s2||43}px ${brand.bFont}`,contentW,true);
    subLH=(data.s2||43)*1.35;
    totalH +=37 + blockHeight(subLines,subLH);
  }

  const hLS = brand.hLetterSpacing ?? 0;
  const availH=bannerY - 107;
  let y=(availH - totalH) / 2 + 107;
  y=drawLines(ctx,headLines,cw / 2,y,headFont,brand.textColor,"center",headLH,hLS,sh(brand));
  if (data.line2) drawLines(ctx,subLines,cw / 2,y + 37,`${bw(brand,600)} ${data.s2||43}px ${brand.bFont}`,brand.accentColor,"center",subLH,0,sh(brand));
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

  const {lines:headLines,headLH,headFont}=computeHeadline(ctx,data,brand,textW,hw(brand,800),101);
  const headH=blockHeight(headLines,headLH);

  let totalH=headH,subLines=[],subLH=0,detLines=[],detLH=0;
  if (data.line2) {
    subLines=wrapText(ctx,data.line2,`${bw(brand,600)} ${data.s2||40}px ${brand.bFont}`,textW,true);
    subLH=(data.s2||40)*1.35;
    totalH +=32 + blockHeight(subLines,subLH);
  }
  if (data.line3) {
    detLines=wrapText(ctx,data.line3,`400 ${data.s3||32}px ${brand.bFont}`,textW,true);
    detLH=(data.s3||32)*1.4;
    totalH +=26 + blockHeight(detLines,detLH);
  }

  const hLS = brand.hLetterSpacing ?? 0;
  let y=(ch - totalH) / 2;
  y=drawLines(ctx,headLines,textX,y,headFont,brand.textColor,"left",headLH,hLS,sh(brand));
  if (data.line2) y=drawLines(ctx,subLines,textX,y + 32,`${bw(brand,600)} ${data.s2||40}px ${brand.bFont}`,brand.accentColor,"left",subLH,0,sh(brand));
  if (data.line3) drawLines(ctx,detLines,textX,y + 26,`400 ${data.s3||32}px ${brand.bFont}`,brand.accentColor,"left",detLH,0,sh(brand));
};
