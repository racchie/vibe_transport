import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HistoryList from '../src/components/HistoryList';
import type { TravelRecord } from '../src/types';

describe('HistoryList', () => {
  const sampleRecord: TravelRecord = {
    id: '1',
    date: '2025-11-10',
    fromStation: '新宿',
    toStation: '渋谷',
    transportationType: 'train',
    transportationCompany: 'JR',
    fare: 200,
  };

  it('renders empty state', () => {
    const mockCallbacks = {
      onEdit: vi.fn(),
      onDelete: vi.fn(),
      onUse: vi.fn(),
    };
    render(<HistoryList records={[]} {...mockCallbacks} compact={false} />);
    expect(screen.getByText(/該当する記録がありません/i)).toBeInTheDocument();
  });

  it('renders detailed list with record', () => {
    const mockCallbacks = {
      onEdit: vi.fn(),
      onDelete: vi.fn(),
      onUse: vi.fn(),
    };
    render(<HistoryList records={[sampleRecord]} {...mockCallbacks} compact={false} />);
    expect(screen.getByText(/新宿 → 渋谷/i)).toBeInTheDocument();
    expect(screen.getByText(/JR/i)).toBeInTheDocument();
    expect(screen.getByText(/¥200/i)).toBeInTheDocument();
  });

  it('renders compact list with record', () => {
    const mockCallbacks = {
      onEdit: vi.fn(),
      onDelete: vi.fn(),
      onUse: vi.fn(),
    };
    render(<HistoryList records={[sampleRecord]} {...mockCallbacks} compact={true} />);
    expect(screen.getByText(/新宿 → 渋谷/i)).toBeInTheDocument();
    expect(screen.getByText(/¥200/i)).toBeInTheDocument();
  });

  it('calls onEdit when edit button clicked (detailed)', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const mockCallbacks = {
      onEdit,
      onDelete: vi.fn(),
      onUse: vi.fn(),
    };
    render(<HistoryList records={[sampleRecord]} {...mockCallbacks} compact={false} />);
    
    const editButton = screen.getByRole('button', { name: /編集/i });
    await user.click(editButton);
    
    expect(onEdit).toHaveBeenCalledWith(sampleRecord);
  });

  it('calls onDelete when delete button clicked', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    const mockCallbacks = {
      onEdit: vi.fn(),
      onDelete,
      onUse: vi.fn(),
    };
    render(<HistoryList records={[sampleRecord]} {...mockCallbacks} compact={false} />);
    
    const deleteButton = screen.getByRole('button', { name: /削除/i });
    await user.click(deleteButton);
    
    expect(onDelete).toHaveBeenCalledWith('1');
  });

  it('calls onUse when use button clicked', async () => {
    const user = userEvent.setup();
    const onUse = vi.fn();
    const mockCallbacks = {
      onEdit: vi.fn(),
      onDelete: vi.fn(),
      onUse,
    };
    render(<HistoryList records={[sampleRecord]} {...mockCallbacks} compact={false} />);
    
    const useButton = screen.getByRole('button', { name: /使用/i });
    await user.click(useButton);
    
    expect(onUse).toHaveBeenCalled();
  });

  it('renders multiple records', () => {
    const record2: TravelRecord = { ...sampleRecord, id: '2', fromStation: '池袋', toStation: '上野' };
    const mockCallbacks = {
      onEdit: vi.fn(),
      onDelete: vi.fn(),
      onUse: vi.fn(),
    };
    render(<HistoryList records={[sampleRecord, record2]} {...mockCallbacks} compact={false} />);
    
    expect(screen.getByText(/新宿 → 渋谷/i)).toBeInTheDocument();
    expect(screen.getByText(/池袋 → 上野/i)).toBeInTheDocument();
  });
});
