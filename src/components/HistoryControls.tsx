"use client";

import React, { useState } from 'react';

type SortBy = 'date' | 'transportationType';
type SortOrder = 'asc' | 'desc';

interface Filters {
  q?: string;
  from?: string; // ISO date yyyy-mm-dd
  to?: string; // ISO date
}

interface Props {
  sortBy: SortBy;
  sortOrder: SortOrder;
  filters: Filters;
  onChangeSort: (sortBy: SortBy) => void;
  onToggleOrder: () => void;
  onChangeFilters: (f: Filters) => void;
  onClear: () => void;
  groupBy: 'none' | 'month';
  onChangeGroupBy: (g: 'none' | 'month') => void;
  pageSize: number;
  onChangePageSize: (n: number) => void;
}

export default function HistoryControls({
  sortBy,
  sortOrder,
  filters,
  onChangeSort,
  onToggleOrder,
  onChangeFilters,
  onClear,
  groupBy,
  onChangeGroupBy,
  pageSize,
  onChangePageSize,
}: Props) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="space-y-3 mb-4">
      {/* Main controls: Sort + Search */}
      <div className="flex flex-col md:flex-row gap-2 items-start md:items-center">
        <div className="flex gap-2 items-center flex-wrap">
          <label className="text-sm font-medium">並び替え</label>
          <select
            value={sortBy}
            onChange={(e) => onChangeSort(e.target.value as SortBy)}
            className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-800 dark:text-gray-100"
          >
            <option value="date">日時</option>
            <option value="transportationType">交通種別</option>
          </select>
          <button
            onClick={onToggleOrder}
            className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
            aria-label="昇順・降順切替"
          >
            {sortOrder === 'asc' ? '↑昇順' : '↓降順'}
          </button>
        </div>

        <div className="flex gap-2 items-center flex-1 min-w-0">
          <label className="text-sm font-medium shrink-0">検索</label>
          <input
            placeholder="駅名・会社"
            value={filters.q || ''}
            onChange={(e) => onChangeFilters({ ...filters, q: e.target.value })}
            className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 flex-1 min-w-0"
          />
        </div>

        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="md:hidden border border-gray-300 dark:border-gray-600 rounded px-3 py-1 text-sm bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
        >
          {showAdvanced ? '▼詳細' : '▶詳細'}
        </button>
      </div>

      {/* Advanced controls: Date range + Grouping + Page size */}
      <div className={`flex flex-col md:flex-row gap-2 items-start md:items-center overflow-hidden transition-all duration-300 ${showAdvanced || 'max-md:hidden'}`}>
        <div className="flex gap-2 items-center flex-wrap">
          <label className="text-sm font-medium">期間</label>
          <input
            type="date"
            value={filters.from || ''}
            onChange={(e) => onChangeFilters({ ...filters, from: e.target.value })}
            className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-800 dark:text-gray-100"
          />
          <span className="text-sm">～</span>
          <input
            type="date"
            value={filters.to || ''}
            onChange={(e) => onChangeFilters({ ...filters, to: e.target.value })}
            className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-800 dark:text-gray-100"
          />
        </div>

        <div className="flex gap-2 items-center flex-wrap">
          <label className="text-sm font-medium">グループ</label>
          <select value={groupBy} onChange={(e) => onChangeGroupBy(e.target.value as 'none' | 'month')} className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-800 dark:text-gray-100">
            <option value="none">なし</option>
            <option value="month">月別</option>
          </select>
        </div>

        <div className="flex gap-2 items-center flex-wrap">
          <label className="text-sm font-medium">表示数</label>
          <select value={pageSize} onChange={(e) => onChangePageSize(Number(e.target.value))} className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-800 dark:text-gray-100">
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>

        <button onClick={onClear} className="border border-gray-300 dark:border-gray-600 rounded px-3 py-1 text-sm bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 md:ml-auto">クリア</button>
      </div>
    </div>
  );
}
