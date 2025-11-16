/**
 * Geolocation API のユーティリティ
 * 位置情報取得をPromise化し、エラーハンドリングを統一
 */

export interface GeolocationPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export type GeolocationErrorCode =
  | 'permission-denied'
  | 'position-unavailable'
  | 'timeout'
  | 'not-supported';

export class GeolocationError extends Error {
  constructor(
    public code: GeolocationErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'GeolocationError';
  }
}

export interface GeolocationOptions {
  timeout?: number;
  enableHighAccuracy?: boolean;
  maximumAge?: number;
}

/**
 * 現在地を取得する（Promise化）
 */
export async function getCurrentPosition(
  options: GeolocationOptions = {}
): Promise<GeolocationPosition> {
  // Geolocation API 非対応チェック
  if (!navigator.geolocation) {
    throw new GeolocationError(
      'not-supported',
      'お使いのブラウザは位置情報機能に対応していません。'
    );
  }

  const {
    timeout = 8000,
    enableHighAccuracy = true,
    maximumAge = 0,
  } = options;

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        // GeolocationPositionError codes: 1: PERMISSION_DENIED, 2: POSITION_UNAVAILABLE, 3: TIMEOUT
        switch (error.code) {
          case 1:
            reject(
              new GeolocationError(
                'permission-denied',
                '位置情報の利用が拒否されました。ブラウザ設定をご確認ください。'
              )
            );
            break;
          case 2:
            reject(
              new GeolocationError(
                'position-unavailable',
                '位置情報を取得できませんでした。GPS や Wi-Fi が有効か確認してください。'
              )
            );
            break;
          case 3:
            reject(
              new GeolocationError(
                'timeout',
                '位置情報の取得がタイムアウトしました。もう一度お試しください。'
              )
            );
            break;
          default:
            reject(
              new GeolocationError(
                'position-unavailable',
                '位置情報の取得中にエラーが発生しました。'
              )
            );
        }
      },
      {
        timeout,
        enableHighAccuracy,
        maximumAge,
      }
    );
  });
}

/**
 * 位置情報の許可状態を取得（対応ブラウザのみ）
 */
export async function getPermissionState(): Promise<
  'granted' | 'denied' | 'prompt' | 'unsupported'
> {
  // Permissions API 非対応の場合
  if (!navigator.permissions || !navigator.permissions.query) {
    return 'unsupported';
  }

  try {
    const result = await navigator.permissions.query({ name: 'geolocation' });
    return result.state;
  } catch {
    // エラー時は unsupported として扱う
    return 'unsupported';
  }
}
