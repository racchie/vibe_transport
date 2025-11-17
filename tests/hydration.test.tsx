import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import HistoryList from '../src/components/HistoryList';
import { TravelRecord } from '../src/types';

describe('Hydration consistency', () => {
  describe('HistoryList - currency formatting', () => {
    const mockRecords: TravelRecord[] = [
      {
        id: '1',
        date: '2025-11-15',
        fromStation: '東京',
        toStation: '大阪',
        transportationType: 'train',
        transportationCompany: 'JR',
        fare: 13620,
      },
      {
        id: '2',
        date: '2025-11-16',
        fromStation: '新宿',
        toStation: '渋谷',
        transportationType: 'train',
        fare: 200,
      },
    ];

    it('renders fare with consistent formatting in compact view', () => {
      const { container } = render(
        <HistoryList
          records={mockRecords}
          onEdit={() => {}}
          onDelete={() => {}}
          onUse={() => {}}
          compact={true}
        />
      );

      // Should render with comma separator
      expect(container.textContent).toContain('¥13,620');
      expect(container.textContent).toContain('¥200');
      
      // Should NOT use toLocaleString format
      expect(container.textContent).not.toContain('¥13,620.00');
    });

    it('renders fare with consistent formatting in detailed view', () => {
      const { container } = render(
        <HistoryList
          records={mockRecords}
          onEdit={() => {}}
          onDelete={() => {}}
          onUse={() => {}}
          compact={false}
        />
      );

      // Should render with comma separator
      expect(container.textContent).toContain('¥13,620');
      expect(container.textContent).toContain('¥200');
    });

    it('produces identical HTML across multiple renders (hydration safety)', () => {
      const { container: container1 } = render(
        <HistoryList
          records={mockRecords}
          onEdit={() => {}}
          onDelete={() => {}}
          onUse={() => {}}
          compact={false}
        />
      );

      const { container: container2 } = render(
        <HistoryList
          records={mockRecords}
          onEdit={() => {}}
          onDelete={() => {}}
          onUse={() => {}}
          compact={false}
        />
      );

      // Both renders should produce identical HTML
      expect(container1.innerHTML).toBe(container2.innerHTML);
    });
  });
});
