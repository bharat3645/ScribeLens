import { useEffect, useState } from 'react';

export interface HistoryEntry {
  id: string;
  text: string;
  confidence: number;
  source: 'tesseract' | 'tf' | 'combined';
  timestamp: number;
}

const STORAGE_KEY = 'neuro-ocr:history';
/** Keep localStorage bounded even for long-running sessions. */
const MAX_ENTRIES = 50;

function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // Corrupt JSON, or localStorage unavailable (private browsing, etc.)
    return [];
  }
}

/**
 * Session history, persisted to localStorage. Previously this lived only
 * in React state, so a page refresh silently discarded every past result
 * -- a documented limitation that this hook removes.
 */
export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>(() => loadHistory());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch {
      // Quota exceeded or storage disabled -- history still works for the
      // current session, it just won't survive a reload.
    }
  }, [history]);

  const addEntry = (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => {
    const newEntry: HistoryEntry = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: Date.now(),
    };
    setHistory((prev) => [newEntry, ...prev].slice(0, MAX_ENTRIES));
  };

  const removeEntry = (id: string) => {
    setHistory((prev) => prev.filter((entry) => entry.id !== id));
  };

  const clearHistory = () => setHistory([]);

  return { history, addEntry, removeEntry, clearHistory };
}
