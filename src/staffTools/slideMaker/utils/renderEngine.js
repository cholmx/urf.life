import { SW, SH } from '../constants/data';
import { clipRounded, shadowColorForBg, drawOverlay } from './canvasUtils';
import * as renderers from './templateRenderers';

export function render(canvas, tmplId, data, brand, bgImg, overlayColor, ov, blur = 0, canvasW = SW, canvasH = SH, cornerR = 32) {
  const ctx = canvas.getContext("2d"); canvas.width = canvasW; canvas.height = canvasH;

  ctx.fillStyle = "#000000"; ctx.fillRect(0, 0, canvasW, canvasH);
  ctx.save();
  clipRounded(ctx, canvasW, canvasH, cornerR);
  ctx.clip();
  ctx.fillStyle = brand.bgColor; ctx.fillRect(0, 0, canvasW, canvasH);

  if (bgImg) {
    if (blur > 0) {
      ctx.filter = `blur(${blur}px)`;
    }
    const pad = blur > 0 ? blur * 2.5 : 0;
    const sc = Math.max(canvasW/bgImg.width, canvasH/bgImg.height), w=bgImg.width*sc+pad*2, h=bgImg.height*sc+pad*2;
    ctx.drawImage(bgImg, (canvasW-w)/2, (canvasH-h)/2, w, h);
    ctx.filter = 'none';
    drawOverlay(ctx, canvasW, canvasH, overlayColor, ov);
  }

  const margin = 250;
  const contentW = canvasW - margin * 2;
  const brandWithShadow = { ...brand, shadowColor: brand.textShadow !== false ? shadowColorForBg(brand.bgColor) : null };

  switch (tmplId) {
    case "minimal": renderers.renderMinimal(ctx, data, brandWithShadow, contentW, canvasW, canvasH); break;
    case "left_block": renderers.renderLeftBlock(ctx, data, brandWithShadow, contentW, margin, canvasW, canvasH); break;
    default: renderers.renderLeftBlock(ctx, data, brandWithShadow, contentW, margin, canvasW, canvasH); break;
  }

  ctx.restore();
}
