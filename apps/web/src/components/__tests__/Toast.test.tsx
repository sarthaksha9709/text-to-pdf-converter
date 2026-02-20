import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toast, createToast } from '../Toast.js';

describe('Toast', () => {
  it('renders toast messages', () => {
    const toasts = [createToast('Test message', 'success')];
    const onDismiss = vi.fn();

    render(<Toast toasts={toasts} onDismiss={onDismiss} />);
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('calls onDismiss when close button clicked', async () => {
    const toasts = [createToast('Dismiss me', 'info')];
    const onDismiss = vi.fn();
    const user = userEvent.setup();

    render(<Toast toasts={toasts} onDismiss={onDismiss} />);
    await user.click(screen.getByRole('button', { name: /dismiss/i }));
    expect(onDismiss).toHaveBeenCalledWith(toasts[0].id);
  });

  it('applies the correct CSS class for each type', () => {
    const toasts = [
      createToast('Success', 'success'),
      createToast('Error', 'error'),
      createToast('Info', 'info')
    ];
    const onDismiss = vi.fn();

    render(<Toast toasts={toasts} onDismiss={onDismiss} />);
    expect(document.querySelector('.toast--success')).toBeInTheDocument();
    expect(document.querySelector('.toast--error')).toBeInTheDocument();
    expect(document.querySelector('.toast--info')).toBeInTheDocument();
  });

  it('auto-dismisses after 4 seconds', async () => {
    vi.useFakeTimers();
    const toasts = [createToast('Auto dismiss', 'info')];
    const onDismiss = vi.fn();

    render(<Toast toasts={toasts} onDismiss={onDismiss} />);
    act(() => vi.advanceTimersByTime(4000));
    expect(onDismiss).toHaveBeenCalled();
    vi.useRealTimers();
  });
});
