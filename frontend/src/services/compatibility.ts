import { apiClient } from '../lib/api';
import {
  CompatibilityEvaluationRequest,
  CompatibilityEvaluationResponse,
} from '../types/api';

export async function evaluateCompatibility(
  payload: CompatibilityEvaluationRequest
): Promise<CompatibilityEvaluationResponse> {
  return apiClient<CompatibilityEvaluationResponse>('/api/v1/compatibility/evaluate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
