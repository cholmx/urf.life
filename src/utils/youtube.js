// Turns a YouTube watch/share URL into its embeddable form. Regex-based
// (extracts the 11-character video ID) rather than naive string
// substitution - a substitution approach breaks on any URL carrying extra
// query params (timestamp links, playlist links, si= share tokens), which
// are extremely common when a URL is copy-pasted from the YouTube app.
export function getYouTubeEmbedUrl(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11
    ? `https://www.youtube.com/embed/${match[2]}`
    : url;
}
