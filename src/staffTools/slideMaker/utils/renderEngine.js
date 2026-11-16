import { SW, SH } from '../constants/data';
import { clipRounded, drawOverlay } from './canvasUtils';
import * as renderers from './templateRenderers';

export function render(canvas, tmplId, data, brand, bgImg, overlayColor, ov, blur = 0, canvasW = SW, canvasH = SH, cornerR = 0) {
  const ctx = canvas.getContext("2d"); canvas.width = canvasW; canvas.height = canvasH;

  ctx.fillStyle = "#000000"; ctx.fillRect(0, 0, canvasW, canvasH);
  ctx.save();
  clipRounded(ctx, canvasW, canvasH, cornerR);
  ctx.clip();
  ctx.fillStyle = brand.bgColor; ctx.fillRect(0, 0, canvasW, canvasH);

  // The automatic slide maker's faint branded watermark (see
  // pickMarkOverlay in SlideMaker.jsx) - drawn over the flat color fill
  // but under everything else, so a photo background (which already has
  // its own texture) and the headline/subhead text both still sit on top
  // of it untouched.
  if (brand.markImg && brand.markOpacity > 0) {
    ctx.save();
    ctx.globalAlpha = brand.markOpacity;
    ctx.drawImage(brand.markImg, 0, 0, canvasW, canvasH);
    ctx.restore();
  }

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

  switch (tmplId) {
    case "minimal": renderers.renderMinimal(ctx, data, brand, contentW, canvasW, canvasH); break;
    case "left_block": renderers.renderLeftBlock(ctx, data, brand, contentW, margin, canvasW, canvasH); break;
    default: renderers.renderLeftBlock(ctx, data, brand, contentW, margin, canvasW, canvasH); break;
  }

  ctx.restore();
}
