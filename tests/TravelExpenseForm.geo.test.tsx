import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TravelExpenseForm from '../src/components/TravelExpenseForm';

function setupGeolocationAndFetch() {
  const getCurrentPosition = vi.fn().mockImplementation((successCb) => {
    successCb({ coords: { latitude: 35.681236, longitude: 139.767125, accuracy: 10 } });
  });
  Object.defineProperty(global.navigator, 'geolocation', {
    value: { getCurrentPosition },
    configurable: true,
  });

  vi.spyOn(global, 'fetch' as any).mockResolvedValue({
    ok: true,
    json: async () => ({
      response: {
        station: [
          { name: '東京', line: 'JR山手線', x: '139.767125', y: '35.681236', distance: '120' },
          { name: '有楽町', line: 'JR山手線', x: '139.7638', y: '35.6751', distance: '600' },
        ],
      },
    }),
  } as any);
}

describe('TravelExpenseForm geolocation integration', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('fills fromStation and sets train when selecting a nearby station', async () => {
    setupGeolocationAndFetch();

    const addToast = vi.fn();
    render(<TravelExpenseForm onSubmit={vi.fn()} addToast={addToast as any} />);

    const fromInput = screen.getByLabelText('出発駅/バス停');
    const geoBtn = screen.getByRole('button', { name: '現在地から出発駅を検索' });

    fireEvent.click(geoBtn);

    await waitFor(() => expect(screen.getByText('東京')).toBeInTheDocument());

    fireEvent.click(screen.getByText('東京'));

    expect((fromInput as HTMLInputElement).value).toBe('東京');
    expect(screen.getByLabelText('交通手段')).toHaveValue('train');
    // トーストが呼ばれていること
    expect(addToast).toHaveBeenCalled();
  });
});
