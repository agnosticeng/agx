export interface HistoryEntry {
	id?: number; // Optional since it's auto-incremented
	timestamp?: string; // Optional since it has DEFAULT (datetime('now'))
	content: string;
	execution_time: number;
	total_rows: number;
}

// Type for database result
export type HistoryEntryRow = Required<HistoryEntry>;
