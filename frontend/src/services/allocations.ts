import { apiClient } from '../lib/api';
import {
  AllocationRunRequest,
  AllocationRunResponse,
} from '../types/api';

export async function runAllocation(request?: AllocationRunRequest): Promise<AllocationRunResponse> {
  return apiClient<AllocationRunResponse>('/api/v1/allocations/run', {
    method: 'POST',
    body: JSON.stringify(request || {}),
  });
}

export async function fetchAllocations(limit = 50, offset = 0): Promise<AllocationRunResponse[]> {
  return apiClient<AllocationRunResponse[]>('/api/v1/allocations', {
    params: { limit, offset },
  });
}

export async function fetchAllocationById(runId: string): Promise<AllocationRunResponse> {
  return apiClient<AllocationRunResponse>(`/api/v1/allocations/${runId}`);
}

export async function acceptAllocationProposal(runId: string): Promise<AllocationRunResponse> {
  return apiClient<AllocationRunResponse>(`/api/v1/allocations/${runId}/accept`, {
    method: 'POST',
  });
}

export async function rejectAllocationProposal(runId: string): Promise<AllocationRunResponse> {
  return apiClient<AllocationRunResponse>(`/api/v1/allocations/${runId}/reject`, {
    method: 'POST',
  });
}
