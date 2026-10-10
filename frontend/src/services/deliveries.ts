import { apiClient } from '../lib/api';
import {
  DeliveryListResponse,
  DeliveryRecord,
  DeliveryCreateRequest,
  DeliveryStatusUpdateRequest,
  DeliveryLifecycleStatus,
} from '../types/api';

export interface DeliveryFilterParams {
  allocation_candidate_id?: string;
  status?: DeliveryLifecycleStatus;
  limit?: number;
  offset?: number;
}

export async function fetchDeliveries(params?: DeliveryFilterParams): Promise<DeliveryListResponse> {
  return apiClient<DeliveryListResponse>('/api/v1/deliveries', { params: params as any });
}

export async function fetchDeliveryById(id: string): Promise<DeliveryRecord> {
  return apiClient<DeliveryRecord>(`/api/v1/deliveries/${id}`);
}

export async function createDelivery(payload: DeliveryCreateRequest): Promise<DeliveryRecord> {
  return apiClient<DeliveryRecord>('/api/v1/deliveries', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateDeliveryStatus(
  id: string,
  payload: DeliveryStatusUpdateRequest
): Promise<DeliveryRecord> {
  return apiClient<DeliveryRecord>(`/api/v1/deliveries/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}
