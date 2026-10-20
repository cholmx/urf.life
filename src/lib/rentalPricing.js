// Shared between the /rental form (live price preview), the admin
// Rentals settings panel (editing prices), and the admin Submissions
// view (rendering a stored request's price_breakdown back into readable
// line items) - one source of truth for what each option costs and is
// called, instead of several places staying in sync by hand.
//
// Room/service ids and labels are fixed in code (the physical spaces and
// add-ons don't change often), but their dollar amounts are data - staff
// edit them from Admin, stored in facility_rental_settings_portal123's
// `pricing` column. DEFAULT_PRICING is the fallback used before that
// column has ever been read (or if a specific key is missing from it),
// so the form never breaks just because settings haven't loaded yet.

export const ROOM_OPTIONS = [
  { id: 'sanctuary', label: 'Sanctuary' },
  { id: 'fellowship_hall', label: 'Fellowship Hall' },
  { id: 'kitchen', label: 'Kitchen' },
  { id: 'pavilion', label: 'Pavilion' },
  { id: 'classroom', label: 'Classroom' }
]

// Clear Sanctuary Stage is a flat fee regardless of rental length; Sound
// Technician and Overhead Projector/AV scale with it. All three are only
// offered when the Sanctuary itself is part of the request.
export const SERVICE_OPTIONS = [
  { id: 'clear_stage', label: 'Clear Sanctuary Stage' },
  { id: 'sound_tech', label: 'Sound Technician' },
  { id: 'av', label: 'Overhead Projector/AV' }
]

export const DEFAULT_PRICING = {
  baseFeeMember: 25,
  baseFeeNonMember: 50,
  memberRoomDiscount: 0.7, // members pay 30% of room fees
  depositAmount: 50,
  rooms: {
    sanctuary: { half: 180, full: 350 },
    fellowship_hall: { half: 85, full: 150 },
    kitchen: { half: 75, full: 150 },
    pavilion: { half: 40, full: 55 },
    classroom: { half: 40, full: 55 }
  },
  services: {
    clear_stage: { half: 120, full: 120 },
    sound_tech: { half: 75, full: 150 },
    av: { half: 75, full: 150 }
  }
}

// Merges a possibly-partial pricing row from the database over the
// defaults, one section at a time - so adding a new room/service to
// ROOM_OPTIONS/SERVICE_OPTIONS later doesn't leave it priced at $0 just
// because an existing settings row predates it.
export function mergePricing(stored) {
  if (!stored) return DEFAULT_PRICING
  return {
    ...DEFAULT_PRICING,
    ...stored,
    rooms: { ...DEFAULT_PRICING.rooms, ...stored.rooms },
    services: { ...DEFAULT_PRICING.services, ...stored.services }
  }
}

// rooms: { [roomId]: 'half' | 'full' }, services: array of service ids.
// sanctuaryDuration is whichever duration the Sanctuary itself was booked
// for (services are priced off that, not their own separate duration).
// The returned breakdown (baseFee/roomBreakdown/serviceBreakdown/etc.) is
// what gets saved verbatim as a request's price_breakdown - a record of
// exactly what was charged and why, independent of whatever the prices
// happen to be later.
export function calculateRentalTotal({ isMember, rooms, services, pricing = DEFAULT_PRICING }) {
  const baseFee = isMember ? pricing.baseFeeMember : pricing.baseFeeNonMember

  let roomTotal = 0
  const roomBreakdown = []
  for (const option of ROOM_OPTIONS) {
    const duration = rooms[option.id]
    if (duration === 'half' || duration === 'full') {
      const amount = pricing.rooms[option.id]?.[duration] ?? 0
      roomTotal += amount
      roomBreakdown.push({ id: option.id, label: option.label, duration, amount })
    }
  }
  const roomTotalAfterDiscount = isMember ? roomTotal * (1 - pricing.memberRoomDiscount) : roomTotal

  const sanctuaryDuration = rooms.sanctuary
  let servicesTotal = 0
  const serviceBreakdown = []
  if (sanctuaryDuration === 'half' || sanctuaryDuration === 'full') {
    for (const option of SERVICE_OPTIONS) {
      if (services.includes(option.id)) {
        const amount = pricing.services[option.id]?.[sanctuaryDuration] ?? 0
        servicesTotal += amount
        serviceBreakdown.push({ id: option.id, label: option.label, amount })
      }
    }
  }

  const total = baseFee + roomTotalAfterDiscount + servicesTotal

  return {
    isMember,
    baseFee,
    roomBreakdown,
    roomTotal,
    memberRoomDiscount: pricing.memberRoomDiscount,
    roomTotalAfterDiscount,
    serviceBreakdown,
    servicesTotal,
    depositAmount: pricing.depositAmount,
    total: Math.round(total * 100) / 100
  }
}

export function roomLabel(roomId, duration) {
  const option = ROOM_OPTIONS.find((r) => r.id === roomId)
  if (!option) return roomId
  return `${option.label} (${duration === 'full' ? 'Full Day' : 'Half Day'})`
}

export function serviceLabel(serviceId) {
  return SERVICE_OPTIONS.find((s) => s.id === serviceId)?.label || serviceId
}
