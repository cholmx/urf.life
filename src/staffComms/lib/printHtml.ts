// Shared print-to-PDF helper for this suite's printables (Bulletin,
// Monthly Flyer, Invite postcards). Renders the given HTML into a
// hidden iframe and calls print() on it, rather than window.open -
// a popup can be silently blocked by the browser with no feedback to
// the user, while a same-page iframe can't be.
export function printHtml(html: string): void {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.top = '-10000px';
  iframe.style.left = '-10000px';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);
  const doc = iframe.contentWindow?.document;
  if (!doc) return;
  doc.open();
  doc.write(html);
  doc.close();
  setTimeout(() => {
    try { iframe.contentWindow?.focus(); iframe.contentWindow?.print(); }
    catch { /* ignore */ }
    setTimeout(() => document.body.removeChild(iframe), 1000);
  }, 800);
}
