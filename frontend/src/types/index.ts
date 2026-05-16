// TypeScript types for VisionInspect

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
  is_verified: boolean;
  is_admin: boolean;
  created_at: string;
  plan: 'free' | 'pro';
}


export interface Prediction {
  id: string;
  label: string;
  confidence: number;
  all_scores: Record<string, number> | null;
  image_filename: string;
  processing_ms: number | null;
  created_at: string;
}

export interface PredictionList {
  items: Prediction[];
  total: number;
  page: number;
  page_size: number;
}

export interface TrainingClassInfo {
  class_name: string;
  train_count: number;
  is_trained: boolean;
}

export interface TrainingClassesResponse {
  items: TrainingClassInfo[];
  total_classes: number;
  trained_classes: number;
}

export interface UsageStats {
  plan: string;
  predictions_used: number;
  predictions_limit: number;
  predictions_remaining: number;
  reset_date: string | null;
  percentage_used: number;
}

export interface DashboardStats {
  total_predictions: number;
  predictions_this_month: number;
  most_common_defect: string | null;
  average_confidence: number | null;
  defect_breakdown: Record<string, number>;
}

export interface Subscription {
  plan: string;
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

export type DefectLabel =
  | 'good'
  | 'scratch'
  | 'dent'
  | 'crack'
  | 'contamination'
  | 'missing_part';

export const DEFECT_LABELS: DefectLabel[] = [
  'good',
  'scratch',
  'dent',
  'crack',
  'contamination',
  'missing_part',
];

export const DEFECT_COLORS: Record<DefectLabel, string> = {
  good: '#22c55e',
  scratch: '#f59e0b',
  dent: '#ef4444',
  crack: '#dc2626',
  contamination: '#8b5cf6',
  missing_part: '#ec4899',
};
