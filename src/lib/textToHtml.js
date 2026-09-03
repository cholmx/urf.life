// Converts a plain-text field (Communication Organizer's happening body is
// a plain <textarea>) into paragraph HTML for the public site, which
// renders it with dangerouslySetInnerHTML.
export function plainTextToHtml(text) {
  const escape = (s) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return (text || '')
    .split(/\n{2,}/)
    .map(block => block.trim())
    .filter(Boolean)
    .map(block => `<p>${escape(block).replace(/\n/g, '<br>')}</p>`)
    .join('');
}

// The weekly Happenings script is stored as HTML now (staff can bold/title
// it in ScriptEditor), but rows saved before that change are still plain
// text - this renders either correctly without needing to know which one
// it's looking at.
export function ensureScriptHtml(content) {
  if (!content) return '';
  return /<(p|div|h[1-6]|br)[\s/>]/i.test(content) ? content : plainTextToHtml(content);
}
