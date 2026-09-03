// Supabase `date` columns come back as plain 'YYYY-MM-DD' strings with no time
// or timezone info. Passing that straight into `new Date(...)` makes JS parse it
// as UTC midnight, so anyone in a timezone behind UTC (all of the US) sees the
// previous day once it's rendered in local time. These helpers parse the
// year/month/day as local values instead, so the date shown always matches the
// date that was picked on the form.

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

export const parseLocalDate = (dateString) => {
  if (!dateString) return null;
  const datePart = dateString.split('T')[0];
  if (!DATE_ONLY.test(datePart)) return new Date(dateString);
  const [year, month, day] = datePart.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDate = (dateString, options = { year: 'numeric', month: 'long', day: 'numeric' }) => {
  const date = parseLocalDate(dateString);
  if (!date) return '';
  return date.toLocaleDateString('en-US', options);
};

// Formats a Postgres `time` value ('19:00:00' or '19:00') as '7:00 PM'.
export const formatTime = (timeString) => {
  if (!timeString) return '';
  const [hour, minute] = timeString.split(':').map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return '';
  const date = new Date(2000, 0, 1, hour, minute);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};
