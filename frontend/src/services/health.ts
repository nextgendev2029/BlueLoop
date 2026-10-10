import { apiClient } from '../lib/api';

export interface HealthStatus {
  status: string;
  app_name: string;
  version: string;
  environment: string;
  timestamp: string;
  synthetic_data_mode: boolean;
}

export async function fetchHealth(): Promise<HealthStatus> {
  return apiClient<HealthStatus>('/api/v1/health');
}
