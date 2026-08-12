import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { HistoryEntry } from '../hooks/useHistory';

interface HistoryProps {
  history: HistoryEntry[];
  onSelect: (text: string) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const History = ({ history, onSelect, onRemove, onClear, isOpen, onToggle }: HistoryProps) => {
  return (
    <div className={`fixed left-0 top-0 h-screen flex transition-transform duration-300 ease-in-out ${!isOpen ? '-translate-x-64' : 'translate-x-0'}`}>
      <div className="w-64 bg-[var(--paper-bg)] border-r border-[var(--text-brown)] p-4 h-full overflow-y-auto shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[var(--text-brown)]">
            History
          </h2>
          {history.length > 0 && (
            <button
              onClick={onClear}
              className="text-xs text-[var(--text-brown)] opacity-70 hover:opacity-100 underline"
            >
              Clear all
            </button>
          )}
        </div>
        {history.length === 0 ? (
          <p className="text-[var(--text-brown)] opacity-70">No history yet.</p>
        ) : (
          <ul className="space-y-2">
            {history.map((entry) => (
              <li
                key={entry.id}
                className="p-3 bg-[var(--cream-bg)] rounded-lg shadow-md cursor-pointer hover:bg-[var(--text-brown)] hover:text-white transition group"
                onClick={() => onSelect(entry.text)}
              >
                <div className="flex justify-between items-start gap-2">
                  <p className="line-clamp-2 flex-1">
                    {entry.text.slice(0, 30)}
                    {entry.text.length > 30 ? '…' : ''}
                  </p>
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      onRemove(entry.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    aria-label="Remove entry from history"
                    title="Remove from history"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs opacity-70">
                    {formatTimestamp(entry.timestamp)}
                  </span>
                  <span className="text-xs opacity-70 whitespace-nowrap">
                    {entry.confidence.toFixed(1)}%
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        onClick={onToggle}
        className="h-12 px-1 bg-[var(--paper-bg)] border-r border-t border-b border-[var(--text-brown)] shadow-md rounded-r-lg flex items-center justify-center hover:bg-[var(--cream-bg)] transition-colors"
        aria-label={isOpen ? "Close history" : "Open history"}
      >
        {isOpen ? (
          <ChevronLeft className="w-5 h-5 text-[var(--text-brown)]" />
        ) : (
          <ChevronRight className="w-5 h-5 text-[var(--text-brown)]" />
        )}
      </button>
    </div>
  );
};

export default History;
