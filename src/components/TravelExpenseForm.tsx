import { useState, useEffect, useRef } from 'react';
import { TravelRecord, TransportationType, Place } from '../types';
import { ValidationRules, parseNumericInput } from '../lib/validation';
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
  const { status, candidates, error, fetchFromCurrentLocation, reset } = useNearbyPlaces();
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
        transportationCompany: place.operator || prev.transportationCompany,
      }));
    } else if (targetField === 'to') {
      setFormData((prev) => ({
        ...prev,
        toStation: place.name,
        transportationType: 'train', // 駅を選択したので自動的に電車に
        transportationCompany: place.operator || prev.transportationCompany,
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // バリデーション確認
    if (!ValidationRules.isValidStationName(formData.fromStation)) {
      alert('出発駅が無効です');
      return;
    }
    if (!ValidationRules.isValidStationName(formData.toStation)) {
      alert('到着駅が無効です');
      return;
    }
    if (!ValidationRules.isValidFare(formData.fare)) {
      alert('運賃が無効です');
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
    const today = new Date().toISOString().split('T')[0];
    setFormData({ id: undefined, date: today, fromStation: '', toStation: '', transportationType: 'train', transportationCompany: '', fare: '' });
    setPendingPayload(null);
    setShowConfirm(false);
  };

  return (
    <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown} className="space-y-4">
      <div>
        <label htmlFor="date" className="block text-sm font-medium">
          日付
        </label>
        <input
          type="date"
          id="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm bg-white dark:bg-gray-900 dark:text-gray-100 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
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
              onChange={(e) => setFormData({ ...formData, fromStation: e.target.value })}
              onKeyDown={(e) => handleCandidatesKeyDown(e, 'from')}
              className="flex-1 block w-full rounded-md border border-gray-300 shadow-sm bg-white dark:bg-gray-900 dark:text-gray-100 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
            <button
              type="button"
              onClick={() => handleFetchNearby('from')}
              disabled={status === 'locating' || status === 'loading'}
              className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              aria-label="現在地から出発駅を検索"
            >
              {status === 'locating' || status === 'loading' ? '取得中...' : '📍 現在地'}
            </button>
          </div>
          
          {/* 候補リスト（ポップオーバー） */}
          {showCandidates && targetField === 'from' && (
            <div
              ref={candidatesRef}
              className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto"
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
              onChange={(e) => setFormData({ ...formData, toStation: e.target.value })}
              onKeyDown={(e) => handleCandidatesKeyDown(e, 'to')}
              className="flex-1 block w-full rounded-md border border-gray-300 shadow-sm bg-white dark:bg-gray-900 dark:text-gray-100 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
            <button
              type="button"
              onClick={() => handleFetchNearby('to')}
              disabled={status === 'locating' || status === 'loading'}
              className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              aria-label="現在地から到着駅を検索"
            >
              {status === 'locating' || status === 'loading' ? '取得中...' : '📍 現在地'}
            </button>
          </div>
          
          {/* 候補リスト（ポップオーバー） */}
          {showCandidates && targetField === 'to' && (
            <div
              ref={candidatesRef}
              className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto"
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
        </div>
      </div>

      <div>
        <label htmlFor="transportationType" className="block text-sm font-medium">
          交通手段
        </label>
        <select
          id="transportationType"
          value={formData.transportationType}
          onChange={(e) => setFormData({ ...formData, transportationType: e.target.value as TransportationType })}
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm bg-white dark:bg-gray-900 dark:text-gray-100 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="train">電車</option>
          <option value="bus">バス</option>
        </select>
      </div>

      <div>
        <label htmlFor="transportationCompany" className="block text-sm font-medium">
          交通機関名
        </label>
        <input
          type="text"
          id="transportationCompany"
          value={formData.transportationCompany}
          onChange={(e) => setFormData({ ...formData, transportationCompany: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm bg-white dark:bg-gray-900 dark:text-gray-100 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="fare" className="block text-sm font-medium">
          運賃
        </label>
        <input
          type="text"
          id="fare"
          value={formData.fare}
          onChange={(e) => setFormData({ ...formData, fare: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm bg-white dark:bg-gray-900 dark:text-gray-100 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500"
          required
          placeholder="0"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-950"
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
            className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 focus:outline-none"
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