import { useState } from 'react';
import { TravelRecord } from '../types';
import * as XLSX from 'xlsx';

interface ExportPanelProps {
  records: TravelRecord[];
}

type ExportFormat = 'csv' | 'xlsx';
type DateRange = 'all' | 'custom' | 'monthly';

export default function ExportPanel({ records }: ExportPanelProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [format, setFormat] = useState<ExportFormat>('xlsx');
  const [dateRange, setDateRange] = useState<DateRange>('all');
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  // 利用可能な月のリストを取得
  const getAvailableMonths = () => {
    const months = new Set(records.map(record => record.date.slice(0, 7)));
    return Array.from(months).sort().reverse();
  };

  // 日付でフィルタリングされたレコードを取得
  const getFilteredRecords = () => {
    switch (dateRange) {
      case 'all':
        return records;
      case 'custom':
        return records.filter(record => {
          if (!startDate && !endDate) return true;
          if (startDate && record.date < startDate) return false;
          if (endDate && record.date > endDate) return false;
          return true;
        });
      case 'monthly':
        return records.filter(record => record.date.startsWith(selectedMonth));
      default:
        return records;
    }
  };

  // エクスポートデータの作成
  const createExportData = (records: TravelRecord[]) => {
    return records.map(record => ({
      '日付': record.date,
      '交通機関名': `${record.fromStation}〜${record.toStation}`,
      '交通機関': record.transportationCompany || '',
      '運賃': record.fare,
    }));
  };

  const handleExport = () => {
    const filteredRecords = getFilteredRecords();
    if (filteredRecords.length === 0) {
      alert('出力対象のデータがありません。');
      return;
    }

    const exportData = createExportData(filteredRecords);
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '交通費記録');

    // ファイル名に期間を含める
    let dateStr = '';
    switch (dateRange) {
      case 'all':
        dateStr = '_全期間';
        break;
      case 'custom':
        dateStr = startDate && endDate 
          ? `_${startDate}-${endDate}`
          : startDate
          ? `_${startDate}以降`
          : endDate
          ? `_${endDate}まで`
          : '';
        break;
      case 'monthly':
        dateStr = `_${selectedMonth}`;
        break;
    }

    const fileName = `交通費記録${dateStr}`;

    if (format === 'csv') {
      XLSX.writeFile(wb, `${fileName}.csv`);
    } else {
      XLSX.writeFile(wb, `${fileName}.xlsx`);
    }
  };

  // 日付の最小値と最大値を取得
  const dateRangeMinMax = records.reduce(
    (acc, record) => ({
      min: !acc.min || record.date < acc.min ? record.date : acc.min,
      max: !acc.max || record.date > acc.max ? record.date : acc.max,
    }),
    { min: '', max: '' }
  );

  return (
  <div className="space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
      <h3 className="font-medium text-lg">データのエクスポート</h3>
      
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <input
              type="radio"
              id="all"
              value="all"
              checked={dateRange === 'all'}
              onChange={(e) => setDateRange(e.target.value as DateRange)}
              className="text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="all" className="text-sm font-medium">全期間</label>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="radio"
              id="custom"
              value="custom"
              checked={dateRange === 'custom'}
              onChange={(e) => setDateRange(e.target.value as DateRange)}
              className="text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="custom" className="text-sm font-medium">期間指定</label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="radio"
              id="monthly"
              value="monthly"
              checked={dateRange === 'monthly'}
              onChange={(e) => setDateRange(e.target.value as DateRange)}
              className="text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="monthly" className="text-sm font-medium">月指定</label>
          </div>
        </div>

        {dateRange === 'custom' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                開始日
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={dateRangeMinMax.min}
                max={dateRangeMinMax.max}
                className="block w-full rounded-md border border-gray-300 shadow-sm bg-white dark:bg-gray-900 dark:text-gray-100 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                終了日
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={dateRangeMinMax.min}
                max={dateRangeMinMax.max}
                className="block w-full rounded-md border border-gray-300 shadow-sm bg-white dark:bg-gray-900 dark:text-gray-100 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
        )}

        {dateRange === 'monthly' && (
          <div>
            <label className="block text-sm font-medium mb-1">
              月を選択
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="block w-full rounded-md border border-gray-300 shadow-sm bg-white dark:bg-gray-900 dark:text-gray-100 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500"
            >
              {getAvailableMonths().map(month => (
                <option key={month} value={month}>
                  {month.replace('-', '年')}月
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
              <input
              type="radio"
              id="xlsx"
              value="xlsx"
              checked={format === 'xlsx'}
              onChange={(e) => setFormat(e.target.value as ExportFormat)}
                className="text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="xlsx" className="text-sm font-medium">Excel (.xlsx)</label>
          </div>
          
          <div className="flex items-center gap-2">
              <input
              type="radio"
              id="csv"
              value="csv"
              checked={format === 'csv'}
              onChange={(e) => setFormat(e.target.value as ExportFormat)}
                className="text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="csv" className="text-sm font-medium">CSV</label>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          エクスポート
        </button>
      </div>
    </div>
  );
}