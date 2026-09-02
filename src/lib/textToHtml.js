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
