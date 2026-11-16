import { SW, SH } from '../constants/data';
import { clipRounded, drawOverlay } from './canvasUtils';
import * as renderers from './templateRenderers';

// The automatic slide maker's native frame overlay (see pickMarkOverlay
// in SlideMaker.jsx, FRAME_STYLES in constants/data.js) - a thin stroked
// rounded rectangle inset from the canvas edge, sized relative to the
// canvas so it scales cleanly to any aspect ratio instead of being a
// fixed-proportion image stretched to fit. "pill" rounds all four
// corners the same; "diagonal" rounds only the top-left and
// bottom-right, leaving the other two square.
function drawMarkFrame(ctx, canvasW, canvasH, frame) {
  const short = Math.min(canvasW, canvasH);
  const inset = short * 0.035;
  const radius = short * 0.07;
  const x = inset, y = inset, w = canvasW - inset * 2, h = canvasH - inset * 2;

  ctx.save();
  ctx.globalAlpha = frame.opacity;
  ctx.strokeStyle = frame.color;
  ctx.lineWidth = Math.max(2, short * 0.0025);
  ctx.beginPath();
  if (frame.style === "pill") {
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
  } else {
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

export function render(canvas, tmplId, data, brand, bgImg, overlayColor, ov, blur = 0, canvasW = SW, canvasH = SH, cornerR = 0) {
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

  // The automatic slide maker's faint branded watermark (see
  // pickMarkOverlay in SlideMaker.jsx) - drawn over the flat color fill,
  // or over the photo and its own color wash, but always under the
  // headline/subhead text.
  if (brand.markImg && brand.markOpacity > 0) {
    ctx.save();
    ctx.globalAlpha = brand.markOpacity;
    ctx.drawImage(brand.markImg, 0, 0, canvasW, canvasH);
    ctx.restore();
  }

  if (brand.markFrame) {
    drawMarkFrame(ctx, canvasW, canvasH, brand.markFrame);
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
