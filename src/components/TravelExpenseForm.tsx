import { useState, useEffect } from 'react';
import { TravelRecord, TransportationType } from '../types';

interface TravelExpenseFormProps {
  onSubmit: (record: Omit<TravelRecord, 'id'>) => void;
}

export default function TravelExpenseForm({ onSubmit }: TravelExpenseFormProps) {
  const [formData, setFormData] = useState({
    // Avoid using Date() at render time to prevent SSR/client mismatch (hydration error).
    // Initialize to empty and set current date on client mount.
    date: '',
    fromStation: '',
    toStation: '',
    transportationType: 'train' as TransportationType,
    transportationCompany: '',
    fare: 0,
  });

  // Set today's date only on client after mount to keep server-render deterministic
  // and avoid hydration mismatch.
  useEffect(() => {
    if (!formData.date) {
      const today = new Date().toISOString().split('T')[0];
      setFormData((prev) => ({ ...prev, date: today }));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      ...formData,
      fromStation: '',
      toStation: '',
      transportationCompany: '',
      fare: 0,
    });
  };

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

      <button
        type="submit"
        className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        記録を保存
      </button>
    </form>
  );
}