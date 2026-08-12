import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import History from './History';
import type { HistoryEntry } from '../hooks/useHistory';

const makeEntry = (overrides: Partial<HistoryEntry> = {}): HistoryEntry => ({
  id: '1',
  text: 'Recognized handwritten text goes here',
  confidence: 87.5,
  source: 'tesseract',
  timestamp: Date.now(),
  ...overrides,
});

describe('History', () => {
  it('shows an empty state when there is no history', () => {
    render(
      <History
        history={[]}
        onSelect={vi.fn()}
        onRemove={vi.fn()}
        onClear={vi.fn()}
        isOpen
        onToggle={vi.fn()}
      />
    );

    expect(screen.getByText(/no history yet/i)).toBeInTheDocument();
    expect(screen.queryByText(/clear all/i)).not.toBeInTheDocument();
  });

  it('renders each entry with its confidence score', () => {
    render(
      <History
        history={[makeEntry({ id: 'a', confidence: 87.5 }), makeEntry({ id: 'b', confidence: 42 })]}
        onSelect={vi.fn()}
        onRemove={vi.fn()}
        onClear={vi.fn()}
        isOpen
        onToggle={vi.fn()}
      />
    );

    expect(screen.getByText('87.5%')).toBeInTheDocument();
    expect(screen.getByText('42.0%')).toBeInTheDocument();
  });

  it('calls onSelect with the full text when an entry is clicked', () => {
    const onSelect = vi.fn();
    const entry = makeEntry({ text: 'the full recognized text' });
    render(
      <History
        history={[entry]}
        onSelect={onSelect}
        onRemove={vi.fn()}
        onClear={vi.fn()}
        isOpen
        onToggle={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText(/the full recognized/i));
    expect(onSelect).toHaveBeenCalledWith('the full recognized text');
  });

  it('calls onRemove with the entry id, without triggering onSelect', () => {
    const onSelect = vi.fn();
    const onRemove = vi.fn();
    render(
      <History
        history={[makeEntry({ id: 'entry-1' })]}
        onSelect={onSelect}
        onRemove={onRemove}
        onClear={vi.fn()}
        isOpen
        onToggle={vi.fn()}
      />
    );

    fireEvent.click(screen.getByLabelText(/remove entry from history/i));
    expect(onRemove).toHaveBeenCalledWith('entry-1');
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('calls onClear when "Clear all" is clicked', () => {
    const onClear = vi.fn();
    render(
      <History
        history={[makeEntry()]}
        onSelect={vi.fn()}
        onRemove={vi.fn()}
        onClear={onClear}
        isOpen
        onToggle={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText(/clear all/i));
    expect(onClear).toHaveBeenCalled();
  });

  it('calls onToggle when the collapse/expand button is clicked', () => {
    const onToggle = vi.fn();
    render(
      <History
        history={[]}
        onSelect={vi.fn()}
        onRemove={vi.fn()}
        onClear={vi.fn()}
        isOpen
        onToggle={onToggle}
      />
    );

    fireEvent.click(screen.getByLabelText(/close history/i));
    expect(onToggle).toHaveBeenCalled();
  });
});
