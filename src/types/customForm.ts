export type CustomFormFieldType =
  | 'slider-10'
  | 'slider-100'
  | 'number'
  | 'select'
  | 'text'
  | 'boolean';

export interface CustomFormField {
  id: string;
  label: string;
  type: CustomFormFieldType;
  required: boolean;
  options?: string[]; // Used for 'select'
  unit?: string; // Optional unit suffix, e.g. "minutes", "size #", "mL"
  description?: string; // Optional helper text
}

export interface CustomFormDefinition {
  id: string;
  title: string;
  description: string;
  category: string; // e.g. "Therapy", "Ergonomics", "Myofascial", "General"
  fields: CustomFormField[];
  createdAt: string;
  updatedAt?: string;
  isPrebuilt?: boolean;
}

export interface CustomFormEntry {
  id: string;
  formId: string;
  timestamp: string;
  responses: Record<string, any>; // fieldId -> value
  notes?: string;
}

export interface SharedFormEnvelope {
  format: 'pelvic-tracker-form';
  version: 1;
  form: CustomFormDefinition;
  exportedAt: string;
}
