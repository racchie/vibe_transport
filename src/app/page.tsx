'use client';

import { useState, useEffect, useMemo } from 'react';
import { TravelRecord, FrequentRoute } from '../types';
import TravelExpenseForm from '../components/TravelExpenseForm';
import FrequentRoutesList from '../components/FrequentRoutesList';
import ExportPanel from '../components/ExportPanel';
import HistoryControls from '../components/HistoryControls';
import HistoryList from '../components/HistoryList';
import Toast from '../components/Toast';
import { ThemeToggle } from '../components/ThemeToggle';
import { filterRecords, sortRecords, groupByMonth, Filters } from '../lib/historyUtils';
import { useToast } from '../hooks/useToast';

type TabType = 'expense' | 'routes' | 'history' | 'export';

export default function Home() {
  // Keep initial state empty on both server and client first render to avoid
  // SSR/Client mismatch. Load persisted data from localStorage after mount.
  const [travelRecords, setTravelRecords] = useState<TravelRecord[]>([]);
  const [frequentRoutes, setFrequentRoutes] = useState<FrequentRoute[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('expense');
  const { toasts, addToast, removeToast } = useToast();

  const formatDateTime = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    const date = `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}`;
    const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    return `${date} ${time}`;
  };

  // スキップリンク向けスクロール関数
  const skipToMainContent = () => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView();
    }
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
      // eslint-disable-next-line no-restricted-syntax
      id: Date.now().toString(),
    };
    setTravelRecords([newRecord, ...travelRecords]);
    // トースト表示: 登録完了：{日付}{時刻}、{交通機関}で{出発}～{到着}、{運賃}円
    // eslint-disable-next-line no-restricted-syntax
    const when = formatDateTime(new Date());
    const vehicle = record.transportationType === 'train' ? '電車' : 'バス';
    const vehicleLabel = record.transportationCompany ? `${vehicle}(${record.transportationCompany})` : vehicle;
    addToast(`登録完了：${when}、${vehicleLabel}で${record.fromStation}〜${record.toStation}、${record.fare}円`, { type: 'success' });
  };

  const [editingRecord, setEditingRecord] = useState<TravelRecord | null>(null);

  const handleUpdate = (updated: TravelRecord) => {
    // 更新されたレコードを先頭に移動（新しい日付順に表示）
    setTravelRecords((prev) => {
      const filtered = prev.filter((r) => r.id !== updated.id);
      return [updated, ...filtered];
    });
    setEditingRecord(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm('この記録を削除しますか？')) return;
    setTravelRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const handleUseRoute = (routeData: Omit<TravelRecord, 'id' | 'date'>) => {
    const newRecord: TravelRecord = {
      ...routeData,
      // eslint-disable-next-line no-restricted-syntax
      id: Date.now().toString(),
      // eslint-disable-next-line no-restricted-syntax
      date: new Date().toISOString().split('T')[0],
    };
    setTravelRecords([newRecord, ...travelRecords]);
    // トースト表示（経路を使う時）
    // eslint-disable-next-line no-restricted-syntax
    const when = formatDateTime(new Date());
    const vehicle = routeData.transportationType === 'train' ? '電車' : 'バス';
    const vehicleLabel = routeData.transportationCompany ? `${vehicle}(${routeData.transportationCompany})` : vehicle;
    addToast(`登録完了：${when}、${vehicleLabel}で${routeData.fromStation}〜${routeData.toStation}、${routeData.fare}円`, { type: 'success' });
  };

  // よく利用する経路の追加
  const handleAddRoute = (route: Omit<FrequentRoute, 'id'>) => {
    const newRoute: FrequentRoute = {
      ...route,
      // eslint-disable-next-line no-restricted-syntax
      id: Date.now().toString(),
    };
    setFrequentRoutes([newRoute, ...frequentRoutes]);
  };

  // よく利用する経路の編集
  const handleEditRoute = (edited: FrequentRoute) => {
    setFrequentRoutes((prev) => prev.map((r) => (r.id === edited.id ? edited : r)));
  };

  // --- 履歴表示のソート・フィルタ状態 (MVP) ---
  const [sortBy, setSortBy] = useState<'date' | 'transportationType'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState<Filters>({});
  const [compactView, setCompactView] = useState(false);
  const [groupBy, setGroupBy] = useState<'none' | 'month'>('none');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const onChangeFilters = (f: Filters) => { setFilters(f); setPage(1); };
  const clearFilters = () => setFilters({});

  const displayedRecords = useMemo(() => {
    const filtered = filterRecords(travelRecords, filters);
    const sorted = sortRecords(filtered, sortBy, sortOrder);
    // paging applies only when not grouping
    if (groupBy === 'none') {
      const start = (page - 1) * pageSize;
      return sorted.slice(start, start + pageSize);
    }
    return sorted;
  }, [travelRecords, filters, sortBy, sortOrder, page, pageSize, groupBy]);

  const groupedRecords = useMemo(() => {
    if (groupBy !== 'month') return [] as Array<[string, typeof travelRecords]>;
    return groupByMonth(sortRecords(filterRecords(travelRecords, filters), sortBy, sortOrder));
  }, [travelRecords, filters, sortBy, sortOrder, groupBy]);

  const totalFilteredCount = useMemo(() => {
    return sortRecords(filterRecords(travelRecords, filters), sortBy, sortOrder).length;
  }, [travelRecords, filters, sortBy, sortOrder]);

  return (
    <main className="container mx-auto px-4 py-8 dark:bg-gray-950 dark:text-gray-100 min-h-screen">
      {/* スキップリンク */}
      <a
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          skipToMainContent();
        }}
        className="sr-only sr-only-focusable bg-blue-600 text-white px-4 py-2 rounded"
      >
        メインコンテンツへスキップ
      </a>

      <h1 className="text-3xl font-bold mb-8 dark:text-white">交通費記録アプリ</h1>

      {/* Theme toggle */}
      <div className="flex justify-end mb-4">
        <ThemeToggle />
      </div>

      {/* タブナビゲーション */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
        <nav className="-mb-px flex gap-2" aria-label="Tabs" role="tablist">
          {[
            { id: 'expense' as const, label: '新規記録' },
            { id: 'routes' as const, label: 'よく使う経路' },
            { id: 'history' as const, label: '記録履歴' },
            { id: 'export' as const, label: 'データのエクスポート' },
          ].map((tab, index, tabs) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={(e) => {
                // Arrow left/right で隣接タブに移動
                if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                  e.preventDefault();
                  const currentIndex = tabs.findIndex((t) => t.id === activeTab);
                  let nextIndex = currentIndex;
                  if (e.key === 'ArrowLeft') {
                    nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
                  } else {
                    nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
                  }
                  setActiveTab(tabs[nextIndex].id);
                }
                // Home/End キーでタブの先頭/最後に移動
                if (e.key === 'Home') {
                  e.preventDefault();
                  setActiveTab(tabs[0].id);
                }
                if (e.key === 'End') {
                  e.preventDefault();
                  setActiveTab(tabs[tabs.length - 1].id);
                }
              }}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`tabpanel-${tab.id}`}
              tabIndex={activeTab === tab.id ? 0 : -1}
              className={`
                whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium w-full max-w-[200px]
                transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500
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
      <div id="main-content" tabIndex={-1} className="focus:outline-none space-y-8">
        {activeTab === 'expense' && (
          <>
            <div>
              <TravelExpenseForm
                onSubmit={handleSubmit}
                onUpdate={handleUpdate}
                onCancel={() => setEditingRecord(null)}
                initialRecord={editingRecord || undefined}
                addToast={addToast}
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
            <div className="mb-2">
              <HistoryControls
                sortBy={sortBy}
                sortOrder={sortOrder}
                filters={filters}
                onChangeSort={(s) => setSortBy(s)}
                onToggleOrder={() => setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
                onChangeFilters={onChangeFilters}
                onClear={clearFilters}
                groupBy={groupBy}
                onChangeGroupBy={(g) => { setGroupBy(g); setPage(1); }}
                pageSize={pageSize}
                onChangePageSize={(n) => { setPageSize(n); setPage(1); }}
              />
              <div className="flex items-center gap-2 mb-4">
                <label className="text-sm dark:text-gray-200">表示モード</label>
                <button onClick={() => setCompactView(false)} className={`px-2 py-1 border rounded text-sm ${!compactView ? 'bg-gray-100 dark:bg-gray-700' : 'dark:border-gray-600'}`}>詳細</button>
                <button onClick={() => setCompactView(true)} className={`px-2 py-1 border rounded text-sm ${compactView ? 'bg-gray-100 dark:bg-gray-700' : 'dark:border-gray-600'}`}>コンパクト</button>
              </div>
            </div>

            {groupBy === 'month' ? (
              <div className="space-y-6">
                {groupedRecords.map(([month, recs]) => (
                  <div key={month}>
                    <h2 className="text-lg font-semibold mb-2 dark:text-gray-100">{month}</h2>
                    <HistoryList records={recs} onEdit={(r) => { setEditingRecord(r); setActiveTab('expense'); }} onDelete={handleDelete} onUse={handleUseRoute} compact={compactView} />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <HistoryList
                  records={displayedRecords}
                  onEdit={(r) => { setEditingRecord(r); setActiveTab('expense'); }}
                  onDelete={handleDelete}
                  onUse={handleUseRoute}
                  compact={compactView}
                />

                <div className="flex items-center gap-2 justify-center mt-4">
                  <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-200">Prev</button>
                  <div className="text-sm dark:text-gray-300">{page} / {Math.max(1, Math.ceil(totalFilteredCount / pageSize))}</div>
                  <button disabled={page >= Math.ceil(totalFilteredCount / pageSize)} onClick={() => setPage((p) => p + 1)} className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-200">Next</button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      {/* Toast container */}
      <Toast toasts={toasts} onRemove={removeToast} />
    </main>
  );
}
