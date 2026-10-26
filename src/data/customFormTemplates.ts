import type { CustomFormDefinition } from '../types/customForm';

export const PREBUILT_CUSTOM_FORMS: CustomFormDefinition[] = [
  {
    id: 'tpl_dilator_therapy',
    title: 'Dilator Therapy Log',
    description: 'Track size progression, session duration, and pelvic pain/tension levels before, during, and after dilation.',
    category: 'Pelvic Floor Therapy',
    isPrebuilt: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    fields: [
      {
        id: 'dilator_size',
        label: 'Dilator Size / Level',
        type: 'select',
        required: true,
        options: [
          'Size 1 (Smallest / Starter)',
          'Size 2',
          'Size 3 (Medium)',
          'Size 4',
          'Size 5',
          'Size 6 (Largest / Advanced)'
        ],
        description: 'Selected dilator diameter/size used during this session'
      },
      {
        id: 'duration_minutes',
        label: 'Session Duration',
        type: 'number',
        required: true,
        unit: 'minutes',
        description: 'Total active insertion/stretching duration in minutes'
      },
      {
        id: 'pain_before',
        label: 'Pain / Resistance Before (0–10)',
        type: 'slider-10',
        required: true,
        unit: '/ 10',
        description: 'Anticipatory pain or resting introitus/perineal tension prior to insertion'
      },
      {
        id: 'pain_during',
        label: 'Pain / Sensation During (0–10)',
        type: 'slider-10',
        required: true,
        unit: '/ 10',
        description: 'Peak pain or stretch sensation experienced during dilation'
      },
      {
        id: 'pain_after',
        label: 'Post-Session Soreness (0–10)',
        type: 'slider-10',
        required: true,
        unit: '/ 10',
        description: 'Residual aching, burning, or soreness 15–30 minutes post-session'
      },
      {
        id: 'relaxation_achieved',
        label: 'Pelvic Floor Release / Relaxation Achieved',
        type: 'boolean',
        required: false,
        description: 'Did the pelvic floor muscles yield and release tension during the session?'
      },
      {
        id: 'deep_breathing_used',
        label: 'Used 360° Diaphragmatic Breathing',
        type: 'boolean',
        required: false,
        description: 'Utilized pelvic floor drop with diaphragmatic inhalation'
      }
    ]
  },
  {
    id: 'tpl_sitting_tolerance',
    title: 'Sitting Tolerance Diary',
    description: 'Monitor sitting tolerance, chair surface types, cushion ergonomics, and onset of pudendal or coccyx discomfort.',
    category: 'Ergonomics & Tolerance',
    isPrebuilt: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    fields: [
      {
        id: 'surface_type',
        label: 'Seating Surface Type',
        type: 'select',
        required: true,
        options: [
          'Office Ergonomic Chair',
          'Hard Wood / Metal Dining Chair',
          'Soft Couch / Deep Armchair',
          'Car / Vehicle Seat',
          'Airplane / Transit Seat',
          'Stool / Unpadded Bench'
        ],
        description: 'The physical seat or furniture used'
      },
      {
        id: 'cushion_used',
        label: 'Cushion / Pressure Relief Device',
        type: 'select',
        required: true,
        options: [
          'None / Direct Surface',
          'Coccyx Cutout Cushion (U-Shaped)',
          'Donut Cushion',
          'Inflatable Roho / Air Cushion',
          'Gel Support Cushion',
          'Rolled Towel / Perineal Unloader'
        ],
        description: 'Assistive support device used to reduce pelvic floor or coccyx pressure'
      },
      {
        id: 'duration_before_pain',
        label: 'Minutes Seated Before Pain Onset',
        type: 'number',
        required: true,
        unit: 'minutes',
        description: 'How many minutes elapsed before discomfort, burning, or aching began'
      },
      {
        id: 'max_pain_score',
        label: 'Peak Pain While Seated (0–10)',
        type: 'slider-10',
        required: true,
        unit: '/ 10',
        description: 'Maximum pain score reached during this sitting episode'
      },
      {
        id: 'relief_on_standing',
        label: 'Immediate Relief Upon Standing',
        type: 'boolean',
        required: false,
        description: 'Does the pain subside rapidly once pressure is removed from the pelvis?'
      },
      {
        id: 'numbness_tingling',
        label: 'Perineal / Pudendal Numbness or Tingling',
        type: 'boolean',
        required: false,
        description: 'Pudendal nerve entrapment or ischemia symptoms (pins & needles, numbness)'
      }
    ]
  },
  {
    id: 'tpl_pelvic_wand',
    title: 'Pelvic Wand & Trigger Point Release',
    description: 'Record internal/external myofascial trigger point release work, muscles targeted, and post-release soreness.',
    category: 'Myofascial Therapy',
    isPrebuilt: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    fields: [
      {
        id: 'tool_type',
        label: 'Therapy Tool Used',
        type: 'select',
        required: true,
        options: [
          'Pelvic Wand (Standard Curved)',
          'Vibrating Pelvic Wand',
          'Thera Cane / External Myofascial Hook',
          'Lacrosse / Tennis Ball (Gluteal/Piriformis)',
          'Foam Roller',
          'Manual Digital Finger Pressure'
        ],
        description: 'Device or instrument used for ischemic compression'
      },
      {
        id: 'muscles_targeted',
        label: 'Targeted Muscle Groups',
        type: 'text',
        required: true,
        description: 'e.g. Obturator Internus, Puborectalis, Coccygeus, Levator Ani, Piriformis'
      },
      {
        id: 'session_duration',
        label: 'Session Duration',
        type: 'number',
        required: true,
        unit: 'minutes',
        description: 'Total active trigger point release duration'
      },
      {
        id: 'release_quality',
        label: 'Trigger Point Release Response',
        type: 'select',
        required: true,
        options: [
          'Complete Release (Muscle yielded / melted)',
          'Partial Softening (Moderate relaxation)',
          'Minimal Change (High hypertonicity / taut band persisted)',
          'Aborted Early (Tissue too tender / flare risk)'
        ],
        description: 'Clinical tissue response after sustained ischemic pressure'
      },
      {
        id: 'tension_before',
        label: 'Baseline Muscle Tension (0–10)',
        type: 'slider-10',
        required: true,
        unit: '/ 10',
        description: 'Resting hypertonicity / muscle tautness before work'
      },
      {
        id: 'post_release_soreness',
        label: 'Post-Release Soreness (0–10)',
        type: 'slider-10',
        required: true,
        unit: '/ 10',
        description: 'Soreness score 30–60 minutes after trigger point session'
      },
      {
        id: 'heat_or_ice_applied',
        label: 'Applied Warm Sitz / Heating Pad After',
        type: 'boolean',
        required: false,
        description: 'Thermotherapy applied post-session to reduce rebound spasm'
      }
    ]
  }
];
