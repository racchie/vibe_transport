export type TransportationType = 'train' | 'bus';

export interface TravelRecord {
  id: string;
  date: string;
  fromStation: string;
  toStation: string;
  transportationType: TransportationType;
  transportationCompany?: string;
  fare: number;
}

export interface FrequentRoute {
  id: string;
  name: string;
  fromStation: string;
  toStation: string;
  transportationType: TransportationType;
  transportationCompany?: string;
  fare: number;
}

/**
 * 位置情報検索で取得する場所（駅・バス停など）
 */
export type PlaceType = 'station' | 'bus';

export interface Place {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  type: PlaceType;
  /** 運営事業者・路線名（例: "JR山手線"） */
  operator?: string;
  /** 現在地からの距離（メートル） */
  distanceMeters: number;
}

/**
 * 場所検索プロバイダのインターフェース
 */
export interface PlaceSearchProvider {
  /**
   * 指定位置の近くにある場所を検索
   * @param latitude 緯度
   * @param longitude 経度
   * @param type 検索対象の種別
   * @param options 追加オプション（最大件数など）
   */
  searchNearby(
    latitude: number,
    longitude: number,
    type: PlaceType,
    options?: { maxResults?: number }
  ): Promise<Place[]>;
}
