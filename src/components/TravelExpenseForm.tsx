import { useState, useEffect, useRef } from 'react';
import { TravelRecord, TransportationType, Place } from '../types';
import { ValidationRules, parseNumericInput } from '../lib/validation';
import { RAILWAY_COMPANIES, BUS_COMPANIES, guessCompanyFromLine as guessCompFromLine } from '../lib/transportationCompanies';
import { useNearbyPlaces } from '../hooks/useNearbyPlaces';
import { formatCurrency } from '../lib/formatting';

interface TravelExpenseFormProps {
  onSubmit?: (record: Omit<TravelRecord, 'id'>) => void;
  onUpdate?: (record: TravelRecord) => void;
  onCancel?: () => void;
  initialRecord?: TravelRecord | null;
  addToast?: (message: string, options?: { type?: 'success' | 'error' | 'warning' | 'info'; timeout?: number }) => void;
}

export default function TravelExpenseForm({ onSubmit, onUpdate, onCancel, initialRecord = null, addToast }: TravelExpenseFormProps) {
  const [formData, setFormData] = useState({
    // Keep initial empty to avoid SSR/client mismatch; populate on client mount.
    id: '' as string | undefined,
    date: '',
    fromStation: '',
    toStation: '',
    transportationType: 'train' as TransportationType,
    transportationCompany: '',
    fare: '', // 文字列に変更（IME 入力対応）
  });

  // 位置情報検索用の状態
  const { status, candidates, error, fetchFromCurrentLocation, searchByName, reset } = useNearbyPlaces();
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formWarnings, setFormWarnings] = useState<Record<string, string>>({});
  const [typingTimer, setTypingTimer] = useState<number | null>(null);
  const [showCandidates, setShowCandidates] = useState(false);
  const [targetField, setTargetField] = useState<'from' | 'to' | null>(null);
  const candidatesRef = useRef<HTMLDivElement>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  // Populate form on client mount: if editing, use provided record; otherwise set today's date.
  useEffect(() => {
    if (initialRecord) {
      setFormData({
        id: initialRecord.id,
        date: initialRecord.date,
        fromStation: initialRecord.fromStation,
        toStation: initialRecord.toStation,
        transportationType: initialRecord.transportationType,
        transportationCompany: initialRecord.transportationCompany || '',
        fare: String(initialRecord.fare),
      });
      return;
    }
    // Reset to new-entry state when there's no initialRecord
    // eslint-disable-next-line no-restricted-syntax
    const today = new Date().toISOString().split('T')[0];
    setFormData({ id: undefined, date: today, fromStation: '', toStation: '', transportationType: 'train', transportationCompany: '', fare: '' });
  }, [initialRecord]);

  // Confirmation modal state for update
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<null | TravelRecord>(null);

  // 位置情報から駅を取得
  const handleFetchNearby = async (field: 'from' | 'to') => {
    setTargetField(field);
    setShowCandidates(false);
    setHighlightedIndex(0);
    
    try {
      await fetchFromCurrentLocation('station');
      setShowCandidates(true);
      // 先頭をハイライト
      setHighlightedIndex(0);
    } catch {
      // エラーは useNearbyPlaces で管理されている
    }
  };

  // 候補を選択
  const handleSelectCandidate = (place: Place) => {
    if (targetField === 'from') {
      setFormData((prev) => ({
        ...prev,
        fromStation: place.name,
        transportationType: 'train', // 駅を選択したので自動的に電車に
        transportationCompany: guessCompFromLine(place.operator || prev.transportationCompany || ''),
      }));
    } else if (targetField === 'to') {
      setFormData((prev) => ({
        ...prev,
        toStation: place.name,
        transportationType: 'train', // 駅を選択したので自動的に電車に
        transportationCompany: guessCompFromLine(place.operator || prev.transportationCompany || ''),
      }));
    }
    setShowCandidates(false);
    reset();
    
    if (addToast) {
      addToast(`${place.name} を選択しました`, { type: 'success' });
    }
  };

  

  // エラー時のトースト表示
  useEffect(() => {
    if (status === 'error' && error && addToast) {
      addToast(error.message, { type: 'error' });
      setShowCandidates(false);
    }
  }, [status, error, addToast]);

  // ポップオーバー外クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (candidatesRef.current && !candidatesRef.current.contains(event.target as Node)) {
        setShowCandidates(false);
        reset();
      }
    };

    if (showCandidates) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showCandidates, reset]);

  // 候補のキーボード操作（入力欄で制御）
  const handleCandidatesKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, field: 'from' | 'to') => {
    if (!showCandidates || targetField !== field) return;
    if (candidates.length === 0) {
      if (e.key === 'Escape') {
        setShowCandidates(false);
        reset();
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % candidates.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + candidates.length) % candidates.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const place = candidates[highlightedIndex];
      if (place) handleSelectCandidate(place);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setShowCandidates(false);
      reset();
    }
  };

  const validateField = (name: string, value: string) => {
    const errors = { ...formErrors };
    const warnings = { ...formWarnings };
    delete errors[name];
    delete warnings[name];

    switch (name) {
      case 'date':
        if (value && !ValidationRules.isValidDate(value)) {
          errors.date = '日付は YYYY-MM-DD 形式である必要があります';
        }
        break;
      case 'fromStation':
        if (value && !ValidationRules.isValidStationName(value)) {
          errors.fromStation = '出発駅/バス停の名前は 1〜100 文字である必要があります';
        }
        break;
      case 'toStation':
        if (value && !ValidationRules.isValidStationName(value)) {
          errors.toStation = '到着駅/バス停の名前は 1〜100 文字である必要があります';
        }
        break;
      case 'transportationCompany':
        if (value && !ValidationRules.isValidTransportationCompany(value)) {
          errors.transportationCompany = '交通機関名は 50 文字以内である必要があります';
        }
        break;
      case 'fare':
        const num = parseNumericInput(value);
        if (!ValidationRules.isValidFare(num)) {
          errors.fare = '運賃は 0 以上の数値である必要があります（小数点以下 2 桁まで）';
        } else {
          if (num < 100) warnings.fare = '運賃が 100円未満です。低額の可能性があります。';
          else if (num > 10000) warnings.fare = '運賃が 10,000円を超えています。高額の可能性があります。';
          if (num > 50000) errors.fare = '運賃は 50,000円以下である必要があります';
        }
        break;
      default:
        break;
    }

    setFormErrors(errors);
    setFormWarnings(warnings);
  };

  const debouncedSearch = (query: string, field: 'from' | 'to') => {
    if (typingTimer) {
      window.clearTimeout(typingTimer);
    }
    const t = window.setTimeout(async () => {
      if (query.trim().length >= 2) {
        setTargetField(field);
        try {
          await searchByName(query, 'station');
          setShowCandidates(true);
          setHighlightedIndex(0);
        } catch {
          // noop
        }
      }
    }, 300);
    setTypingTimer(t);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Synchronous validation to avoid stale state
    const errors: Record<string, string> = {};
    const warnings: Record<string, string> = {};
    if (!ValidationRules.isValidStationName(formData.fromStation)) {
      errors.fromStation = '出発駅/バス停の名前は 1〜100 文字である必要があります';
    }
    if (!ValidationRules.isValidStationName(formData.toStation)) {
      errors.toStation = '到着駅/バス停の名前は 1〜100 文字である必要があります';
    }
    const fareNum = parseNumericInput(formData.fare);
    if (!ValidationRules.isValidFare(fareNum)) {
      errors.fare = '運賃は 0 以上の数値である必要があります（小数点以下 2 桁まで）';
    } else {
      if (fareNum < 100) warnings.fare = '運賃が 100円未満です。低額の可能性があります。';
      if (fareNum > 10000) warnings.fare = '運賃が 10,000円を超えています。高額の可能性があります。';
    }
    if (!ValidationRules.isValidTransportationCompany(formData.transportationCompany)) {
      errors.transportationCompany = '交通機関名は 50 文字以内である必要があります';
    }
    setFormErrors(errors);
    setFormWarnings(warnings);
    if (Object.keys(errors).length > 0) {
      // Block submission if any validation errors still exist
      // Provide user-friendly feedback; inline messages already shown
      return;
    }

    const fareNumber = parseNumericInput(formData.fare);

    const payload = {
      date: formData.date,
      fromStation: formData.fromStation,
      toStation: formData.toStation,
      transportationType: formData.transportationType,
      transportationCompany: formData.transportationCompany || undefined,
      fare: fareNumber,
    };

    if (formData.id && onUpdate) {
      // Show confirmation modal before updating
      const updated: TravelRecord = { ...(payload as Omit<TravelRecord, 'id'>), id: formData.id };
      setPendingPayload(updated);
      setShowConfirm(true);
    } else if (onSubmit) {
      onSubmit(payload as Omit<TravelRecord, 'id'>);
      setFormData((prev) => ({ ...prev, fromStation: '', toStation: '', transportationCompany: '', fare: '' }));
    }
  };

  // Ctrl+Enterでフォーム送信
  const handleFormKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      const form = e.currentTarget as HTMLFormElement;
      form.dispatchEvent(new Event('submit', { bubbles: true }));
    }
  };

  const isEditing = Boolean(formData.id);

  const resetToNew = () => {
    // eslint-disable-next-line no-restricted-syntax
    const today = new Date().toISOString().split('T')[0];
    setFormData({ id: undefined, date: today, fromStation: '', toStation: '', transportationType: 'train', transportationCompany: '', fare: '' });
    setPendingPayload(null);
    setShowConfirm(false);
  };

  return (
    <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown} className="space-y-4">
      {/* 日付と交通手段（2カラム: タブレット以上） */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium">
            日付
          </label>
          <input
            type="date"
            id="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm bg-white dark:bg-gray-900 dark:text-gray-100 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 min-h-[44px]"
            required
          />
        </div>

        <div>
          <label htmlFor="transportationType" className="block text-sm font-medium">
            交通手段
          </label>
          <select
            id="transportationType"
            value={formData.transportationType}
            onChange={(e) => setFormData({ ...formData, transportationType: e.target.value as TransportationType })}
            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm bg-white dark:bg-gray-900 dark:text-gray-100 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 min-h-[44px]"
          >
            <option value="train">電車</option>
            <option value="bus">バス</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="fromStation" className="block text-sm font-medium">
          出発駅/バス停
        </label>
        <div className="relative mt-1">
          <div className="flex gap-2">
            <input
              type="text"
              id="fromStation"
              value={formData.fromStation}
              onChange={(e) => {
                const val = e.target.value;
                setFormData({ ...formData, fromStation: val });
                validateField('fromStation', val);
                debouncedSearch(val, 'from');
              }}
              onBlur={(e) => validateField('fromStation', e.target.value)}
              onKeyDown={(e) => handleCandidatesKeyDown(e, 'from')}
              className={`flex-1 block w-full rounded-md border ${formErrors.fromStation ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'} shadow-sm bg-white dark:bg-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:ring-indigo-500`}
              required
              aria-invalid={!!formErrors.fromStation}
              aria-describedby={formErrors.fromStation ? 'fromStation-error' : undefined}
            />
            <button
              type="button"
              onClick={() => handleFetchNearby('from')}
              disabled={status === 'locating' || status === 'loading'}
              className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition min-h-[44px] min-w-[44px] md:min-w-0"
              aria-label="現在地から出発駅を検索"
            >
              <span className="md:hidden">{status === 'locating' || status === 'loading' ? '...' : '📍'}</span>
              <span className="hidden md:inline">{status === 'locating' || status === 'loading' ? '取得中...' : '📍 現在地'}</span>
            </button>
          </div>
          
          {/* 候補リスト（ポップオーバー） */}
          {showCandidates && targetField === 'from' && (
            <div
              ref={candidatesRef}
              className="fixed md:absolute bottom-0 md:bottom-auto left-0 md:left-auto right-0 md:right-auto z-50 md:z-10 mt-0 md:mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-t-md md:rounded-md shadow-lg max-h-60 md:max-h-48 overflow-y-auto"
              role="listbox"
            >
              {status === 'loading' && (
                <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-300">検索中...</div>
              )}
              {status === 'success' && candidates.length === 0 && (
                <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-300">候補が見つかりませんでした</div>
              )}
              {candidates.map((place, idx) => (
                <button
                  key={place.id}
                  type="button"
                  onClick={() => handleSelectCandidate(place)}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none ${idx === highlightedIndex ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                  role="option"
                  aria-selected={idx === highlightedIndex}
                >
                  <div className="font-medium dark:text-gray-100">{place.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {place.operator} - 約 {Math.round(place.distanceMeters)}m
                  </div>
                </button>
              ))}
            </div>
          )}
          {formErrors.fromStation && (
            <p id="fromStation-error" className="text-red-600 dark:text-red-400 text-sm mt-1">{formErrors.fromStation}</p>
          )}
          {formWarnings.fromStation && (
            <p className="text-yellow-600 dark:text-yellow-400 text-sm mt-1">{formWarnings.fromStation}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="toStation" className="block text-sm font-medium">
          到着駅/バス停
        </label>
        <div className="relative mt-1">
          <div className="flex gap-2">
            <input
              type="text"
              id="toStation"
              value={formData.toStation}
              onChange={(e) => {
                const val = e.target.value;
                setFormData({ ...formData, toStation: val });
                validateField('toStation', val);
                debouncedSearch(val, 'to');
              }}
              onBlur={(e) => validateField('toStation', e.target.value)}
              onKeyDown={(e) => handleCandidatesKeyDown(e, 'to')}
              className={`flex-1 block w-full rounded-md border ${formErrors.toStation ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'} shadow-sm bg-white dark:bg-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:ring-indigo-500`}
              required
              aria-invalid={!!formErrors.toStation}
              aria-describedby={formErrors.toStation ? 'toStation-error' : undefined}
            />
            <button
              type="button"
              onClick={() => handleFetchNearby('to')}
              disabled={status === 'locating' || status === 'loading'}
              className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition min-h-[44px] min-w-[44px] md:min-w-0"
              aria-label="現在地から到着駅を検索"
            >
              <span className="md:hidden">{status === 'locating' || status === 'loading' ? '...' : '📍'}</span>
              <span className="hidden md:inline">{status === 'locating' || status === 'loading' ? '取得中...' : '📍 現在地'}</span>
            </button>
          </div>
          
          {/* 候補リスト（ポップオーバー） */}
          {showCandidates && targetField === 'to' && (
            <div
              ref={candidatesRef}
              className="fixed md:absolute bottom-0 md:bottom-auto left-0 md:left-auto right-0 md:right-auto z-50 md:z-10 mt-0 md:mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-t-md md:rounded-md shadow-lg max-h-60 md:max-h-48 overflow-y-auto"
              role="listbox"
            >
              {status === 'loading' && (
                <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-300">検索中...</div>
              )}
              {status === 'success' && candidates.length === 0 && (
                <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-300">候補が見つかりませんでした</div>
              )}
              {candidates.map((place, idx) => (
                <button
                  key={place.id}
                  type="button"
                  onClick={() => handleSelectCandidate(place)}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none ${idx === highlightedIndex ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                  role="option"
                  aria-selected={idx === highlightedIndex}
                >
                  <div className="font-medium dark:text-gray-100">{place.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {place.operator} - 約 {Math.round(place.distanceMeters)}m
                  </div>
                </button>
              ))}
            </div>
          )}
          {formErrors.toStation && (
            <p id="toStation-error" className="text-red-600 dark:text-red-400 text-sm mt-1">{formErrors.toStation}</p>
          )}
          {formWarnings.toStation && (
            <p className="text-yellow-600 dark:text-yellow-400 text-sm mt-1">{formWarnings.toStation}</p>
          )}
        </div>
      </div>

      {/* 会社名と運賃（2カラム: タブレット以上） */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="transportationCompany" className="block text-sm font-medium">
            交通機関名
          </label>
          <input
            type="text"
            id="transportationCompany"
            value={formData.transportationCompany}
            onChange={(e) => {
              const val = e.target.value;
              setFormData({ ...formData, transportationCompany: val });
              validateField('transportationCompany', val);
            }}
            list="company-suggestions"
            className={`mt-1 block w-full rounded-md border ${formErrors.transportationCompany ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'} shadow-sm bg-white dark:bg-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:ring-indigo-500 min-h-[44px]`}
            aria-invalid={!!formErrors.transportationCompany}
            aria-describedby={formErrors.transportationCompany ? 'transportationCompany-error' : undefined}
          />
          <datalist id="company-suggestions">
            {(formData.transportationType === 'train' ? RAILWAY_COMPANIES : BUS_COMPANIES).map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          {formErrors.transportationCompany && (
            <p className="text-red-600 dark:text-red-400 text-sm mt-1">{formErrors.transportationCompany}</p>
          )}
        </div>

        <div>
          <label htmlFor="fare" className="block text-sm font-medium">
            運賃
          </label>
          <input
            type="text"
            id="fare"
            value={formData.fare}
            onChange={(e) => {
              const val = e.target.value;
              setFormData({ ...formData, fare: val });
              validateField('fare', val);
            }}
            onBlur={(e) => validateField('fare', e.target.value)}
            className={`mt-1 block w-full rounded-md border ${formErrors.fare ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'} shadow-sm bg-white dark:bg-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:ring-indigo-500 min-h-[44px]`}
            required
            placeholder="0"
            aria-invalid={!!formErrors.fare}
            aria-describedby={formErrors.fare ? 'fare-error' : undefined}
          />
          {formErrors.fare && (
            <p id="fare-error" className="text-red-600 dark:text-red-400 text-sm mt-1">{formErrors.fare}</p>
          )}
          {formWarnings.fare && (
            <p className="text-yellow-600 dark:text-yellow-400 text-sm mt-1">{formWarnings.fare}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="submit"
          className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-950 min-h-[44px] font-medium"
        >
          {isEditing ? '更新する' : '記録を保存'}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={() => {
              // Clear form and notify parent to exit editing
              resetToNew();
              if (onCancel) {
                onCancel();
              }
            }}
            className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 focus:outline-none min-h-[44px]"
          >
            キャンセル
          </button>
        )}
      </div>
      {/* Confirmation modal (simple) */}
      {showConfirm && pendingPayload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-md border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-2 dark:text-gray-100">更新内容の確認</h3>
            <div className="text-sm text-gray-700 dark:text-gray-300 mb-4">
              <p>日付: {pendingPayload.date}</p>
              <p>経路: {pendingPayload.fromStation} → {pendingPayload.toStation}</p>
              <p>交通手段: {pendingPayload.transportationType === 'train' ? '電車' : 'バス'}</p>
              {pendingPayload.transportationCompany && <p>交通機関: {pendingPayload.transportationCompany}</p>}
              <p>運賃: ¥{formatCurrency(pendingPayload.fare)}</p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                onClick={() => {
                  setShowConfirm(false);
                  setPendingPayload(null);
                }}
              >
                キャンセル
              </button>
              <button
                className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 dark:hover:bg-indigo-800"
                onClick={() => {
                  // perform update
                  if (pendingPayload && onUpdate) {
                    onUpdate(pendingPayload);
                  }
                  // reset form to new-entry state
                  resetToNew();
                }}
              >
                更新を確定
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}