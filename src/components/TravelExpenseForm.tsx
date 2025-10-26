import { useState, useEffect } from 'react';
import { TravelRecord, TransportationType } from '../types';

interface TravelExpenseFormProps {
  onSubmit?: (record: Omit<TravelRecord, 'id'>) => void;
  onUpdate?: (record: TravelRecord) => void;
  onCancel?: () => void;
  initialRecord?: TravelRecord | null;
}

export default function TravelExpenseForm({ onSubmit, onUpdate, onCancel, initialRecord = null }: TravelExpenseFormProps) {
  const [formData, setFormData] = useState({
    // Keep initial empty to avoid SSR/client mismatch; populate on client mount.
    id: '' as string | undefined,
    date: '',
    fromStation: '',
    toStation: '',
    transportationType: 'train' as TransportationType,
    transportationCompany: '',
    fare: 0,
  });

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
        fare: initialRecord.fare,
      });
      return;
    }

    if (!formData.date) {
      const today = new Date().toISOString().split('T')[0];
      setFormData((prev) => ({ ...prev, date: today }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialRecord]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      date: formData.date,
      fromStation: formData.fromStation,
      toStation: formData.toStation,
      transportationType: formData.transportationType,
      transportationCompany: formData.transportationCompany || undefined,
      fare: Number(formData.fare),
    };

    if (formData.id && onUpdate) {
      onUpdate({ ...(payload as Omit<TravelRecord, 'id'>), id: formData.id });
    } else if (onSubmit) {
      onSubmit(payload as Omit<TravelRecord, 'id'>);
      setFormData((prev) => ({ ...prev, fromStation: '', toStation: '', transportationCompany: '', fare: 0 }));
    }
  };

  const isEditing = Boolean(formData.id);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="date" className="block text-sm font-medium">
          日付
        </label>
        <input
          type="date"
          id="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>

      <div>
        <label htmlFor="fromStation" className="block text-sm font-medium">
          出発駅/バス停
        </label>
        <input
          type="text"
          id="fromStation"
          value={formData.fromStation}
          onChange={(e) => setFormData({ ...formData, fromStation: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>

      <div>
        <label htmlFor="toStation" className="block text-sm font-medium">
          到着駅/バス停
        </label>
        <input
          type="text"
          id="toStation"
          value={formData.toStation}
          onChange={(e) => setFormData({ ...formData, toStation: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="fare" className="block text-sm font-medium">
          運賃
        </label>
        <input
          type="number"
          id="fare"
          value={formData.fare}
          onChange={(e) => setFormData({ ...formData, fare: Number(e.target.value) })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
          min="0"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {isEditing ? '更新する' : '記録を保存'}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={() => onCancel && onCancel()}
            className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 focus:outline-none"
          >
            キャンセル
          </button>
        )}
      </div>
    </form>
  );
}