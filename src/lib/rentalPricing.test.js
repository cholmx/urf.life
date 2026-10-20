import { describe, it, expect } from 'vitest';
import { DEFAULT_PRICING, mergePricing, calculateRentalTotal, roomLabel, serviceLabel } from './rentalPricing';

describe('mergePricing', () => {
  it('returns DEFAULT_PRICING when stored is null', () => {
    expect(mergePricing(null)).toEqual(DEFAULT_PRICING);
  });

  it('overlays top-level fields from stored', () => {
    const merged = mergePricing({ baseFeeMember: 30, depositAmount: 75 });
    expect(merged.baseFeeMember).toBe(30);
    expect(merged.depositAmount).toBe(75);
    expect(merged.baseFeeNonMember).toBe(DEFAULT_PRICING.baseFeeNonMember);
  });

  it('merges rooms and services per-key instead of replacing the whole object', () => {
    const merged = mergePricing({ rooms: { sanctuary: { half: 200, full: 400 } } });
    expect(merged.rooms.sanctuary).toEqual({ half: 200, full: 400 });
    expect(merged.rooms.kitchen).toEqual(DEFAULT_PRICING.rooms.kitchen);
    expect(merged.services).toEqual(DEFAULT_PRICING.services);
  });
});

describe('calculateRentalTotal', () => {
  it('charges non-members the full base fee and room rate with no discount', () => {
    const result = calculateRentalTotal({
      isMember: false,
      rooms: { fellowship_hall: 'full' },
      services: [],
      pricing: DEFAULT_PRICING
    });
    expect(result.baseFee).toBe(50);
    expect(result.roomTotal).toBe(150);
    expect(result.roomTotalAfterDiscount).toBe(150);
    expect(result.total).toBe(200);
  });

  it('applies the member room discount but not to the base fee', () => {
    const result = calculateRentalTotal({
      isMember: true,
      rooms: { fellowship_hall: 'full' },
      services: [],
      pricing: DEFAULT_PRICING
    });
    expect(result.baseFee).toBe(25);
    expect(result.roomTotal).toBe(150);
    expect(result.roomTotalAfterDiscount).toBeCloseTo(45, 5);
    expect(result.total).toBeCloseTo(70, 5);
  });

  it('includes rooms the renter selected in roomBreakdown with labels', () => {
    const result = calculateRentalTotal({
      isMember: false,
      rooms: { sanctuary: 'half', kitchen: 'full' },
      services: [],
      pricing: DEFAULT_PRICING
    });
    expect(result.roomBreakdown).toEqual([
      { id: 'sanctuary', label: 'Sanctuary', duration: 'half', amount: 180 },
      { id: 'kitchen', label: 'Kitchen', duration: 'full', amount: 150 }
    ]);
  });

  it('only prices services when the sanctuary itself is booked', () => {
    const withoutSanctuary = calculateRentalTotal({
      isMember: false,
      rooms: { kitchen: 'full' },
      services: ['sound_tech'],
      pricing: DEFAULT_PRICING
    });
    expect(withoutSanctuary.serviceBreakdown).toEqual([]);
    expect(withoutSanctuary.servicesTotal).toBe(0);

    const withSanctuary = calculateRentalTotal({
      isMember: false,
      rooms: { sanctuary: 'full' },
      services: ['sound_tech'],
      pricing: DEFAULT_PRICING
    });
    expect(withSanctuary.serviceBreakdown).toEqual([
      { id: 'sound_tech', label: 'Sound Technician', amount: 150 }
    ]);
    expect(withSanctuary.servicesTotal).toBe(150);
  });

  it('prices services off the sanctuary duration, not a separate one', () => {
    const result = calculateRentalTotal({
      isMember: false,
      rooms: { sanctuary: 'half' },
      services: ['av'],
      pricing: DEFAULT_PRICING
    });
    expect(result.serviceBreakdown[0].amount).toBe(75);
  });

  it('reflects custom pricing rather than the defaults', () => {
    const customPricing = mergePricing({ baseFeeNonMember: 100, rooms: { pavilion: { half: 60, full: 90 } } });
    const result = calculateRentalTotal({
      isMember: false,
      rooms: { pavilion: 'full' },
      services: [],
      pricing: customPricing
    });
    expect(result.baseFee).toBe(100);
    expect(result.roomTotal).toBe(90);
    expect(result.total).toBe(190);
  });
});

describe('roomLabel', () => {
  it('formats a known room with its duration', () => {
    expect(roomLabel('sanctuary', 'full')).toBe('Sanctuary (Full Day)');
    expect(roomLabel('kitchen', 'half')).toBe('Kitchen (Half Day)');
  });

  it('falls back to the raw id for an unknown room', () => {
    expect(roomLabel('unknown_room', 'full')).toBe('unknown_room');
  });
});

describe('serviceLabel', () => {
  it('returns the label for a known service', () => {
    expect(serviceLabel('clear_stage')).toBe('Clear Sanctuary Stage');
  });

  it('falls back to the raw id for an unknown service', () => {
    expect(serviceLabel('unknown_service')).toBe('unknown_service');
  });
});
