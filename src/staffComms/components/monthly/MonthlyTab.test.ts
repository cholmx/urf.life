import { describe, it, expect } from 'vitest';
import { getScaleParams } from './MonthlyTab';

// Lighter than BulletinTab's fit tests - getScaleParams has no physical-fit
// check of its own (it's a pure count -> size lookup, unlike the Bulletin's
// budget-aware pickBulletinScale), so what's worth locking in here is that
// it never throws or goes non-monotonic, not that content always fits.
describe('getScaleParams', () => {
  it('never throws and always returns a complete ScaleParams for any count', () => {
    for (const count of [0, 1, 4, 5, 6, 7, 8, 9, 11, 12, 20, 100]) {
      for (const hasBathroom of [false, true]) {
        const s = getScaleParams(count, hasBathroom);
        expect(s.titleFontSize).toBeGreaterThan(0);
        expect(s.bodyFontSize).toBeGreaterThan(0);
        expect(Number.isFinite(s.headerFontSize)).toBe(true);
      }
    }
  });

  it('shrinks (or holds steady) as count increases - never gets bigger for a busier month', () => {
    let prev = getScaleParams(0, false);
    for (const count of [1, 4, 5, 6, 7, 8, 9, 11, 12, 20, 50]) {
      const s = getScaleParams(count, false);
      expect(s.titleFontSize).toBeLessThanOrEqual(prev.titleFontSize);
      expect(s.bodyFontSize).toBeLessThanOrEqual(prev.bodyFontSize);
      prev = s;
    }
  });

  it('treats the bathroom variant as two extra items, never producing larger text than the non-bathroom page at the same count', () => {
    for (const count of [0, 3, 4, 6, 7, 10, 11, 15]) {
      const normal = getScaleParams(count, false);
      const bathroom = getScaleParams(count, true);
      expect(bathroom.titleFontSize).toBeLessThanOrEqual(normal.titleFontSize);
      expect(bathroom.bodyFontSize).toBeLessThanOrEqual(normal.bodyFontSize);
    }
  });
});
