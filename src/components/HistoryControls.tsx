"use client";

import React from 'react';

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
}

export default function HistoryControls({
  sortBy,
  sortOrder,
  filters,
  onChangeSort,
  onToggleOrder,
  onChangeFilters,
  onClear,
}: Props) {
  return (
    <div className="flex flex-col md:flex-row gap-2 items-start md:items-center mb-4">
      <div className="flex gap-2 items-center">
        <label className="text-sm">並び替え</label>
        <select
          value={sortBy}
          onChange={(e) => onChangeSort(e.target.value as SortBy)}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="date">日時</option>
          <option value="transportationType">交通種別</option>
        </select>
        <button
          onClick={onToggleOrder}
          className="ml-1 border rounded px-2 py-1 text-sm"
          aria-label="昇順・降順切替"
        >
          {sortOrder === 'asc' ? '昇順' : '降順'}
        </button>
      </div>

      <div className="flex gap-2 items-center">
        <label className="text-sm">検索</label>
        <input
          placeholder="駅名・メモ等を検索"
          value={filters.q || ''}
          onChange={(e) => onChangeFilters({ ...filters, q: e.target.value })}
          className="border rounded px-2 py-1 text-sm"
        />
      </div>

      <div className="flex gap-2 items-center">
        <label className="text-sm">期間</label>
        <input
          type="date"
          value={filters.from || ''}
          onChange={(e) => onChangeFilters({ ...filters, from: e.target.value })}
          className="border rounded px-2 py-1 text-sm"
        />
        <span className="text-sm">~</span>
        <input
          type="date"
          value={filters.to || ''}
          onChange={(e) => onChangeFilters({ ...filters, to: e.target.value })}
          className="border rounded px-2 py-1 text-sm"
        />
      </div>

      <div className="ml-auto">
        <button onClick={onClear} className="border rounded px-3 py-1 text-sm">クリア</button>
      </div>
    </div>
  );
}
