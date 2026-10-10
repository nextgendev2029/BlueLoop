import { apiClient } from '../lib/api';
import {
  SupplierListResponse,
  SupplierFacility,
  SupplyListResponse,
  SupplyListing,
  FacilityType,
  WaterGrade,
  VerificationStatus,
} from '../types/api';

export interface SupplierFilterParams {
  city?: string;
  state?: string;
  facility_type?: FacilityType;
  verification_status?: VerificationStatus;
  limit?: number;
  offset?: number;
}

export interface SupplyFilterParams {
  water_grade?: WaterGrade;
  status?: string;
  quality_evidence_status?: string;
  min_volume_kl?: number;
  max_price_per_kl?: number;
  limit?: number;
  offset?: number;
}

export async function fetchSuppliers(params?: SupplierFilterParams): Promise<SupplierListResponse> {
  return apiClient<SupplierListResponse>('/api/v1/suppliers', { params: params as any });
}

export async function fetchSupplierById(id: string): Promise<SupplierFacility> {
  return apiClient<SupplierFacility>(`/api/v1/suppliers/${id}`);
}

export async function fetchSupplies(params?: SupplyFilterParams): Promise<SupplyListResponse> {
  return apiClient<SupplyListResponse>('/api/v1/supplies', { params: params as any });
}

export async function fetchSupplyById(id: string): Promise<SupplyListing> {
  return apiClient<SupplyListing>(`/api/v1/supplies/${id}`);
}
