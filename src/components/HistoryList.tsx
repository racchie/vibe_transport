"use client";

import React from 'react';
import { TravelRecord } from '../types';
import { formatCurrency } from '../lib/formatting';

interface Props {
  records: TravelRecord[];
  onEdit: (r: TravelRecord) => void;
  onDelete: (id: string) => void;
  onUse: (r: Omit<TravelRecord, 'id' | 'date'>) => void;
  compact?: boolean;
}

export default function HistoryList({ records, onEdit, onDelete, onUse, compact = false }: Props) {
  if (records.length === 0) return <p className="text-sm text-gray-500 dark:text-gray-400 py-4">該当する記録がありません</p>;

  if (compact) {
    return (
      <div className="divide-y dark:divide-gray-700">
        {records.map((r) => (
          <div key={r.id} className="flex items-center justify-between py-2 px-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
            <div className="text-sm min-w-0 flex-1">
              <div className="font-medium truncate">{r.date} — {r.fromStation} → {r.toStation}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{r.transportationType === 'train' ? '電車' : 'バス'}</div>
            </div>
            <div className="flex items-center gap-2 ml-2 shrink-0">
              <div className="font-medium text-right">¥{formatCurrency(r.fare)}</div>
              <div className="flex gap-1">
                <button onClick={() => onEdit(r)} className="text-xs text-blue-600 dark:text-blue-400 hover:underline px-1">編集</button>
                <button onClick={() => onDelete(r.id)} className="text-xs text-red-600 dark:text-red-400 hover:underline px-1">削除</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {records.map((r) => (
        <div key={r.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition bg-white dark:bg-gray-800">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-lg">{r.fromStation} → {r.toStation}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{r.date} | {r.transportationType === 'train' ? '電車' : 'バス'}{r.transportationCompany && ` - ${r.transportationCompany}`}</p>
            </div>
            <div className="flex items-start gap-3 shrink-0">
              <p className="font-semibold text-lg">¥{formatCurrency(r.fare)}</p>
              <div className="flex gap-1 flex-col sm:flex-row">
                <button onClick={() => onEdit(r)} className="text-sm text-blue-600 dark:text-blue-400 hover:underline px-2 py-1">編集</button>
                <button onClick={() => onDelete(r.id)} className="text-sm text-red-600 dark:text-red-400 hover:underline px-2 py-1">削除</button>
                <button onClick={() => onUse({ fromStation: r.fromStation, toStation: r.toStation, transportationType: r.transportationType, transportationCompany: r.transportationCompany, fare: r.fare })} className="text-sm text-gray-700 dark:text-gray-300 hover:underline px-2 py-1">使用</button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
