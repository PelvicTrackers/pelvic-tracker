import type { StateCreator } from 'zustand';
import type { PatientNote } from '../types';
import { StorageService } from '../services/storage';

export interface NotesSlice {
  notes: PatientNote[];
  isLoadingNotes: boolean;
  loadNotes: () => Promise<void>;
  addNote: (note: Omit<PatientNote, 'id'>) => Promise<PatientNote>;
  updateNote: (note: PatientNote) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
}

export const createNotesSlice: StateCreator<NotesSlice, [], [], NotesSlice> = (set, get) => ({
  notes: [],
  isLoadingNotes: false,

  loadNotes: async () => {
    set({ isLoadingNotes: true });
    try {
      const items = await StorageService.getAllNotes();
      items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      set({ notes: items, isLoadingNotes: false });
    } catch {
      set({ isLoadingNotes: false });
    }
  },

  addNote: async (noteData) => {
    const id = `note_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newNote: PatientNote = {
      ...noteData,
      id
    };
    await StorageService.saveNote(newNote);
    const existing = get().notes;
    const updated = [newNote, ...existing].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    set({ notes: updated });
    return newNote;
  },

  updateNote: async (note) => {
    await StorageService.saveNote(note);
    const current = get().notes;
    const updated = current
      .map((item) => (item.id === note.id ? note : item))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    set({ notes: updated });
  },

  deleteNote: async (id) => {
    await StorageService.deleteNote(id);
    set({ notes: get().notes.filter((n) => n.id !== id) });
  }
});
