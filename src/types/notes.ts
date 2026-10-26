export type NoteCategory = 'Flare-up' | 'PT Question' | 'Exercise' | 'General';

export interface PatientNote {
  id: string;
  timestamp: string; // ISO string
  category: NoteCategory;
  title: string;
  content: string;
  tags?: string[];
}
