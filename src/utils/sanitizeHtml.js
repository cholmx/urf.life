import DOMPurify from 'dompurify';

// Wraps admin-authored rich text (from RichTextEditor) for safe use with
// dangerouslySetInnerHTML. Writes to these fields now require an
// authenticated admin session, but sanitizing on render is still cheap
// insurance: it means a compromised admin session, or rich content pasted
// from an untrusted source, can't inject a script into a page every public
// visitor loads.
export const sanitizeHtml = (html) => {
  if (!html) return '';
  // DOMPurify strips target by default; allow it back for links (e.g. the
  // Happenings script's "Register Here" links) since rel="noopener
  // noreferrer" - which admin-authored content already sets alongside it -
  // is what actually mitigates the reverse-tabnabbing risk target="_blank"
  // poses on its own.
  return DOMPurify.sanitize(html, {ADD_ATTR: ['target']});
};
