import { apiClient } from '../lib/api';
import {
  DemandListResponse,
  DemandRequest,
  IntendedUse,
  DemandStatus,
} from '../types/api';

export interface DemandFilterParams {
  intended_use?: IntendedUse;
  status?: DemandStatus;
  max_distance_km?: number;
  limit?: number;
  offset?: number;
}

export async function fetchDemands(params?: DemandFilterParams): Promise<DemandListResponse> {
  return apiClient<DemandListResponse>('/api/v1/demands', { params: params as any });
}

export async function fetchDemandById(id: string): Promise<DemandRequest> {
  return apiClient<DemandRequest>(`/api/v1/demands/${id}`);
}
