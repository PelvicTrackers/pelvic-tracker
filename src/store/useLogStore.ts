import { create } from 'zustand';
import { createSexualSlice, type SexualSlice } from './sexualSlice';
import { createUrinarySlice, type UrinarySlice } from './urinarySlice';
import { createBowelSlice, type BowelSlice } from './bowelSlice';
import { createNotesSlice, type NotesSlice } from './notesSlice';
import { createSettingsSlice, type SettingsSlice } from './settingsSlice';
import { createExportSlice, type ExportSlice } from './exportSlice';
import { createCustomFormSlice, type CustomFormSlice } from './customFormSlice';

export type RootStore = SexualSlice &
  UrinarySlice &
  BowelSlice &
  NotesSlice &
  SettingsSlice &
  ExportSlice &
  CustomFormSlice & {
    initApp: () => Promise<void>;
  };

export const useLogStore = create<RootStore>()((...a) => ({
  ...createSexualSlice(...a),
  ...createUrinarySlice(...a),
  ...createBowelSlice(...a),
  ...createNotesSlice(...a),
  ...createSettingsSlice(...a),
  ...createExportSlice(...a),
  ...createCustomFormSlice(...a),

  initApp: async () => {
    const [, get] = a;
    await Promise.all([
      get().loadSettings(),
      get().loadSexualEntries(),
      get().loadUrinaryEntries(),
      get().loadBowelEntries(),
      get().loadNotes(),
      get().loadCustomForms(),
      get().loadCustomEntries()
    ]);
  }
}));
