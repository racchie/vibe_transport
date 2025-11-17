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
          <div key={r.id} className="flex items-center justify-between py-3 px-3 sm:px-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition rounded-md">
            <div className="text-sm min-w-0 flex-1">
              <div className="font-medium truncate dark:text-gray-100">{r.date} — {r.fromStation} → {r.toStation}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {r.transportationType === 'train' ? '電車' : 'バス'} · ¥{formatCurrency(r.fare)}
              </div>
            </div>
            <div className="flex items-center gap-1 ml-2 shrink-0">
              <button 
                onClick={() => onEdit(r)} 
                aria-label={`${r.date} ${r.fromStation}から${r.toStation}への記録を編集`} 
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition"
                title="編集"
              >
                ✏️
              </button>
              <button 
                onClick={() => onDelete(r.id)} 
                aria-label={`${r.date} ${r.fromStation}から${r.toStation}への記録を削除`} 
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition"
                title="削除"
              >
                🗑️
              </button>
              <button 
                onClick={() => onUse({ fromStation: r.fromStation, toStation: r.toStation, transportationType: r.transportationType, transportationCompany: r.transportationCompany, fare: r.fare })} 
                aria-label={`${r.fromStation}から${r.toStation}への経路を使用して新規記録を作成`} 
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition"
                title="再利用"
              >
                ↻
              </button>
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
          <div className="flex flex-col gap-3">
            {/* モバイル: カード型レイアウト */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-lg dark:text-gray-100">{r.fromStation} → {r.toStation}</p>
                <div className="text-sm text-gray-600 dark:text-gray-300 mt-1 space-y-0.5">
                  <p><span className="font-medium">日付:</span> {r.date}</p>
                  <p><span className="font-medium">交通手段:</span> {r.transportationType === 'train' ? '電車' : 'バス'}</p>
                  {r.transportationCompany && <p><span className="font-medium">会社:</span> {r.transportationCompany}</p>}
                  <p className="font-semibold text-base">¥{formatCurrency(r.fare)}</p>
                </div>
              </div>
            </div>
            {/* アクションボタン */}
            <div className="flex gap-2 flex-wrap">
              <button 
                onClick={() => onEdit(r)} 
                aria-label={`${r.fromStation}から${r.toStation}への記録を編集`} 
                className="flex-1 sm:flex-none min-h-[44px] px-4 py-2 text-sm text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-600 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
              >
                編集
              </button>
              <button 
                onClick={() => onDelete(r.id)} 
                aria-label={`${r.fromStation}から${r.toStation}への記録を削除`} 
                className="flex-1 sm:flex-none min-h-[44px] px-4 py-2 text-sm text-red-600 dark:text-red-400 border border-red-300 dark:border-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition"
              >
                削除
              </button>
              <button 
                onClick={() => onUse({ fromStation: r.fromStation, toStation: r.toStation, transportationType: r.transportationType, transportationCompany: r.transportationCompany, fare: r.fare })} 
                aria-label={`${r.fromStation}から${r.toStation}への経路を使用して新規記録を作成`} 
                className="flex-1 sm:flex-none min-h-[44px] px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                再利用
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
