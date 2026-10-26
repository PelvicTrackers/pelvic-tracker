export interface CustomMetricItem {
  id: string;
  name: string; // e.g. "Tailbone Pain", "Vulvar Burning"
  scale: '1-10' | '1-100';
  value: number | null;
  isNA: boolean;
  comment: string;
}

export interface CustomMetricDefinition {
  id: string;
  name: string;
  scale: '1-10' | '1-100';
  category?: 'sexual' | 'urinary' | 'bowel' | 'general';
  description?: string;
}
