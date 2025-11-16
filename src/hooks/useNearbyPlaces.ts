/**
 * 現在地から近くの場所（駅・バス停）を取得するフック
 */

import { useState } from 'react';
import type { Place, PlaceType } from '../types';
import {
  getCurrentPosition,
  GeolocationError,
  type GeolocationErrorCode,
} from '../lib/geolocation';
import { HeartRailsProvider } from '../lib/places/providers/heartrails';

export type NearbyPlacesStatus =
  | 'idle'
  | 'locating'
  | 'loading'
  | 'success'
  | 'error';

export interface NearbyPlacesError {
  code: GeolocationErrorCode | 'api-error';
  message: string;
}

export interface UseNearbyPlacesResult {
  status: NearbyPlacesStatus;
  candidates: Place[];
  error: NearbyPlacesError | null;
  fetchFromCurrentLocation: (type: PlaceType) => Promise<void>;
  reset: () => void;
}

const placeProvider = new HeartRailsProvider();

export function useNearbyPlaces(): UseNearbyPlacesResult {
  const [status, setStatus] = useState<NearbyPlacesStatus>('idle');
  const [candidates, setCandidates] = useState<Place[]>([]);
  const [error, setError] = useState<NearbyPlacesError | null>(null);

  const fetchFromCurrentLocation = async (type: PlaceType) => {
    setStatus('locating');
    setError(null);
    setCandidates([]);

    try {
      // 1. 現在地を取得
      const position = await getCurrentPosition({
        timeout: 8000,
        enableHighAccuracy: true,
      });

      // 2. 最寄りの場所を検索
      setStatus('loading');
      const places = await placeProvider.searchNearby(
        position.latitude,
        position.longitude,
        type,
        { maxResults: 10 }
      );

      setCandidates(places);
      setStatus('success');
    } catch (err) {
      if (err instanceof GeolocationError) {
        setError({
          code: err.code,
          message: err.message,
        });
      } else if (err instanceof Error) {
        setError({
          code: 'api-error',
          message: err.message,
        });
      } else {
        setError({
          code: 'api-error',
          message: '予期しないエラーが発生しました。',
        });
      }
      setStatus('error');
    }
  };

  const reset = () => {
    setStatus('idle');
    setCandidates([]);
    setError(null);
  };

  return {
    status,
    candidates,
    error,
    fetchFromCurrentLocation,
    reset,
  };
}
