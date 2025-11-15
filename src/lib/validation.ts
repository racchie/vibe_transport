/**
 * 共通バリデーションルール定義ファイル
 *
 * 交通費記録・経路管理で使用するフォーム入力のバリデーションルールを一元管理
 */

export const ValidationRules = {
  /**
   * 日付バリデーション
   * @param value 日付文字列 (YYYY-MM-DD 形式)
   * @returns true なら有効、false なら無効
   */
  isValidDate(value: string): boolean {
    // YYYY-MM-DD 形式であることを確認
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(value)) return false;

    // 実際の日付として有効か確認
    const date = new Date(value);
    return date instanceof Date && !isNaN(date.getTime());
  },

  /**
   * 駅名/バス停名バリデーション（テキスト形式）
   * @param value 駅名またはバス停名
   * @returns true なら有効、false なら無効
   */
  isValidStationName(value: string): boolean {
    // 空文字列は無効
    if (!value || value.trim().length === 0) return false;
    // 最大長チェック（100文字まで）
    if (value.length > 100) return false;
    return true;
  },

  /**
   * 交通手段バリデーション（選択式）
   * @param value 交通手段 ('train' または 'bus')
   * @returns true なら有効、false なら無効
   */
  isValidTransportationType(value: string): boolean {
    return value === 'train' || value === 'bus';
  },

  /**
   * 交通機関名バリデーション（テキスト形式、オプション）
   * @param value 交通機関名（空文字列は許可）
   * @returns true なら有効、false なら無効
   */
  isValidTransportationCompany(value: string): boolean {
    // 空文字列は許可（任意項目）
    if (value === '' || value === undefined) return true;
    // 最大長チェック（50文字まで）
    if (value.length > 50) return false;
    return true;
  },

  /**
   * 運賃バリデーション（数値形式）
   * @param value 運賃（文字列または数値）
   * @returns true なら有効、false なら無効
   */
  isValidFare(value: string | number): boolean {
    const num = typeof value === 'string' ? parseFloat(value) : value;

    // NaN チェック
    if (isNaN(num)) return false;

    // 0 以上の数値であること
    if (num < 0) return false;

    // 整数であることを推奨（小数点以下2桁までは許可）
    const decimalPlaces = (num.toString().split('.')[1] || '').length;
    if (decimalPlaces > 2) return false;

    return true;
  },

  /**
   * フォーム全体のバリデーション（記録・経路共通）
   * @param data フォーム入力データ
   * @returns {isValid: boolean, errors: {[key]: string}} バリデーション結果とエラーメッセージ
   */
  validateFormData(data: {
    date?: string;
    fromStation?: string;
    toStation?: string;
    transportationType?: string;
    transportationCompany?: string;
    fare?: string | number;
  }): { isValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    // 日付チェック
    if (data.date && !this.isValidDate(data.date)) {
      errors.date = '日付は YYYY-MM-DD 形式である必要があります';
    }

    // 出発駅/バス停チェック
    if (data.fromStation && !this.isValidStationName(data.fromStation)) {
      errors.fromStation = '出発駅/バス停の名前は 1〜100 文字である必要があります';
    }

    // 到着駅/バス停チェック
    if (data.toStation && !this.isValidStationName(data.toStation)) {
      errors.toStation = '到着駅/バス停の名前は 1〜100 文字である必要があります';
    }

    // 交通手段チェック
    if (data.transportationType && !this.isValidTransportationType(data.transportationType)) {
      errors.transportationType = '交通手段は「電車」または「バス」を選択してください';
    }

    // 交通機関名チェック
    if (data.transportationCompany && !this.isValidTransportationCompany(data.transportationCompany)) {
      errors.transportationCompany = '交通機関名は 50 文字以内である必要があります';
    }

    // 運賃チェック
    if (data.fare !== null && data.fare !== undefined && data.fare !== '') {
      if (!this.isValidFare(data.fare)) {
        errors.fare = '運賃は 0 以上の数値である必要があります（小数点以下 2 桁まで）';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },
};

/**
 * 数値文字列への変換（IME 対応）
 * テキスト入力フィールドから数値に変換する際に使用
 *
 * @param value 入力値
 * @returns 数値、またはパース失敗時は 0
 */
export function parseNumericInput(value: string | number): number {
  if (typeof value === 'number') {
    return value;
  }

  const trimmed = String(value).trim();
  const parsed = parseFloat(trimmed);

  // パース失敗時は 0 を返す
  return isNaN(parsed) ? 0 : parsed;
}

export default ValidationRules;
