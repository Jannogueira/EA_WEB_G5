import { describe, it, expect } from 'vitest';
import { getDistance } from './distance';

describe('Distance Helper', () => {
  it('should calculate distance correctly between two close points', () => {
    // Barcelona center to UPC Campus Nord
    const lat1 = 41.38879; // Pl. Catalunya
    const lon1 = 2.17006;
    const lat2 = 41.3892; // UPC Campus Nord :)
    const lon2 = 2.113;

    const distance = getDistance(lat1, lon1, lat2, lon2);
    // Should be around 4.7km (4700 meters) :)
    expect(distance).toBeGreaterThan(4500);
    expect(distance).toBeLessThan(5000);
  });

  it('should calculate 0 distance for the same point', () => {
    const lat = 41.3892;
    const lon = 2.113;
    expect(getDistance(lat, lon, lat, lon)).toBe(0);
  });
});
