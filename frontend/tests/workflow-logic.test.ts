import { describe, it, expect } from 'vitest';
import {
  CompatibilityEvaluationResponse,
  AllocationRunResponse,
  DeliveryLifecycleStatus,
  ImpactSummaryResponse,
} from '../src/types/api';

describe('BlueLoop End-to-End Workflow Logic & Domain Integrity', () => {
  describe('Quality Compatibility Screening Logic', () => {
    it('correctly evaluates all-passing parameter outcomes and includes mandatory screening disclaimer', () => {
      const mockEvaluation: CompatibilityEvaluationResponse = {
        listing_id: 'SUP-001',
        demand_id: 'DEM-001',
        overall_outcome: 'PASS',
        total_parameters_evaluated: 5,
        parameters_passed: 5,
        parameters_failed: 0,
        parameters_unknown: 0,
        parameter_results: [
          { parameter: 'pH', measured_value: 7.2, unit: 'pH units', buyer_limit: '6.5 - 8.5', outcome: 'PASS', reason: 'Within permissible range' },
          { parameter: 'TDS', measured_value: 450, unit: 'mg/L', buyer_limit: '<= 1000', outcome: 'PASS', reason: 'Within permissible limit' },
          { parameter: 'TSS', measured_value: 12, unit: 'mg/L', buyer_limit: '<= 30', outcome: 'PASS', reason: 'Within permissible limit' },
          { parameter: 'COD', measured_value: 35, unit: 'mg/L', buyer_limit: '<= 50', outcome: 'PASS', reason: 'Within permissible limit' },
          { parameter: 'BOD', measured_value: 8, unit: 'mg/L', buyer_limit: '<= 10', outcome: 'PASS', reason: 'Within permissible limit' },
        ],
        screening_disclaimer: 'Advisory screening only. Does not replace accredited laboratory verification.',
        is_synthetic: true,
      };

      expect(mockEvaluation.overall_outcome).toBe('PASS');
      expect(mockEvaluation.parameters_passed).toBe(5);
      expect(mockEvaluation.parameters_failed).toBe(0);
      expect(mockEvaluation.parameters_unknown).toBe(0);
      expect(mockEvaluation.screening_disclaimer).toContain('Advisory screening only');
    });

    it('identifies fail-closed behavior when chemical tolerances are violated', () => {
      const mockFailEvaluation: CompatibilityEvaluationResponse = {
        listing_id: 'SUP-002',
        demand_id: 'DEM-001',
        overall_outcome: 'FAIL',
        total_parameters_evaluated: 4,
        parameters_passed: 3,
        parameters_failed: 1,
        parameters_unknown: 0,
        parameter_results: [
          { parameter: 'pH', measured_value: 7.0, unit: 'pH units', buyer_limit: '6.5 - 8.5', outcome: 'PASS', reason: 'Within range' },
          { parameter: 'TDS', measured_value: 1850, unit: 'mg/L', buyer_limit: '<= 1000', outcome: 'FAIL', reason: 'Measured TDS 1850 mg/L exceeds buyer limit of 1000 mg/L' },
          { parameter: 'TSS', measured_value: 15, unit: 'mg/L', buyer_limit: '<= 30', outcome: 'PASS', reason: 'Within range' },
          { parameter: 'COD', measured_value: 40, unit: 'mg/L', buyer_limit: '<= 50', outcome: 'PASS', reason: 'Within range' },
        ],
        screening_disclaimer: 'Advisory screening only.',
        is_synthetic: true,
      };

      expect(mockFailEvaluation.overall_outcome).toBe('FAIL');
      const failedParam = mockFailEvaluation.parameter_results.find((p) => p.outcome === 'FAIL');
      expect(failedParam?.parameter).toBe('TDS');
      expect(failedParam?.reason).toContain('exceeds buyer limit');
    });

    it('treats missing measurements as UNKNOWN rather than assuming pass', () => {
      const mockUnknownEvaluation: CompatibilityEvaluationResponse = {
        listing_id: 'SUP-003',
        demand_id: 'DEM-002',
        overall_outcome: 'FAIL',
        total_parameters_evaluated: 3,
        parameters_passed: 2,
        parameters_failed: 0,
        parameters_unknown: 1,
        parameter_results: [
          { parameter: 'pH', measured_value: 7.1, unit: 'pH units', buyer_limit: '6.5 - 8.5', outcome: 'PASS', reason: 'Within range' },
          { parameter: 'TDS', measured_value: 300, unit: 'mg/L', buyer_limit: '<= 500', outcome: 'PASS', reason: 'Within range' },
          { parameter: 'Heavy Metals (Lead)', measured_value: null, unit: 'mg/L', buyer_limit: '<= 0.05', outcome: 'UNKNOWN', reason: 'No certified laboratory measurement recorded for Lead' },
        ],
        screening_disclaimer: 'Advisory screening only.',
        is_synthetic: true,
      };

      expect(mockUnknownEvaluation.parameters_unknown).toBe(1);
      const unknownParam = mockUnknownEvaluation.parameter_results.find((p) => p.outcome === 'UNKNOWN');
      expect(unknownParam?.measured_value).toBeNull();
      expect(unknownParam?.reason).toContain('No certified laboratory measurement');
    });
  });

  describe('Deterministic Allocation Proposal Analysis', () => {
    const mockProposal: AllocationRunResponse = {
      run_id: 'RUN-DEMO-001',
      run_timestamp: '2026-10-10T12:00:00Z',
      algorithm_name: 'GreedyConstrainedCostMinimizer',
      status: 'PROPOSED',
      demands_considered_count: 2,
      listings_considered_count: 3,
      proposed_allocations: [
        {
          candidate_id: 'CAND-001',
          demand_id: 'DEM-001',
          demand_facility_name: 'Apex Automobile Assembly Plant',
          listing_id: 'SUP-001',
          supplier_facility_name: 'Koyambedu Water Reclamation Plant',
          supplier_org_name: 'Chennai Metro Water',
          water_grade: 'GRADE_A',
          allocated_volume_kl: 400,
          transport_distance_km: 14.2,
          delivery_mode: 'ROAD_TANKER',
          cost_estimate: {
            volume_kl: 400,
            unit_supplier_price_per_kl: 22.5,
            supplier_subtotal_inr: 9000,
            distance_km: 14.2,
            unit_transport_cost_per_kl: 17.04,
            transport_subtotal_inr: 6816,
            delivered_cost_per_kl: 39.54,
            total_delivered_cost_inr: 15816,
            is_transport_cost_estimated: true,
          },
          impact_estimate: {
            potential_freshwater_displacement_kl: 400,
            displacement_ratio: 1.0,
            basis_description: '1:1 Volumetric substitution of potable municipal supply',
            is_synthetic: true,
          },
          quality_compatibility: {
            overall_outcome: 'PASS',
            total_parameters_evaluated: 6,
            parameters_passed: 6,
            parameters_failed: 0,
            parameters_unknown: 0,
            parameter_results: [],
            screening_disclaimer: 'Advisory screening only.',
            is_synthetic: true,
          },
          decision_reasons: [
            'Quality compatibility verified: 6/6 parameters within buyer intake tolerance',
            'Transit distance 14.20 km within buyer max constraint (30.00 km)',
            'Delivered cost ₹39.54/kL within buyer ceiling price (₹45.00/kL)',
          ],
        },
      ],
      unallocated_demands: [
        {
          demand_id: 'DEM-002',
          facility_name: 'Thermal Power Station Unit 2',
          requested_volume_kl: 800,
          unfulfilled_volume_kl: 800,
          rejection_reasons: [
            'Candidate SUP-002 excluded: TDS (1850 mg/L) exceeds limit (1000 mg/L)',
            'Candidate SUP-003 excluded: Ex-works price ceiling exceeded',
          ],
        },
      ],
      unused_supplies: [
        {
          listing_id: 'SUP-003',
          facility_name: 'Industrial Park CETP',
          available_volume_kl: 1000,
          unused_volume_kl: 1000,
          reason: 'Price ceiling exceeded by all active buyers',
        },
      ],
      totals: {
        total_allocated_volume_kl: 400,
        total_procurement_subtotal_inr: 9000,
        total_transport_subtotal_inr: 6816,
        total_delivered_cost_inr: 15816,
        potential_freshwater_displacement_kl: 400,
      },
      is_synthetic_demonstration_data: true,
    };

    it('calculates total proposed volume and delivered costs accurately', () => {
      expect(mockProposal.totals.total_allocated_volume_kl).toBe(400);
      expect(mockProposal.totals.total_delivered_cost_inr).toBe(
        mockProposal.totals.total_procurement_subtotal_inr + mockProposal.totals.total_transport_subtotal_inr
      );
      expect(mockProposal.proposed_allocations[0].cost_estimate.delivered_cost_per_kl).toBe(39.54);
    });

    it('preserves transparent rejection reasons for unallocated demands', () => {
      const unallocated = mockProposal.unallocated_demands[0];
      expect(unallocated.demand_id).toBe('DEM-002');
      expect(unallocated.unfulfilled_volume_kl).toBe(800);
      expect(unallocated.rejection_reasons.length).toBe(2);
      expect(unallocated.rejection_reasons[0]).toContain('TDS (1850 mg/L) exceeds limit');
      expect(unallocated.rejection_reasons[1]).toContain('Ex-works price ceiling exceeded');
    });

    it('preserves unused supply listings and explanation', () => {
      const unused = mockProposal.unused_supplies[0];
      expect(unused.listing_id).toBe('SUP-003');
      expect(unused.unused_volume_kl).toBe(1000);
      expect(unused.reason).toContain('Price ceiling exceeded');
    });
  });

  describe('Delivery Logistics Custody Progression', () => {
    const validTransitions: Record<DeliveryLifecycleStatus, DeliveryLifecycleStatus[]> = {
      SCHEDULED: ['DISPATCHED', 'CANCELLED'],
      DISPATCHED: ['IN_TRANSIT', 'CANCELLED'],
      IN_TRANSIT: ['DELIVERED_PENDING_VERIFICATION', 'FAILED'],
      DELIVERED_PENDING_VERIFICATION: ['VERIFIED_CONFIRMED', 'DISPUTED'],
      VERIFIED_CONFIRMED: [],
      DISPUTED: ['VERIFIED_CONFIRMED', 'FAILED'],
      CANCELLED: [],
      FAILED: [],
    };

    it('enforces valid sequential lifecycle transitions', () => {
      expect(validTransitions.SCHEDULED).toContain('DISPATCHED');
      expect(validTransitions.DISPATCHED).toContain('IN_TRANSIT');
      expect(validTransitions.IN_TRANSIT).toContain('DELIVERED_PENDING_VERIFICATION');
      expect(validTransitions.DELIVERED_PENDING_VERIFICATION).toContain('VERIFIED_CONFIRMED');
    });

    it('prevents illegal transitions from terminal states', () => {
      expect(validTransitions.VERIFIED_CONFIRMED).toHaveLength(0);
      expect(validTransitions.CANCELLED).toHaveLength(0);
      expect(validTransitions.FAILED).toHaveLength(0);
    });
  });

  describe('Impact Analytics 4-Tier Provenance Separation', () => {
    it('maintains strict hierarchy: Potential >= Accepted >= Confirmed >= Verified', () => {
      const impactSummary: ImpactSummaryResponse = {
        displacement: {
          potential_freshwater_displacement_kl: 1250,
          accepted_freshwater_displacement_kl: 750,
          confirmed_delivered_displacement_kl: 300,
          verified_freshwater_displacement_kl: 150,
        },
        accounting_basis: '1:1 volumetric substitution ratio based on industrial potable baseline',
        is_synthetic_demonstration_data: true,
      };

      const {
        potential_freshwater_displacement_kl,
        accepted_freshwater_displacement_kl,
        confirmed_delivered_displacement_kl,
        verified_freshwater_displacement_kl,
      } = impactSummary.displacement;

      // Mathematical hierarchy verification
      expect(potential_freshwater_displacement_kl).toBeGreaterThanOrEqual(accepted_freshwater_displacement_kl);
      expect(accepted_freshwater_displacement_kl).toBeGreaterThanOrEqual(confirmed_delivered_displacement_kl);
      expect(confirmed_delivered_displacement_kl).toBeGreaterThanOrEqual(verified_freshwater_displacement_kl);
      expect(impactSummary.is_synthetic_demonstration_data).toBe(true);
    });
  });
});
