import { describe, it, expect } from 'vitest';
import { filterRecords, sortRecords, groupByMonth } from '../src/lib/historyUtils';
import type { TravelRecord } from '../src/types';

const sample: TravelRecord[] = [
  { id: '1', date: '2025-11-10', fromStation: '新宿', toStation: '渋谷', transportationType: 'train', transportationCompany: 'JR', fare: 200 },
  { id: '2', date: '2025-11-11', fromStation: '池袋', toStation: '上野', transportationType: 'train', transportationCompany: '', fare: 220 },
  { id: '3', date: '2025-10-05', fromStation: '渋谷', toStation: '表参道', transportationType: 'bus', transportationCompany: '都営', fare: 180 },
];

describe('historyUtils', () => {
  it('filters by query (station or company)', () => {
    expect(filterRecords(sample, { q: '渋谷' }).map(r => r.id)).toEqual(['1', '3']);
    expect(filterRecords(sample, { q: 'JR' }).map(r => r.id)).toEqual(['1']);
  });

  it('filters by date range', () => {
    expect(filterRecords(sample, { from: '2025-11-01', to: '2025-11-30' }).map(r => r.id)).toEqual(['1', '2']);
  });

  it('sorts by date desc/asc', () => {
    const desc = sortRecords(sample, 'date', 'desc').map(r => r.id);
    expect(desc[0]).toBe('2');
    const asc = sortRecords(sample, 'date', 'asc').map(r => r.id);
    expect(asc[0]).toBe('3');
  });

  it('groups by month', () => {
    const grouped = groupByMonth(sample);
    // grouped is array of [YYYY-MM, records]
    expect(grouped.length).toBeGreaterThan(0);
    // ensure keys like 2025-11 exist
    const keys = grouped.map(([k]) => k);
    expect(keys).toContain('2025-11');
    expect(keys).toContain('2025-10');
  });
});
