// event_start_time/event_end_time are stored as toLocaleTimeString output
// ("6:00 PM", "12:30 AM" - see formatTime in utils/dateFormat.js), not
// 24-hour "HH:MM" - this parses that back into minutes-since-midnight so
// two requests' time ranges can actually be compared.
export function parseTimeToMinutes(timeStr) {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec((timeStr || '').trim());
  if (!match) return null;
  let hour = parseInt(match[1], 10) % 12;
  if (/pm/i.test(match[3])) hour += 12;
  return hour * 60 + parseInt(match[2], 10);
}

// Two requests conflict if they're the same day, request at least one of
// the same room, and their event times overlap (touching end-to-end, e.g.
// one ending at 6:00 PM and the next starting at 6:00 PM, is not a
// conflict). Checked against every other request regardless of archived
// state - archiving just means "handled," not "no longer occupies the
// room," so a conflict with an already-handled request is still real.
export function findRoomConflicts(request, allRequests) {
  const start = parseTimeToMinutes(request.event_start_time);
  const end = parseTimeToMinutes(request.event_end_time);
  const rooms = request.rooms_requested || [];
  if (start === null || end === null || rooms.length === 0) return [];
  return allRequests.filter((other) => {
    if (other.id === request.id) return false;
    if (other.event_date !== request.event_date) return false;
    const otherRooms = other.rooms_requested || [];
    if (!rooms.some((room) => otherRooms.includes(room))) return false;
    const otherStart = parseTimeToMinutes(other.event_start_time);
    const otherEnd = parseTimeToMinutes(other.event_end_time);
    if (otherStart === null || otherEnd === null) return false;
    return start < otherEnd && otherStart < end;
  });
}
