import { apiClient } from '../lib/api';
import { ImpactSummaryResponse } from '../types/api';

export async function fetchImpactSummary(): Promise<ImpactSummaryResponse> {
  return apiClient<ImpactSummaryResponse>('/api/v1/impact/summary');
}
