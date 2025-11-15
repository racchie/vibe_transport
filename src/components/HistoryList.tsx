"use client";

import React from 'react';
import { TravelRecord } from '../types';

interface Props {
  records: TravelRecord[];
  onEdit: (r: TravelRecord) => void;
  onDelete: (id: string) => void;
  onUse: (r: Omit<TravelRecord, 'id' | 'date'>) => void;
  compact?: boolean;
}

export default function HistoryList({ records, onEdit, onDelete, onUse, compact = false }: Props) {
  if (records.length === 0) return <p className="text-sm text-gray-500">該当する記録がありません</p>;

  if (compact) {
    return (
      <div className="divide-y">
        {records.map((r) => (
          <div key={r.id} className="flex items-center justify-between py-2">
            <div className="text-sm">
              <div>{r.date} — {r.fromStation} → {r.toStation}</div>
              <div className="text-xs text-gray-500">{r.transportationType === 'train' ? '電車' : 'バス'}</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="font-medium">¥{r.fare.toLocaleString()}</div>
              <button onClick={() => onEdit(r)} className="text-sm text-blue-600">編集</button>
              <button onClick={() => onDelete(r.id)} className="text-sm text-red-600">削除</button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {records.map((r) => (
        <div key={r.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium">{r.fromStation} → {r.toStation}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">{r.date} | {r.transportationType === 'train' ? '電車' : 'バス'}{r.transportationCompany && ` - ${r.transportationCompany}`}</p>
            </div>
            <div className="flex items-start gap-4">
              <p className="font-medium">¥{r.fare.toLocaleString()}</p>
              <div className="flex gap-2">
                <button onClick={() => onEdit(r)} className="text-sm text-blue-600 hover:underline">編集</button>
                <button onClick={() => onDelete(r.id)} className="text-sm text-red-600 hover:underline">削除</button>
                <button onClick={() => onUse({ fromStation: r.fromStation, toStation: r.toStation, transportationType: r.transportationType, transportationCompany: r.transportationCompany, fare: r.fare })} className="text-sm text-gray-700">この経路を使用</button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
