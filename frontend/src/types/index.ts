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

export type DatasetStorageBackend = 'local' | 'supabase' | 's3';
export type TrainingStatus = 'queued' | 'running' | 'completed' | 'failed' | 'canceled';
export type TrainingModelType = 'yolov8n' | 'yolov8s' | 'yolov8m';
export type DatasetSplit = 'train' | 'val' | 'test';

export interface DatasetProject {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  storage_backend: DatasetStorageBackend;
  storage_path: string;
  classes: string[];
  image_count: number;
  label_count: number;
  train_count: number;
  val_count: number;
  test_count: number;
  created_by: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface DatasetAsset {
  id: string;
  dataset_id: string;
  file_name: string;
  split: DatasetSplit;
  asset_type: 'image' | 'label' | 'zip' | 'other';
  file_path: string;
  label_path: string | null;
  preview_url: string | null;
  size_bytes: number | null;
  created_at: string;
}

export interface TrainingJob {
  id: string;
  dataset_id: string;
  model_type: TrainingModelType;
  epochs: number;
  batch_size: number;
  image_size: number;
  learning_rate: number;
  optimizer: string;
  status: TrainingStatus;
  progress: number;
  current_epoch: number;
  total_epochs: number;
  train_loss: number | null;
  val_loss: number | null;
  map50: number | null;
  precision: number | null;
  recall: number | null;
  eta_seconds: number | null;
  gpu_usage: number | null;
  ram_usage: number | null;
  config: Record<string, unknown>;
  logs_path: string | null;
  error_message: string | null;
  created_by: string | null;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
  model_version_id: string | null;
}

export interface TrainingLog {
  id: string;
  training_job_id: string;
  level: 'debug' | 'info' | 'warning' | 'error';
  message: string;
  epoch: number | null;
  step: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ModelVersion {
  id: string;
  dataset_id: string;
  training_job_id: string;
  name: string;
  version: string;
  model_type: TrainingModelType;
  weights_path: string;
  config: Record<string, unknown>;
  metrics: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
  deployed_at: string | null;
}

export interface DatasetStats {
  dataset_id: string;
  slug: string;
  classes: string[];
  image_count: number;
  label_count: number;
  train_count: number;
  val_count: number;
  test_count: number;
  defect_distribution: Record<string, number>;
  asset_count?: number;
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
