/**
 * HeartRails Express API を使った駅検索プロバイダ
 * API仕様: http://express.heartrails.com/api.html
 */

import type { Place, PlaceSearchProvider, PlaceType } from '../../../types';

interface HeartRailsStation {
  name: string;
  line: string;
  x: string; // 経度
  y: string; // 緯度
  distance?: string; // 距離（メートル単位の文字列、最寄駅APIのみ）
  prefecture?: string;
  postal?: string;
  prev?: string | null;
  next?: string | null;
}

interface HeartRailsResponse {
  response: {
    station: HeartRailsStation[];
  };
}

/**
 * Haversine 公式で2点間の距離（メートル）を計算
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // 地球の半径（メートル）
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export class HeartRailsProvider implements PlaceSearchProvider {
  private readonly baseUrl = 'https://express.heartrails.com/api/json';

  async searchNearby(
    latitude: number,
    longitude: number,
    type: PlaceType,
    options?: { maxResults?: number }
  ): Promise<Place[]> {
    // HeartRails は駅のみ対応
    if (type !== 'station') {
      return [];
    }

    const maxResults = options?.maxResults ?? 10;

    try {
      const url = new URL(this.baseUrl);
      url.searchParams.set('method', 'getStations');
      url.searchParams.set('x', longitude.toString());
      url.searchParams.set('y', latitude.toString());

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`HeartRails API error: ${response.status}`);
      }

      const data: HeartRailsResponse = await response.json();

      if (!data.response?.station || !Array.isArray(data.response.station)) {
        return [];
      }

      // Place[] に変換
      const places: Place[] = data.response.station
        .map((station, index): Place => {
          const stationLat = parseFloat(station.y);
          const stationLon = parseFloat(station.x);
          const distance = station.distance
            ? parseFloat(station.distance)
            : calculateDistance(latitude, longitude, stationLat, stationLon);

          return {
            id: `heartrails-${station.line}-${station.name}-${index}`,
            name: station.name,
            latitude: stationLat,
            longitude: stationLon,
            type: 'station',
            operator: station.line,
            distanceMeters: Math.round(distance),
          };
        })
        .filter((place) => !isNaN(place.latitude) && !isNaN(place.longitude))
        .sort((a, b) => a.distanceMeters - b.distanceMeters)
        .slice(0, maxResults);

      return places;
    } catch (error) {
      console.error('HeartRails API error:', error);
      throw new Error(
        '最寄り駅情報の取得に失敗しました。ネットワーク接続をご確認ください。'
      );
    }
  }
}
