// Shared between the /rental form (live price preview) and the admin
// Submissions view (rendering a stored request's room/service ids back
// into readable labels) - one source of truth for what each option costs
// and is called, instead of the two staying in sync by hand.

export const ROOM_OPTIONS = [
  { id: 'sanctuary', label: 'Sanctuary', half: 180, full: 350 },
  { id: 'fellowship_hall', label: 'Fellowship Hall', half: 85, full: 150 },
  { id: 'kitchen', label: 'Kitchen', half: 75, full: 150 },
  { id: 'pavilion', label: 'Pavilion', half: 40, full: 55 },
  { id: 'classroom', label: 'Classroom', half: 40, full: 55 }
]

// Clear Sanctuary Stage is a flat fee regardless of rental length; Sound
// Technician and Overhead Projector/AV scale with it. All three are only
// offered when the Sanctuary itself is part of the request.
export const SERVICE_OPTIONS = [
  { id: 'clear_stage', label: 'Clear Sanctuary Stage', half: 120, full: 120 },
  { id: 'sound_tech', label: 'Sound Technician', half: 75, full: 150 },
  { id: 'av', label: 'Overhead Projector/AV', half: 75, full: 150 }
]

export const DEPOSIT_AMOUNT = 50
export const BASE_FEE_MEMBER = 25
export const BASE_FEE_NON_MEMBER = 50
export const MEMBER_ROOM_DISCOUNT = 0.7 // members pay 30% of room fees

// rooms: { [roomId]: 'half' | 'full' }, services: array of service ids.
// sanctuaryDuration is whichever duration the Sanctuary itself was booked
// for (services are priced off that, not their own separate duration).
export function calculateRentalTotal({ isMember, rooms, services }) {
  const baseFee = isMember ? BASE_FEE_MEMBER : BASE_FEE_NON_MEMBER

  let roomTotal = 0
  for (const option of ROOM_OPTIONS) {
    const duration = rooms[option.id]
    if (duration === 'half' || duration === 'full') {
      roomTotal += option[duration]
    }
  }
  const roomTotalAfterDiscount = isMember ? roomTotal * (1 - MEMBER_ROOM_DISCOUNT) : roomTotal

  const sanctuaryDuration = rooms.sanctuary
  let servicesTotal = 0
  if (sanctuaryDuration === 'half' || sanctuaryDuration === 'full') {
    for (const option of SERVICE_OPTIONS) {
      if (services.includes(option.id)) {
        servicesTotal += option[sanctuaryDuration]
      }
    }
  }

  const total = baseFee + roomTotalAfterDiscount + servicesTotal

  return {
    baseFee,
    roomTotal,
    roomTotalAfterDiscount,
    servicesTotal,
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
