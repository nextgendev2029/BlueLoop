import { apiClient } from '../lib/api';
import { HealthStatus } from '../types/api';

export type { HealthStatus };

export async function fetchHealth(): Promise<HealthStatus> {
  return apiClient<HealthStatus>('/api/v1/health');
}
