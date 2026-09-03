import DOMPurify from 'dompurify';

// Wraps admin-authored rich text (from RichTextEditor) for safe use with
// dangerouslySetInnerHTML. Writes to these fields now require an
// authenticated admin session, but sanitizing on render is still cheap
// insurance: it means a compromised admin session, or rich content pasted
// from an untrusted source, can't inject a script into a page every public
// visitor loads.
export const sanitizeHtml = (html) => {
  if (!html) return '';
  return DOMPurify.sanitize(html);
};
