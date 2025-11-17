import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNearbyPlaces } from '../src/hooks/useNearbyPlaces';

// Mock geolocation
function mockGeolocation(success = true) {
  const getCurrentPosition = vi.fn().mockImplementation((successCb, errorCb) => {
    if (success) {
      successCb({ coords: { latitude: 35.681236, longitude: 139.767125, accuracy: 10 } });
    } else {
      errorCb({ code: 1 }); // PERMISSION_DENIED
    }
  });
  Object.defineProperty(global.navigator, 'geolocation', {
    value: { getCurrentPosition },
    configurable: true,
  });
}

// Mock fetch for HeartRails
function mockHeartRails(stations: Array<{ name: string; line: string; x: string; y: string; distance?: string }> = []) {
  vi.spyOn(global, 'fetch').mockResolvedValue({
    ok: true,
    json: async () => ({ response: { station: stations } }),
  } as Response);
}

describe('useNearbyPlaces', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns candidates after successful geolocation and API', async () => {
    mockGeolocation(true);
    mockHeartRails([
      { name: '東京', line: 'JR山手線', x: '139.767125', y: '35.681236', distance: '120' },
      { name: '有楽町', line: 'JR山手線', x: '139.7638', y: '35.6751', distance: '600' },
    ]);

    const { result } = renderHook(() => useNearbyPlaces());

    await act(async () => {
      await result.current.fetchFromCurrentLocation('station');
    });

    expect(result.current.status).toBe('success');
    expect(result.current.candidates.length).toBeGreaterThan(0);
    expect(result.current.candidates[0].name).toBe('東京');
  });

  it('handles permission denied error', async () => {
    mockGeolocation(false);

    const { result } = renderHook(() => useNearbyPlaces());

    await act(async () => {
      await result.current.fetchFromCurrentLocation('station');
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error?.code).toBe('permission-denied');
  });
});
