'use client';

import { useState, useEffect } from 'react';
import { TravelRecord, FrequentRoute } from '../types';
import TravelExpenseForm from '../components/TravelExpenseForm';
import FrequentRoutesList from '../components/FrequentRoutesList';

export default function Home() {
  // Keep initial state empty on both server and client first render to avoid
  // SSR/Client mismatch. Load persisted data from localStorage after mount.
  const [travelRecords, setTravelRecords] = useState<TravelRecord[]>([]);

  const [frequentRoutes, setFrequentRoutes] = useState<FrequentRoute[]>([]);

  // Load persisted data only on client after mount to avoid hydration mismatches.
  useEffect(() => {
    try {
      const saved = localStorage.getItem('travelRecords');
      if (saved) setTravelRecords(JSON.parse(saved));
    } catch (e) {
      // ignore JSON parse errors
      // eslint-disable-next-line no-console
      console.warn('Could not load travelRecords from localStorage', e);
    }
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('frequentRoutes');
      if (saved) setFrequentRoutes(JSON.parse(saved));
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Could not load frequentRoutes from localStorage', e);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('travelRecords', JSON.stringify(travelRecords));
  }, [travelRecords]);

  useEffect(() => {
    localStorage.setItem('frequentRoutes', JSON.stringify(frequentRoutes));
  }, [frequentRoutes]);

  const handleSubmit = (record: Omit<TravelRecord, 'id'>) => {
    const newRecord: TravelRecord = {
      ...record,
      id: Date.now().toString(),
    };
    setTravelRecords([newRecord, ...travelRecords]);
  };

  const [editingRecord, setEditingRecord] = useState<TravelRecord | null>(null);

  const handleUpdate = (updated: TravelRecord) => {
    setTravelRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setEditingRecord(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm('この記録を削除しますか？')) return;
    setTravelRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const handleUseRoute = (routeData: Omit<TravelRecord, 'id' | 'date'>) => {
    const newRecord: TravelRecord = {
      ...routeData,
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
    };
    setTravelRecords([newRecord, ...travelRecords]);
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">交通費記録アプリ</h1>
      
      <div className="grid gap-8 md:grid-cols-2">
          <div>
          <h2 className="text-xl font-semibold mb-4">新規記録</h2>
          <TravelExpenseForm
            onSubmit={handleSubmit}
            onUpdate={handleUpdate}
            onCancel={() => setEditingRecord(null)}
            initialRecord={editingRecord || undefined}
          />
        </div>
        
        <div className="space-y-8">
          <FrequentRoutesList
            routes={frequentRoutes}
            onUseRoute={handleUseRoute}
          />
          
          <div>
            <h2 className="text-xl font-semibold mb-4">記録履歴</h2>
            <div className="space-y-4">
              {travelRecords.map((record) => (
                <div key={record.id} className="p-4 border rounded-lg shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">
                        {record.fromStation} → {record.toStation}
                      </p>
                      <p className="text-sm text-gray-600">
                        {record.date} | {record.transportationType === 'train' ? '電車' : 'バス'}
                        {record.transportationCompany && ` - ${record.transportationCompany}`}
                      </p>
                    </div>
                    <div className="flex items-start gap-4">
                      <p className="font-medium">¥{record.fare.toLocaleString()}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingRecord(record)}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleDelete(record.id)}
                          className="text-sm text-red-600 hover:underline"
                        >
                          削除
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
