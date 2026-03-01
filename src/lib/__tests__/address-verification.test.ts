/**
 * Tests for Address Verification Service
 */

import {
  verifyAddress,
  getCachedAddress,
  cacheVerifiedAddress,
  clearAddressCache,
  verifyMultipleAddresses,
  isAddressValid,
} from '../address-verification';

describe('Address Verification Service', () => {
  beforeEach(() => {
    clearAddressCache();
    jest.clearAllMocks();
  });

  describe('verifyAddress()', () => {
    it('should reject empty addresses', async () => {
      const result = await verifyAddress('');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('empty');
    });

    it('should reject null or non-string addresses', async () => {
      const result = await verifyAddress(null as any);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('non-empty string');
    });

    it('should return error when API key is missing', async () => {
      const originalKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      delete process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

      const result = await verifyAddress('1600 Amphitheatre Parkway, Mountain View, CA');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Missing API configuration');

      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = originalKey;
    });

    it('should return cached result if available', async () => {
      const address = '1600 Amphitheatre Parkway, Mountain View, CA';
      const cachedResult = {
        isValid: true,
        lat: 37.4224764,
        lng: -122.0842499,
        formattedAddress: '1600 Amphitheatre Parkway, Mountain View, CA 94043, USA',
      };

      cacheVerifiedAddress(address, cachedResult);

      const result = await verifyAddress(address);
      expect(result.cached).toBe(true);
      expect(result.lat).toBe(37.4224764);
      expect(result.lng).toBe(-122.0842499);
    });

    it('should handle network errors gracefully', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      const result = await verifyAddress('some address');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Network error');
    });

    it('should handle API response errors', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          status: 'ZERO_RESULTS',
          results: [],
        }),
      });

      const result = await verifyAddress('Invalid Address XYZ');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Address not found');
    });
  });

  describe('cacheVerifiedAddress() & getCachedAddress()', () => {
    it('should store and retrieve cached address', () => {
      const address = '1600 Amphitheatre Parkway, Mountain View, CA';
      const result = {
        isValid: true,
        lat: 37.4224764,
        lng: -122.0842499,
        formattedAddress: '1600 Amphitheatre Parkway, Mountain View, CA 94043, USA',
      };

      cacheVerifiedAddress(address, result);
      const cached = getCachedAddress(address);

      expect(cached).toBeDefined();
      expect(cached?.isValid).toBe(true);
      expect(cached?.lat).toBe(37.4224764);
      expect(cached?.cached).toBe(true);
    });

    it('should return null for non-existent cache entry', () => {
      const cached = getCachedAddress('nonexistent address');
      expect(cached).toBeNull();
    });

    it('should handle localStorage errors gracefully', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();

      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: jest.fn(() => {
            throw new Error('Storage error');
          }),
        },
        writable: true,
      });

      const cached = getCachedAddress('test address');
      expect(cached).toBeNull();
      expect(consoleError).toHaveBeenCalled();

      consoleError.mockRestore();
    });
  });

  describe('clearAddressCache()', () => {
    it('should clear all cached addresses', () => {
      const address1 = 'Address 1';
      const address2 = 'Address 2';
      const result = { isValid: true };

      cacheVerifiedAddress(address1, result as any);
      cacheVerifiedAddress(address2, result as any);

      clearAddressCache();

      expect(getCachedAddress(address1)).toBeNull();
      expect(getCachedAddress(address2)).toBeNull();
    });
  });

  describe('verifyMultipleAddresses()', () => {
    it('should verify multiple addresses sequentially', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          status: 'OK',
          results: [
            {
              formatted_address: 'Test Address',
              geometry: {
                location: {
                  lat: 40.7128,
                  lng: -74.006,
                },
              },
            },
          ],
        }),
      });

      const addresses = ['Address 1', 'Address 2', 'Address 3'];
      const results = await verifyMultipleAddresses(addresses);

      expect(results).toHaveLength(3);
      expect(results.every((r) => r.isValid)).toBe(true);
    });
  });

  describe('isAddressValid()', () => {
    it('should return true for valid address', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          status: 'OK',
          results: [
            {
              formatted_address: 'Valid Address',
              geometry: {
                location: {
                  lat: 40.7128,
                  lng: -74.006,
                },
              },
            },
          ],
        }),
      });

      const isValid = await isAddressValid('Valid Address');
      expect(isValid).toBe(true);
    });

    it('should return false for invalid address', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          status: 'ZERO_RESULTS',
          results: [],
        }),
      });

      const isValid = await isAddressValid('Invalid Address XYZ');
      expect(isValid).toBe(false);
    });
  });

  describe('Rate Limiting', () => {
    it('should rate limit consecutive requests', async () => {
      const address = 'Test Address';

      // First request should succeed
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          status: 'OK',
          results: [
            {
              formatted_address: 'Test Address',
              geometry: {
                location: {
                  lat: 40.7128,
                  lng: -74.006,
                },
              },
            },
          ],
        }),
      });

      await verifyAddress(address);

      // Second request within 500ms should be rate limited
      const result = await verifyAddress(address);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Rate limited');
    });
  });
});
