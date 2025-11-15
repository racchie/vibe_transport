import { TravelRecord } from '../types';

export type Filters = { q?: string; from?: string; to?: string };

export function filterRecords(records: TravelRecord[], filters: Filters) {
  return records.filter((r) => {
    if (filters.q) {
      const q = filters.q.toLowerCase();
      const hay = `${r.fromStation} ${r.toStation}`.toLowerCase();
      if (!hay.includes(q) && !(r.transportationCompany || '').toLowerCase().includes(q)) return false;
    }
    if (filters.from) {
      if (new Date(r.date) < new Date(filters.from)) return false;
    }
    if (filters.to) {
      if (new Date(r.date) > new Date(filters.to)) return false;
    }
    return true;
  });
}

export function sortRecords(records: TravelRecord[], sortBy: 'date' | 'transportationType', sortOrder: 'asc' | 'desc') {
  const dir = sortOrder === 'asc' ? 1 : -1;
  return [...records].sort((a, b) => {
    if (sortBy === 'date') {
      return (new Date(a.date).getTime() - new Date(b.date).getTime()) * dir;
    }
    if (sortBy === 'transportationType') {
      return a.transportationType.localeCompare(b.transportationType) * dir;
    }
    return 0;
  });
}

export function groupByMonth(records: TravelRecord[]) {
  const map = new Map<string, TravelRecord[]>();
  records.forEach((r) => {
    // group key YYYY-MM
    const key = r.date.slice(0, 7);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(r);
  });
  // sort keys descending by month
  return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
}
