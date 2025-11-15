'use client';

import { useState, useEffect } from 'react';
import { TravelRecord, FrequentRoute } from '../types';
import TravelExpenseForm from '../components/TravelExpenseForm';
import FrequentRoutesList from '../components/FrequentRoutesList';
import ExportPanel from '../components/ExportPanel';

type TabType = 'expense' | 'routes' | 'history' | 'export';

export default function Home() {
  // Keep initial state empty on both server and client first render to avoid
  // SSR/Client mismatch. Load persisted data from localStorage after mount.
  const [travelRecords, setTravelRecords] = useState<TravelRecord[]>([]);
  const [frequentRoutes, setFrequentRoutes] = useState<FrequentRoute[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('expense');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string, ms = 3500) => {
    setToastMessage(msg);
    window.setTimeout(() => setToastMessage(null), ms);
  };

  const formatDateTime = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    const date = `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}`;
    const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    return `${date} ${time}`;
  };

  // Load persisted data only on client after mount to avoid hydration mismatches.
  useEffect(() => {
    const loadData = () => {
      try {
        const saved = localStorage.getItem('travelRecords');
        if (saved) setTravelRecords(JSON.parse(saved));
      } catch (e) {
        console.warn('Could not load travelRecords from localStorage', e);
      }

      try {
        const saved = localStorage.getItem('frequentRoutes');
        if (saved) setFrequentRoutes(JSON.parse(saved));
      } catch (e) {
        console.warn('Could not load frequentRoutes from localStorage', e);
      }
    };

    loadData();
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
    // トースト表示: 登録完了：{日付}{時刻}、{交通機関}で{出発}〜{到着}、{運賃}円
    const when = formatDateTime(new Date());
    const vehicle = record.transportationType === 'train' ? '電車' : 'バス';
    const vehicleLabel = record.transportationCompany ? `${vehicle}(${record.transportationCompany})` : vehicle;
    showToast(`登録完了：${when}、${vehicleLabel}で${record.fromStation}〜${record.toStation}、${record.fare}円`);
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
    // トースト表示（経路を使う時）
    const when = formatDateTime(new Date());
    const vehicle = routeData.transportationType === 'train' ? '電車' : 'バス';
    const vehicleLabel = routeData.transportationCompany ? `${vehicle}(${routeData.transportationCompany})` : vehicle;
    showToast(`登録完了：${when}、${vehicleLabel}で${routeData.fromStation}〜${routeData.toStation}、${routeData.fare}円`);
  };

  // よく利用する経路の追加
  const handleAddRoute = (route: Omit<FrequentRoute, 'id'>) => {
    const newRoute: FrequentRoute = {
      ...route,
      id: Date.now().toString(),
    };
    setFrequentRoutes([newRoute, ...frequentRoutes]);
  };

  // よく利用する経路の編集
  const handleEditRoute = (edited: FrequentRoute) => {
    setFrequentRoutes((prev) => prev.map((r) => (r.id === edited.id ? edited : r)));
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">交通費記録アプリ</h1>

      {/* タブナビゲーション */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
        <nav className="-mb-px flex gap-2" aria-label="Tabs">
          {[
            { id: 'expense' as const, label: '新規記録' },
            { id: 'routes' as const, label: 'よく使う経路' },
            { id: 'history' as const, label: '記録履歴' },
            { id: 'export' as const, label: 'データのエクスポート' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium w-full max-w-[200px]
                ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-300'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-200'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* タブコンテンツ */}
      <div className="space-y-8">
        {activeTab === 'expense' && (
          <>
            <div>
              <TravelExpenseForm
                onSubmit={handleSubmit}
                onUpdate={handleUpdate}
                onCancel={() => setEditingRecord(null)}
                initialRecord={editingRecord || undefined}
              />
            </div>
          </>
        )}

        {activeTab === 'export' && (
          <div>
            <ExportPanel records={travelRecords} />
          </div>
        )}

        {activeTab === 'routes' && (
          <FrequentRoutesList
            routes={frequentRoutes}
            onUseRoute={handleUseRoute}
            onAddRoute={handleAddRoute}
            onEditRoute={handleEditRoute}
          />
        )}

        {activeTab === 'history' && (
          <div>
            <div className="space-y-4">
              {travelRecords.map((record) => (
                <div key={record.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">
                        {record.fromStation} → {record.toStation}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {record.date} | {record.transportationType === 'train' ? '電車' : 'バス'}
                        {record.transportationCompany && ` - ${record.transportationCompany}`}
                      </p>
                    </div>
                    <div className="flex items-start gap-4">
                      <p className="font-medium">¥{record.fare.toLocaleString()}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingRecord(record);
                            setActiveTab('expense');
                          }}
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
        )}
      </div>
      {/* トースト */}
      {toastMessage && (
        <div className="fixed right-4 bottom-4 z-50">
          <div className="max-w-xs w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 shadow-lg rounded-lg px-4 py-3">
            <p className="text-sm">{toastMessage}</p>
          </div>
        </div>
      )}
    </main>
  );
}
