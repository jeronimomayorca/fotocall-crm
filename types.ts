export enum CallStatus {
  PENDING = 'PENDING',
  CALLED = 'CALLED',
  NO_ANSWER = 'NO_ANSWER',
  INTERESTED = 'INTERESTED',
  NOT_INTERESTED = 'NOT_INTERESTED',
  CLOSED = 'CLOSED'
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  company?: string;
  notes: string;
  status: CallStatus;
  lastContacted?: string; // ISO Date string
  sourceImage?: string; // For reference
  importedAt: string;
}

export interface ExtractedData {
  name: string;
  phone: string;
  company: string;
  notes: string;
}

export type SortField = 'importedAt' | 'name' | 'status';
export type SortOrder = 'asc' | 'desc';