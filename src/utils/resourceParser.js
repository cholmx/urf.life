// Parses the bulk-import .txt format into resource row objects. Pure
// function (no Supabase dependency) so it can be unit tested directly.
export const parseResourcesFile = (text) => {
  const resources = [];
  const entries = text.split(/\n\s*\n\s*\n/).filter(entry => entry.trim() !== '');

  for (const entry of entries) {
    const lines = entry.split('\n').map(line => line.trim()).filter(line => line !== '');
    const currentResource = { category: '', title: '', author: '', links: [] };
    let collectingLinks = false;

    for (const line of lines) {
      if (line.startsWith('Category:')) {
        currentResource.category = line.replace('Category:', '').trim();
      } else if (line.startsWith('Title:')) {
        currentResource.title = line.replace('Title:', '').trim();
      } else if (line.startsWith('Author:')) {
        currentResource.author = line.replace('Author:', '').trim();
      } else if (line === 'Links to Books:') {
        collectingLinks = true;
      } else if (collectingLinks && line.startsWith('http')) {
        currentResource.links.push(line.trim());
      }
    }

    if (currentResource.title && currentResource.links.length > 0) {
      resources.push(currentResource);
    }
  }

  return resources;
};
