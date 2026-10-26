import type {
  BristolStoolType,
  EjaculationType,
  SexualActivityType,
  UrgencyLevel,
  LeakageType,
  LeakageAmount,
  PadStatus,
  FluidType,
  PosturalSplintingAssistance,
  NoteCategory
} from '../types';

export interface BristolTypeDetail {
  type: BristolStoolType;
  title: string;
  description: string;
  clinicalCategory: 'Constipation' | 'Normal' | 'Diarrhea / Urgent';
  colorHex: string;
}

export const BRISTOL_STOOL_SCALE: readonly BristolTypeDetail[] = [
  {
    type: 1,
    title: 'Type 1: Hard Lumps',
    description: 'Separate hard lumps, like nuts (hard to pass)',
    clinicalCategory: 'Constipation',
    colorHex: '#8D6E63'
  },
  {
    type: 2,
    title: 'Type 2: Lumpy Sausage',
    description: 'Sausage-shaped, but lumpy and firm',
    clinicalCategory: 'Constipation',
    colorHex: '#A1887F'
  },
  {
    type: 3,
    title: 'Type 3: Cracked Sausage',
    description: 'Like a sausage with cracks on its surface',
    clinicalCategory: 'Normal',
    colorHex: '#8D7B68'
  },
  {
    type: 4,
    title: 'Type 4: Smooth Snake',
    description: 'Smooth and soft, like a sausage or snake (Ideal)',
    clinicalCategory: 'Normal',
    colorHex: '#6D8B74'
  },
  {
    type: 5,
    title: 'Type 5: Soft Blobs',
    description: 'Soft blobs with clear-cut edges (passed easily)',
    clinicalCategory: 'Normal',
    colorHex: '#7C9082'
  },
  {
    type: 6,
    title: 'Type 6: Fluffy Pieces',
    description: 'Fluffy pieces with ragged edges, a mushy stool',
    clinicalCategory: 'Diarrhea / Urgent',
    colorHex: '#D4A373'
  },
  {
    type: 7,
    title: 'Type 7: Liquid / Watery',
    description: 'Entirely liquid, watery, no solid pieces',
    clinicalCategory: 'Diarrhea / Urgent',
    colorHex: '#E07A5F'
  }
];

export const SEXUAL_ACTIVITIES: { value: SexualActivityType; label: string; fullTitle: string }[] = [
  { value: 'M', label: 'M', fullTitle: 'Masturbation (Neutral Baseline)' },
  { value: 'PVI', label: 'PVI', fullTitle: 'Penile-Vaginal Intercourse (Penetrative)' },
  { value: 'RVI', label: 'RVI', fullTitle: 'Receptive Vaginal Intercourse' },
  { value: 'PAI', label: 'PAI', fullTitle: 'Penile-Anal Intercourse (Penetrative)' },
  { value: 'RAI', label: 'RAI', fullTitle: 'Receptive Anal Intercourse' },
  { value: 'Other', label: 'Other', fullTitle: 'Other Intimacy / Non-penetrative' }
];

export const EJACULATION_OPTIONS: { value: EjaculationType; label: string; description: string }[] = [
  { value: 'N', label: 'Normal (N)', description: 'Comfortable & expected timing (ejaculation / climax)' },
  { value: 'E', label: 'Early (E)', description: 'Premature or rapid climax / ejaculation' },
  { value: 'D', label: 'Delayed (D)', description: 'Extended effort required to reach climax' },
  { value: 'A', label: 'Absent (A)', description: 'Anorgasmia / dry / unable to climax' },
  { value: 'P', label: 'Painful (P)', description: 'Pelvic, perineal, or urethral discomfort on orgasm/climax' }
];

export const URINARY_URGENCY_LEVELS: { value: UrgencyLevel; label: string; description: string }[] = [
  { value: 0, label: '0 - None', description: 'Normal sensation, can defer comfortably' },
  { value: 1, label: '1 - Mild', description: 'First sensation of fullness, easy to hold' },
  { value: 2, label: '2 - Moderate', description: 'Strong desire, must empty within minutes' },
  { value: 3, label: '3 - Severe', description: 'Sudden uncontrollable urge, fear of leakage' }
];

export const FLUID_TYPES: { value: FluidType; label: string }[] = [
  { value: 'water', label: 'Water' },
  { value: 'caffeine', label: 'Caffeine (Coffee/Energy)' },
  { value: 'tea', label: 'Tea / Herbal' },
  { value: 'carbonated', label: 'Carbonated / Soda' },
  { value: 'alcohol', label: 'Alcohol' },
  { value: 'other', label: 'Other Beverage' }
];

export const LEAKAGE_TYPES: { value: LeakageType; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'stress', label: 'Stress (Cough/Sneeze/Lift)' },
  { value: 'urge', label: 'Urge (Sudden Spasm)' },
  { value: 'mixed', label: 'Mixed (Stress + Urge)' },
  { value: 'continuous', label: 'Continuous Dribble' },
  { value: 'other', label: 'Other' }
];

export const LEAKAGE_AMOUNTS: { value: LeakageAmount; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'drops', label: 'Few Drops' },
  { value: 'moderate', label: 'Moderate Wetness' },
  { value: 'soaked', label: 'Soaked / Heavy' }
];

export const PAD_STATUSES: { value: PadStatus; label: string }[] = [
  { value: 'none', label: 'No Pad Used' },
  { value: 'dry', label: 'Pad Dry' },
  { value: 'damp', label: 'Pad Damp' },
  { value: 'wet', label: 'Pad Wet' },
  { value: 'replaced', label: 'Pad Replaced' }
];

export const POSTURAL_SPLINTING_OPTIONS: { value: PosturalSplintingAssistance; label: string }[] = [
  { value: 'none', label: 'Normal Posture' },
  { value: 'squatty_potty', label: 'Footstool / Squatty Potty' },
  { value: 'manual_splinting', label: 'Manual Perineal Splinting' },
  { value: 'both', label: 'Footstool + Manual Splinting' }
];

export const NOTE_CATEGORIES: { value: NoteCategory; label: string; color: string }[] = [
  { value: 'Flare-up', label: 'Pelvic Flare-Up', color: '#D9534F' },
  { value: 'PT Question', label: 'PT / Doctor Question', color: '#3178C6' },
  { value: 'Exercise', label: 'HEP / Floor Exercises', color: '#2E7D32' },
  { value: 'General', label: 'General Journal', color: '#6B7280' }
];
