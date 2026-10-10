import { describe, it, expect, vi, afterEach } from 'vitest';
import { fetchHealth } from '../src/services/health';
import {
  fetchSuppliers,
  fetchSupplierById,
  fetchSupplies,
  fetchSupplyById,
} from '../src/services/suppliers';
import { fetchDemands, fetchDemandById } from '../src/services/demands';
import { evaluateCompatibility } from '../src/services/compatibility';
import {
  runAllocation,
  fetchAllocations,
  fetchAllocationById,
  acceptAllocationProposal,
  rejectAllocationProposal,
} from '../src/services/allocations';
import {
  fetchDeliveries,
  fetchDeliveryById,
  createDelivery,
  updateDeliveryStatus,
} from '../src/services/deliveries';
import { fetchImpactSummary } from '../src/services/impact';

describe('BlueLoop Domain Services API Contracts', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  describe('Health Service', () => {
    it('fetchHealth requests /api/v1/health', async () => {
      let requestedUrl = '';
      globalThis.fetch = vi.fn().mockImplementation(async (url: string) => {
        requestedUrl = url;
        return new Response(
          JSON.stringify({
            status: 'healthy',
            service: 'BlueLoop API',
            version: '0.1.0',
            synthetic_mode: true,
          }),
          { status: 200 }
        );
      });

      const res = await fetchHealth();
      expect(requestedUrl).toBe('/api/v1/health');
      expect(res.status).toBe('healthy');
      expect(res.synthetic_mode).toBe(true);
    });
  });

  describe('Suppliers and Supplies Service', () => {
    it('fetchSuppliers requests /api/v1/suppliers with filter parameters', async () => {
      let requestedUrl = '';
      globalThis.fetch = vi.fn().mockImplementation(async (url: string) => {
        requestedUrl = url;
        return new Response(JSON.stringify({ items: [], total: 0 }), { status: 200 });
      });

      await fetchSuppliers({
        city: 'Chennai',
        facility_type: 'SEWAGE_TREATMENT_PLANT',
        verification_status: 'VERIFIED_DEMO',
        limit: 10,
        offset: 0,
      });

      expect(requestedUrl).toBe(
        '/api/v1/suppliers?city=Chennai&facility_type=SEWAGE_TREATMENT_PLANT&verification_status=VERIFIED_DEMO&limit=10&offset=0'
      );
    });

    it('fetchSupplierById requests /api/v1/suppliers/:id', async () => {
      let requestedUrl = '';
      globalThis.fetch = vi.fn().mockImplementation(async (url: string) => {
        requestedUrl = url;
        return new Response(JSON.stringify({ id: 'FAC-001', facility_name: 'Plant A' }), { status: 200 });
      });

      const supplier = await fetchSupplierById('FAC-001');
      expect(requestedUrl).toBe('/api/v1/suppliers/FAC-001');
      expect(supplier.id).toBe('FAC-001');
    });

    it('fetchSupplies requests /api/v1/supplies with water grade and limit', async () => {
      let requestedUrl = '';
      globalThis.fetch = vi.fn().mockImplementation(async (url: string) => {
        requestedUrl = url;
        return new Response(JSON.stringify({ items: [], total: 0 }), { status: 200 });
      });

      await fetchSupplies({ water_grade: 'GRADE_A', min_volume_kl: 100, limit: 20 });
      expect(requestedUrl).toBe('/api/v1/supplies?water_grade=GRADE_A&min_volume_kl=100&limit=20');
    });

    it('fetchSupplyById requests /api/v1/supplies/:id', async () => {
      let requestedUrl = '';
      globalThis.fetch = vi.fn().mockImplementation(async (url: string) => {
        requestedUrl = url;
        return new Response(JSON.stringify({ id: 'SUP-001', water_grade: 'GRADE_A' }), { status: 200 });
      });

      const supply = await fetchSupplyById('SUP-001');
      expect(requestedUrl).toBe('/api/v1/supplies/SUP-001');
      expect(supply.id).toBe('SUP-001');
    });
  });

  describe('Demands Service', () => {
    it('fetchDemands requests /api/v1/demands with filters', async () => {
      let requestedUrl = '';
      globalThis.fetch = vi.fn().mockImplementation(async (url: string) => {
        requestedUrl = url;
        return new Response(JSON.stringify({ items: [], total: 0 }), { status: 200 });
      });

      await fetchDemands({ intended_use: 'COOLING_TOWER', status: 'OPEN', limit: 15 });
      expect(requestedUrl).toBe('/api/v1/demands?intended_use=COOLING_TOWER&status=OPEN&limit=15');
    });

    it('fetchDemandById requests /api/v1/demands/:id', async () => {
      let requestedUrl = '';
      globalThis.fetch = vi.fn().mockImplementation(async (url: string) => {
        requestedUrl = url;
        return new Response(JSON.stringify({ id: 'DEM-001', required_volume_kl: 500 }), { status: 200 });
      });

      const demand = await fetchDemandById('DEM-001');
      expect(requestedUrl).toBe('/api/v1/demands/DEM-001');
      expect(demand.id).toBe('DEM-001');
    });
  });

  describe('Quality Compatibility Service', () => {
    it('evaluateCompatibility executes POST /api/v1/compatibility/evaluate with payload', async () => {
      let requestedUrl = '';
      let requestMethod = '';
      let requestBody = '';

      globalThis.fetch = vi.fn().mockImplementation(async (url: string, options?: RequestInit) => {
        requestedUrl = url;
        requestMethod = options?.method || '';
        requestBody = options?.body as string;
        return new Response(
          JSON.stringify({
            overall_outcome: 'PASS',
            total_parameters_evaluated: 6,
            parameters_passed: 6,
            parameters_failed: 0,
            parameters_unknown: 0,
            screening_disclaimer: 'Advisory screening only.',
          }),
          { status: 200 }
        );
      });

      const payload = {
        listing_id: 'SUP-001',
        demand_id: 'DEM-001',
      };

      const result = await evaluateCompatibility(payload);
      expect(requestedUrl).toBe('/api/v1/compatibility/evaluate');
      expect(requestMethod).toBe('POST');
      expect(JSON.parse(requestBody)).toEqual(payload);
      expect(result.overall_outcome).toBe('PASS');
    });
  });

  describe('Allocation Engine Service', () => {
    it('runAllocation executes POST /api/v1/allocations/run', async () => {
      let requestedUrl = '';
      let requestMethod = '';
      let requestBody = '';

      globalThis.fetch = vi.fn().mockImplementation(async (url: string, options?: RequestInit) => {
        requestedUrl = url;
        requestMethod = options?.method || '';
        requestBody = options?.body as string;
        return new Response(
          JSON.stringify({
            run_id: 'RUN-12345',
            status: 'PROPOSED',
            proposed_allocations: [],
            totals: { total_allocated_volume_kl: 100 },
          }),
          { status: 200 }
        );
      });

      const reqPayload = { demand_ids: ['DEM-001'] };
      const res = await runAllocation(reqPayload);

      expect(requestedUrl).toBe('/api/v1/allocations/run');
      expect(requestMethod).toBe('POST');
      expect(JSON.parse(requestBody)).toEqual(reqPayload);
      expect(res.run_id).toBe('RUN-12345');
      expect(res.status).toBe('PROPOSED');
    });

    it('fetchAllocations requests GET /api/v1/allocations with limit and offset', async () => {
      let requestedUrl = '';
      globalThis.fetch = vi.fn().mockImplementation(async (url: string) => {
        requestedUrl = url;
        return new Response(JSON.stringify([]), { status: 200 });
      });

      await fetchAllocations(10, 20);
      expect(requestedUrl).toBe('/api/v1/allocations?limit=10&offset=20');
    });

    it('fetchAllocationById requests GET /api/v1/allocations/:id', async () => {
      let requestedUrl = '';
      globalThis.fetch = vi.fn().mockImplementation(async (url: string) => {
        requestedUrl = url;
        return new Response(JSON.stringify({ run_id: 'RUN-ABC' }), { status: 200 });
      });

      const res = await fetchAllocationById('RUN-ABC');
      expect(requestedUrl).toBe('/api/v1/allocations/RUN-ABC');
      expect(res.run_id).toBe('RUN-ABC');
    });

    it('acceptAllocationProposal executes POST /api/v1/allocations/:id/accept', async () => {
      let requestedUrl = '';
      let requestMethod = '';

      globalThis.fetch = vi.fn().mockImplementation(async (url: string, options?: RequestInit) => {
        requestedUrl = url;
        requestMethod = options?.method || '';
        return new Response(JSON.stringify({ run_id: 'RUN-ABC', status: 'ACCEPTED' }), { status: 200 });
      });

      const res = await acceptAllocationProposal('RUN-ABC');
      expect(requestedUrl).toBe('/api/v1/allocations/RUN-ABC/accept');
      expect(requestMethod).toBe('POST');
      expect(res.status).toBe('ACCEPTED');
    });

    it('rejectAllocationProposal executes POST /api/v1/allocations/:id/reject', async () => {
      let requestedUrl = '';
      let requestMethod = '';

      globalThis.fetch = vi.fn().mockImplementation(async (url: string, options?: RequestInit) => {
        requestedUrl = url;
        requestMethod = options?.method || '';
        return new Response(JSON.stringify({ run_id: 'RUN-ABC', status: 'REJECTED' }), { status: 200 });
      });

      const res = await rejectAllocationProposal('RUN-ABC');
      expect(requestedUrl).toBe('/api/v1/allocations/RUN-ABC/reject');
      expect(requestMethod).toBe('POST');
      expect(res.status).toBe('REJECTED');
    });
  });

  describe('Deliveries Logistics Service', () => {
    it('fetchDeliveries requests GET /api/v1/deliveries with params', async () => {
      let requestedUrl = '';
      globalThis.fetch = vi.fn().mockImplementation(async (url: string) => {
        requestedUrl = url;
        return new Response(JSON.stringify({ items: [], total: 0 }), { status: 200 });
      });

      await fetchDeliveries({ status: 'IN_TRANSIT', limit: 10 });
      expect(requestedUrl).toBe('/api/v1/deliveries?status=IN_TRANSIT&limit=10');
    });

    it('createDelivery executes POST /api/v1/deliveries with valid payload', async () => {
      let requestedUrl = '';
      let requestMethod = '';
      let requestBody = '';

      globalThis.fetch = vi.fn().mockImplementation(async (url: string, options?: RequestInit) => {
        requestedUrl = url;
        requestMethod = options?.method || '';
        requestBody = options?.body as string;
        return new Response(
          JSON.stringify({ id: 'DEL-001', status: 'SCHEDULED', planned_volume_kl: 100 }),
          { status: 201 }
        );
      });

      const createPayload = {
        allocation_candidate_id: 'CAND-001',
        planned_volume_kl: 100,
        delivery_mode: 'ROAD_TANKER' as const,
        vehicle_or_pipeline_identifier: 'TN-01-AX-9999',
        driver_or_operator_name: 'R. Kumar',
        scheduled_dispatch_time: new Date().toISOString(),
      };

      const res = await createDelivery(createPayload);
      expect(requestedUrl).toBe('/api/v1/deliveries');
      expect(requestMethod).toBe('POST');
      expect(JSON.parse(requestBody)).toEqual(createPayload);
      expect(res.id).toBe('DEL-001');
      expect(res.status).toBe('SCHEDULED');
    });

    it('updateDeliveryStatus executes PATCH /api/v1/deliveries/:id/status', async () => {
      let requestedUrl = '';
      let requestMethod = '';
      let requestBody = '';

      globalThis.fetch = vi.fn().mockImplementation(async (url: string, options?: RequestInit) => {
        requestedUrl = url;
        requestMethod = options?.method || '';
        requestBody = options?.body as string;
        return new Response(
          JSON.stringify({ id: 'DEL-001', status: 'DISPATCHED' }),
          { status: 200 }
        );
      });

      const patchPayload = {
        status: 'DISPATCHED' as const,
        notes: 'Loaded at facility gate',
      };

      const res = await updateDeliveryStatus('DEL-001', patchPayload);
      expect(requestedUrl).toBe('/api/v1/deliveries/DEL-001/status');
      expect(requestMethod).toBe('PATCH');
      expect(JSON.parse(requestBody)).toEqual(patchPayload);
      expect(res.status).toBe('DISPATCHED');
    });
  });

  describe('Impact Analytics Service', () => {
    it('fetchImpactSummary requests GET /api/v1/impact/summary', async () => {
      let requestedUrl = '';
      globalThis.fetch = vi.fn().mockImplementation(async (url: string) => {
        requestedUrl = url;
        return new Response(
          JSON.stringify({
            displacement: {
              potential_freshwater_displacement_kl: 1500,
              accepted_freshwater_displacement_kl: 500,
              confirmed_delivered_displacement_kl: 200,
              verified_freshwater_displacement_kl: 150,
            },
            accounting_basis: '1:1 volumetric substitution ratio',
            is_synthetic_demonstration_data: true,
          }),
          { status: 200 }
        );
      });

      const res = await fetchImpactSummary();
      expect(requestedUrl).toBe('/api/v1/impact/summary');
      expect(res.displacement.potential_freshwater_displacement_kl).toBe(1500);
      expect(res.displacement.verified_freshwater_displacement_kl).toBe(150);
      expect(res.is_synthetic_demonstration_data).toBe(true);
    });
  });
});
