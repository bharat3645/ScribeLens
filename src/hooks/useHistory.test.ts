import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useHistory } from './useHistory';

describe('useHistory', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts empty when nothing has been saved yet', () => {
    const { result } = renderHook(() => useHistory());
    expect(result.current.history).toEqual([]);
  });

  it('adds a new entry to the front of the list with an id and timestamp', () => {
    const { result } = renderHook(() => useHistory());

    act(() => {
      result.current.addEntry({ text: 'hello', confidence: 90, source: 'tesseract' });
    });

    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0]).toMatchObject({ text: 'hello', confidence: 90 });
    expect(result.current.history[0].id).toBeTruthy();
    expect(typeof result.current.history[0].timestamp).toBe('number');
  });

  it('persists entries to localStorage', () => {
    const { result } = renderHook(() => useHistory());

    act(() => {
      result.current.addEntry({ text: 'saved', confidence: 80, source: 'tesseract' });
    });

    const raw = localStorage.getItem('scribelens:history');
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw as string)).toHaveLength(1);
  });

  it('restores previously saved history on the next mount', () => {
    const { result: first } = renderHook(() => useHistory());
    act(() => {
      first.current.addEntry({ text: 'persisted', confidence: 70, source: 'tesseract' });
    });

    const { result: second } = renderHook(() => useHistory());
    expect(second.current.history).toHaveLength(1);
    expect(second.current.history[0].text).toBe('persisted');
  });

  it('removes an entry by id', () => {
    const { result } = renderHook(() => useHistory());
    act(() => {
      result.current.addEntry({ text: 'one', confidence: 1, source: 'tesseract' });
    });
    const id = result.current.history[0].id;

    act(() => {
      result.current.removeEntry(id);
    });

    expect(result.current.history).toEqual([]);
  });

  it('clears all entries', () => {
    const { result } = renderHook(() => useHistory());
    act(() => {
      result.current.addEntry({ text: 'a', confidence: 1, source: 'tesseract' });
      result.current.addEntry({ text: 'b', confidence: 2, source: 'tesseract' });
    });

    act(() => {
      result.current.clearHistory();
    });

    expect(result.current.history).toEqual([]);
  });

  it('caps history at 50 entries so localStorage cannot grow unbounded', () => {
    const { result } = renderHook(() => useHistory());

    act(() => {
      for (let i = 0; i < 55; i += 1) {
        result.current.addEntry({ text: `entry ${i}`, confidence: 50, source: 'tesseract' });
      }
    });

    expect(result.current.history.length).toBeLessThanOrEqual(50);
    // Most recent entry should still be first.
    expect(result.current.history[0].text).toBe('entry 54');
  });
});
