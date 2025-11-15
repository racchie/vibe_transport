import { describe, it, expect } from 'vitest';
import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Toast from '../src/components/Toast';
import type { ToastItem } from '../src/hooks/useToast';

describe('Toast', () => {
  it('renders nothing when toasts array is empty', () => {
    const { container } = render(<Toast toasts={[]} onRemove={() => {}} />);
    expect(container.querySelector('[role="region"]')).toBeInTheDocument();
  });

  it('renders success toast with correct styling', () => {
    const toasts: ToastItem[] = [
      { id: '1', message: 'Success message', type: 'success', timeout: 3500 },
    ];
    render(<Toast toasts={toasts} onRemove={() => {}} />);
    expect(screen.getByText('Success message')).toBeInTheDocument();
      const toastElement = screen.getByText('Success message').closest('[class*="animate-fadeIn"]');
      expect(toastElement).toHaveClass('bg-green-50');
  });

  it('renders error toast with correct styling', () => {
    const toasts: ToastItem[] = [
      { id: '1', message: 'Error message', type: 'error', timeout: 3500 },
    ];
    render(<Toast toasts={toasts} onRemove={() => {}} />);
    expect(screen.getByText('Error message')).toBeInTheDocument();
      const toastElement = screen.getByText('Error message').closest('[class*="animate-fadeIn"]');
      expect(toastElement).toHaveClass('bg-red-50');
  });

  it('renders warning toast with correct styling', () => {
    const toasts: ToastItem[] = [
      { id: '1', message: 'Warning message', type: 'warning', timeout: 3500 },
    ];
    render(<Toast toasts={toasts} onRemove={() => {}} />);
    expect(screen.getByText('Warning message')).toBeInTheDocument();
      const toastElement = screen.getByText('Warning message').closest('[class*="animate-fadeIn"]');
      expect(toastElement).toHaveClass('bg-yellow-50');
  });

  it('renders info toast with correct styling', () => {
    const toasts: ToastItem[] = [
      { id: '1', message: 'Info message', type: 'info', timeout: 3500 },
    ];
    render(<Toast toasts={toasts} onRemove={() => {}} />);
    expect(screen.getByText('Info message')).toBeInTheDocument();
      const toastElement = screen.getByText('Info message').closest('[class*="animate-fadeIn"]');
      expect(toastElement).toHaveClass('bg-blue-50');
  });

  it('calls onRemove when close button clicked', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    const toasts: ToastItem[] = [
      { id: '1', message: 'Test message', type: 'success', timeout: 3500 },
    ];
    render(<Toast toasts={toasts} onRemove={onRemove} />);

    const closeButton = screen.getByRole('button', { name: /Close notification/i });
    await user.click(closeButton);

    expect(onRemove).toHaveBeenCalledWith('1');
  });

  it('renders multiple toasts', () => {
    const toasts: ToastItem[] = [
      { id: '1', message: 'First message', type: 'success', timeout: 3500 },
      { id: '2', message: 'Second message', type: 'error', timeout: 3500 },
      { id: '3', message: 'Third message', type: 'info', timeout: 3500 },
    ];
    render(<Toast toasts={toasts} onRemove={() => {}} />);

    expect(screen.getByText('First message')).toBeInTheDocument();
    expect(screen.getByText('Second message')).toBeInTheDocument();
    expect(screen.getByText('Third message')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    const toasts: ToastItem[] = [
      { id: '1', message: 'Test message', type: 'info', timeout: 3500 },
    ];
    const { container } = render(<Toast toasts={toasts} onRemove={() => {}} />);

    const region = container.querySelector('[role="region"]');
    expect(region).toHaveAttribute('aria-live', 'polite');
    expect(region).toHaveAttribute('aria-label', 'Notifications');
  });
});
