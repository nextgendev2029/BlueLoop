/**
 * BlueLoop Comprehensive TypeScript API Contracts
 * Fully synchronized with backend schemas (app.schemas).
 */

export type FacilityType =
  | 'CETP'
  | 'INDUSTRIAL_STP'
  | 'MANUFACTURING_WWTP'
  | 'MUNICIPAL_TERTIARY';

export type WaterGrade =
  | 'RO_PERMEATE'
  | 'TERTIARY_POLISHED'
  | 'SECONDARY_CLARIFIED'
  | 'INDUSTRIAL_RECYCLED';

export type VerificationStatus =
  | 'VERIFIED'
  | 'PENDING_AUDIT'
  | 'REJECTED'
  | 'SELF_REPORTED'
  | 'UNVERIFIED';

export type ListingStatus =
  | 'AVAILABLE'
  | 'ALLOCATED'
  | 'EXPIRED'
  | 'DELIVERED';

export type DemandStatus =
  | 'OPEN'
  | 'ALLOCATED'
  | 'PARTIALLY_ALLOCATED'
  | 'CANCELLED';

export type IntendedUse =
  | 'COOLING_TOWER'
  | 'BOILER_FEED'
  | 'INDUSTRIAL_PROCESS'
  | 'CONSTRUCTION_BATCHING'
  | 'LANDSCAPING_NON_POTABLE'
  | 'TOILET_FLUSHING';

export type DeliveryMode = 'PIPELINE' | 'DEDICATED_TANKER';

export type DeliveryLifecycleStatus =
  | 'SCHEDULED'
  | 'DISPATCHED'
  | 'IN_TRANSIT'
  | 'DELIVERED_SAMPLE_PENDING'
  | 'ACCEPTED_CONFIRMED'
  | 'REJECTED_QUALITY_FAILURE';

export type EligibilityStatus =
  | 'ELIGIBLE'
  | 'INELIGIBLE_QUALITY_FAIL'
  | 'INELIGIBLE_DISTANCE_EXCEEDED'
  | 'INELIGIBLE_PRICE_EXCEEDED'
  | 'INELIGIBLE_CAPACITY_ZERO'
  | 'UNKNOWN_DATA_MISSING';

export interface HeavyMetalsReport {
  cadmium_mg_l?: number | null;
  chromium_mg_l?: number | null;
  lead_mg_l?: number | null;
  nickel_mg_l?: number | null;
  all_within_cpcb_limits?: boolean | null;
}

export interface WaterQualityMeasurements {
  ph?: number | null;
  tds_mg_l?: number | null;
  cod_mg_l?: number | null;
  bod_mg_l?: number | null;
  tss_mg_l?: number | null;
  turbidity_ntu?: number | null;
  heavy_metals?: HeavyMetalsReport | null;
  tested_at?: string | null;
  lab_accreditation_number?: string | null;
}

export interface QualityLimits {
  min_ph?: number | null;
  max_ph?: number | null;
  max_tds_mg_l?: number | null;
  max_cod_mg_l?: number | null;
  max_bod_mg_l?: number | null;
  max_tss_mg_l?: number | null;
  max_turbidity_ntu?: number | null;
  heavy_metals_must_pass?: boolean;
}

export interface ParameterEvaluationResult {
  parameter_name: string;
  measured_value: number | null;
  unit: string;
  buyer_min: number | null;
  buyer_max: number | null;
  status: 'PASS' | 'FAIL' | 'UNKNOWN';
  reason: string;
}

export interface CompatibilityEvaluationRequest {
  listing_id?: string;
  demand_id?: string;
  custom_measurements?: WaterQualityMeasurements;
  custom_limits?: QualityLimits;
}

export interface CompatibilityEvaluationResponse {
  listing_id?: string | null;
  demand_id?: string | null;
  is_eligible: boolean;
  decision_summary: string;
  parameter_results: ParameterEvaluationResult[];
  failed_parameters: string[];
  unknown_parameters: string[];
  disclaimer: string;
  evaluated_at: string;
  is_synthetic: boolean;
}

export interface SupplierFacility {
  id: string;
  org_id: string;
  name: string;
  facility_type: FacilityType;
  city: string;
  state: string;
  latitude?: number | null;
  longitude?: number | null;
  verification_status: VerificationStatus;
  contact_email?: string | null;
  contact_phone?: string | null;
  organisation_name?: string | null;
  is_synthetic: boolean;
  created_at: string;
}

export interface SupplierListResponse {
  items: SupplierFacility[];
  total: number;
  limit?: number | null;
  offset?: number | null;
  is_synthetic: boolean;
}

export interface SupplyListing {
  id: string;
  facility_id: string;
  facility_name?: string | null;
  name: string;
  water_grade: WaterGrade;
  available_volume_kl: number;
  price_per_kl: number;
  available_from: string;
  available_until?: string | null;
  delivery_radius_km?: number | null;
  quality_evidence_status: VerificationStatus;
  measurements?: WaterQualityMeasurements | null;
  status: ListingStatus;
  is_synthetic: boolean;
  created_at: string;
}

export interface SupplyListResponse {
  items: SupplyListing[];
  total: number;
  limit?: number | null;
  offset?: number | null;
  is_synthetic: boolean;
}

export interface DemandRequest {
  id: string;
  org_id: string;
  facility_name: string;
  intended_use: IntendedUse;
  required_volume_kl: number;
  max_price_per_kl?: number | null;
  total_budget?: number | null;
  max_distance_km?: number | null;
  quality_limits: QualityLimits;
  status: DemandStatus;
  is_synthetic: boolean;
  created_at: string;
}

export interface DemandListResponse {
  items: DemandRequest[];
  total: number;
  limit?: number | null;
  offset?: number | null;
  is_synthetic: boolean;
}

export interface CostEstimate {
  allocated_volume_kl: number;
  unit_supplier_price_per_kl: number;
  supplier_subtotal: number;
  distance_km?: number | null;
  transport_rate_per_kl_km?: number | null;
  is_transport_cost_known: boolean;
  transport_subtotal?: number | null;
  unit_transport_cost_per_kl?: number | null;
  total_delivered_cost?: number | null;
  delivered_cost_per_kl?: number | null;
  cost_components: string[];
  assumptions: string[];
}

export interface ImpactEstimate {
  allocated_volume_kl: number;
  substitution_ratio: number;
  potential_freshwater_displacement_kl: number;
  impact_lifecycle_stage: string;
  assumptions: string[];
}

export interface ProposedAllocationItem {
  candidate_id: string;
  listing_id: string;
  facility_id: string;
  demand_id: string;
  water_grade: WaterGrade;
  allocated_volume_kl: number;
  cost_estimate: CostEstimate;
  impact_estimate: ImpactEstimate;
  decision_reasons: string[];
  reason_codes: string[];
}

export interface RejectedCandidateItem {
  candidate_id: string;
  listing_id: string;
  demand_id: string;
  eligibility_status: EligibilityStatus;
  reason_codes: string[];
  human_reasons: string[];
  failed_quality_parameters: string[];
  unknown_quality_parameters: string[];
}

export interface DemandFulfillmentStatus {
  demand_id: string;
  facility_name: string;
  required_volume_kl: number;
  allocated_volume_kl: number;
  unfulfilled_volume_kl: number;
  fulfillment_percentage: number;
}

export interface SupplyUtilizationStatus {
  listing_id: string;
  listing_name: string;
  available_volume_kl: number;
  allocated_volume_kl: number;
  remaining_volume_kl: number;
  utilization_percentage: number;
}

export interface AllocationRunTotals {
  total_requested_volume_kl: number;
  total_available_volume_kl: number;
  total_allocated_volume_kl: number;
  total_unfulfilled_volume_kl: number;
  overall_fulfillment_rate: number;
  total_supplier_cost: number;
  total_delivered_cost?: number | null;
  is_delivered_cost_fully_known: boolean;
  total_potential_displacement_kl: number;
}

export interface AllocationRunRequest {
  demand_ids?: string[] | null;
  listing_ids?: string[] | null;
  substitution_ratio?: number;
  transport_rate_per_kl_km?: number | null;
}

export interface AllocationRunResponse {
  run_id: string;
  run_timestamp: string;
  status: string;
  algorithm_info: Record<string, string>;
  totals: AllocationRunTotals;
  proposed_allocations: ProposedAllocationItem[];
  rejected_candidates: RejectedCandidateItem[];
  demand_fulfillment: DemandFulfillmentStatus[];
  supply_utilization: SupplyUtilizationStatus[];
  assumptions: string[];
  disclaimer: string;
  is_synthetic: boolean;
}

export interface DeliveryRecord {
  id: string;
  allocation_candidate_id?: string | null;
  listing_id: string;
  demand_id: string;
  dispatched_volume_kl: number;
  delivered_volume_kl?: number | null;
  scheduled_date: string;
  delivery_mode: DeliveryMode;
  lifecycle_status: DeliveryLifecycleStatus;
  verification_status: VerificationStatus;
  is_synthetic: boolean;
  created_at: string;
  updated_at: string;
}

export interface DeliveryListResponse {
  items: DeliveryRecord[];
  total: number;
  limit?: number | null;
  offset?: number | null;
  is_synthetic: boolean;
}

export interface DeliveryCreateRequest {
  listing_id: string;
  demand_id: string;
  dispatched_volume_kl: number;
  scheduled_date: string;
  delivery_mode: DeliveryMode;
  allocation_candidate_id?: string | null;
}

export interface DeliveryStatusUpdateRequest {
  lifecycle_status: DeliveryLifecycleStatus;
  delivered_volume_kl?: number | null;
  notes?: string | null;
}

export interface ImpactSummaryResponse {
  potential_displacement_kl: number;
  accepted_estimated_displacement_kl: number;
  delivery_confirmed_displacement_kl: number;
  independently_verified_displacement_kl: number;
  total_active_proposals_count: number;
  total_accepted_allocations_count: number;
  total_completed_deliveries_count: number;
  is_independently_verified: boolean;
  freshwater_substitution_ratio_assumption: number;
  disclaimer: string;
  disclosures: string[];
  calculated_at: string;
  is_synthetic: boolean;
}

export interface HealthStatus {
  status: string;
  app_name: string;
  version: string;
  environment: string;
  timestamp: string;
  synthetic_data_mode: boolean;
}
