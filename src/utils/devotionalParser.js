const MONTHS = {
  JANUARY: 1, FEBRUARY: 2, MARCH: 3, APRIL: 4, MAY: 5, JUNE: 6,
  JULY: 7, AUGUST: 8, SEPTEMBER: 9, OCTOBER: 10, NOVEMBER: 11, DECEMBER: 12
};

// Parses the bulk-import .txt format into devotional row objects. Pure
// function (no Supabase dependency) so it can be unit tested directly.
export const parseDevotionalFile = (text) => {
  const devotionals = [];
  const sections = text.split(/\n\s*\n/).filter(section => section.trim() !== '');
  let currentDevotional = null;

  for (const section of sections) {
    const lines = section.split('\n').map(line => line.trim()).filter(line => line !== '');
    if (lines.length === 0) continue;

    const firstLine = lines[0];
    const dateMatch = firstLine.match(/^(JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)\s+(\d+):\s*(.+)$/i);

    if (dateMatch) {
      if (currentDevotional) {
        devotionals.push(currentDevotional);
      }

      const [, month, day, title] = dateMatch;
      const monthNum = MONTHS[month.toUpperCase()];
      const currentYear = new Date().getFullYear();
      const dateStr = `${currentYear}-${monthNum.toString().padStart(2, '0')}-${day.padStart(2, '0')}`;

      currentDevotional = {
        devotional_date: dateStr,
        title: title.trim(),
        subtitle: '',
        scripture_reference: '',
        content: '',
        response: '',
        prayer: ''
      };
    } else if (currentDevotional) {
      const content = lines.join('\n');

      if (content.toLowerCase().startsWith('response:')) {
        currentDevotional.response = content.substring(9).trim();
      } else if (content.toLowerCase().startsWith('prayer:')) {
        currentDevotional.prayer = content.substring(7).trim();
      } else if (!currentDevotional.subtitle && lines.length === 1) {
        currentDevotional.subtitle = content;
      } else if (!currentDevotional.scripture_reference && lines.length === 1 && content.includes(':')) {
        currentDevotional.scripture_reference = content;
      } else if (currentDevotional.content) {
        currentDevotional.content += '\n\n' + content;
      } else {
        currentDevotional.content = content;
      }
    }
  }

  if (currentDevotional) {
    devotionals.push(currentDevotional);
  }

  return devotionals;
};
