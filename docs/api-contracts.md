# BlueLoop API Contracts Specification

## 1. Overview & Protocol Standards
BlueLoop exposes a standardized RESTful API over HTTP/JSON.
- **Base URL (Local)**: `http://localhost:8000/api/v1`
- **Data Format**: `application/json; charset=utf-8`
- **Date/Time Standard**: ISO 8601 UTC timestamps (e.g., `2026-01-10T10:30:00Z`)
- **Error Format Standard**: RFC 7807 compliant error object structure

```json
{
  "error": "ErrorTypeIdentifier",
  "message": "Human-readable explanation of error condition",
  "details": {},
  "path": "/api/v1/requested-path"
}
```

---

## 2. Implemented Endpoints (Stage 4 Operational Status)

### 2.1 System Health Check
- **Method**: `GET /api/v1/health`
- **Status Code**: `200 OK`
- **Response**: `HealthResponse` (`status`, `app_name`, `version`, `environment`, `timestamp`, `synthetic_data_mode`)

### 2.2 List Supplier Facilities
- **Method**: `GET /api/v1/suppliers`
- **Query Parameters**:
  - `city` (optional, string): Filter by municipal city (e.g. `Chennai`)
  - `state` (optional, string): Filter by state or administrative region (e.g. `Tamil Nadu`)
  - `facility_type` (optional, `FacilityType`): `CETP`, `INDUSTRIAL_STP`, `MANUFACTURING_WWTP`, `MUNICIPAL_TERTIARY`
  - `verification_status` (optional, string): `VERIFIED`, `PENDING_AUDIT`, `REJECTED`
  - `limit` (optional, int, default: 50, range: 1..100): Maximum results to return
  - `offset` (optional, int, default: 0, range: >= 0): Number of records to skip
- **Status Code**: `200 OK`
- **Response**: `SupplierListResponse` (`items: [SupplierFacilityResponse]`, `total: int`, `limit: int`, `offset: int`, `is_synthetic: bool`)

### 2.3 Get Supplier Facility Detail
- **Method**: `GET /api/v1/suppliers/{facility_id}`
- **Status Code**: `200 OK` (or `404 Not Found`)
- **Response**: `SupplierFacilityResponse`

### 2.4 List Supply Batches
- **Method**: `GET /api/v1/supplies`
- **Query Parameters**:
  - `water_grade` (optional, `WaterGrade`): `RO_PERMEATE`, `TERTIARY_POLISHED`, `SECONDARY_CLARIFIED`, `INDUSTRIAL_RECYCLED`
  - `status` (optional, string): `AVAILABLE`, `ALLOCATED`, `EXPIRED`, `DELIVERED`
  - `quality_evidence_status` (optional, string): `VALIDATED`, `PENDING_REVIEW`, `FLAGGED`, `REJECTED`
  - `min_volume_kl` (optional, float &ge; 0): Minimum available volume in kilolitres
  - `max_price_per_kl` (optional, float &ge; 0): Maximum unit price per kilolitre
  - `limit` (optional, int, default: 50, range: 1..100): Maximum results to return
  - `offset` (optional, int, default: 0, range: >= 0): Number of records to skip
- **Status Code**: `200 OK`
- **Response**: `SupplyListResponse` (`items: [SupplyListingResponse]`, `total: int`, `limit: int`, `offset: int`, `is_synthetic: bool`)

### 2.5 Get Supply Batch Detail
- **Method**: `GET /api/v1/supplies/{listing_id}`
- **Status Code**: `200 OK` (or `404 Not Found`)
- **Response**: `SupplyListingResponse`

### 2.6 List Buyer Demand Requests
- **Method**: `GET /api/v1/demands`
- **Query Parameters**:
  - `intended_use` (optional, `IntendedUse`): `COOLING_TOWER`, `BOILER_FEED`, `INDUSTRIAL_PROCESS`, `CONSTRUCTION_BATCHING`, etc.
  - `status` (optional, `DemandStatus`): `OPEN`, `ALLOCATED`, `PARTIALLY_ALLOCATED`, `CANCELLED`
  - `max_distance_km` (optional, float &ge; 0): Maximum accepted logistics transit radius in km
  - `limit` (optional, int, default: 50, range: 1..100): Maximum results to return
  - `offset` (optional, int, default: 0, range: >= 0): Number of records to skip
- **Status Code**: `200 OK`
- **Response**: `DemandListResponse` (`items: [DemandRequestResponse]`, `total: int`, `limit: int`, `offset: int`, `is_synthetic: bool`)

### 2.7 Get Demand Request Detail
- **Method**: `GET /api/v1/demands/{demand_id}`
- **Status Code**: `200 OK` (or `404 Not Found`)
- **Response**: `DemandRequestResponse`

### 2.8 Evaluate Deterministic Quality Compatibility
- **Method**: `POST /api/v1/compatibility/evaluate`
- **Request Body**: `CompatibilityEvaluationRequest`
  - Either (`listing_id` and `demand_id`)
  - Or (`custom_measurements` and `custom_limits`)
- **Status Code**: `200 OK` (or `400 Bad Request` if invalid arguments, `404 Not Found` if entity missing)
- **Response**: `CompatibilityEvaluationResponse`:
```json
{
  "listing_id": "SYNTH-LIST-01",
  "demand_id": "SYNTH-DEM-01",
  "is_eligible": true,
  "decision_summary": "Eligible: All 7 evaluated parameters satisfy buyer tolerance limits.",
  "parameter_results": [
    {
      "parameter_name": "Hydrogen-Ion Concentration (pH)",
      "measured_value": 7.35,
      "unit": "pH scale",
      "buyer_min": 6.5,
      "buyer_max": 8.5,
      "status": "PASS",
      "reason": "pH 7.35 satisfies required range [6.5 – 8.5]."
    },
    {
      "parameter_name": "Total Dissolved Solids (TDS)",
      "measured_value": 980.0,
      "unit": "mg/L",
      "buyer_min": null,
      "buyer_max": 1200.0,
      "status": "PASS",
      "reason": "Total Dissolved Solids (TDS) of 980.0 mg/L satisfies threshold <= 1200.0 mg/L (buffer: 220.0 mg/L, 18.3% safety margin)."
    }
  ],
  "failed_parameters": [],
  "unknown_parameters": [],
  "disclaimer": "BlueLoop Screening Tool Notice: This evaluation compares supplied laboratory measurements against buyer-specified boundaries. It does not certify regulatory compliance, plant process fitness, or guarantee water safety.",
  "evaluated_at": "2026-01-10T10:30:00Z",
  "is_synthetic": true
}
```

### 2.9 Execute Deterministic Allocation Run
- **Method**: `POST /api/v1/allocations/run`
- **Status Code**: `200 OK`
- **Request Body**: `AllocationRunRequest` (optional)
```json
{
  "demand_ids": ["SYNTH-DEM-01", "SYNTH-DEM-02"],
  "listing_ids": ["SYNTH-LIST-01", "SYNTH-LIST-02"],
  "substitution_ratio": 1.0,
  "transport_rate_per_kl_km": 0.015
}
```
- **Response**: `AllocationRunResponse`:
```json
{
  "run_id": "RUN-20261011030000-A1B2C3",
  "run_timestamp": "2026-10-11T03:00:00Z",
  "status": "PROPOSED",
  "algorithm_info": {
    "name": "BlueLoop Deterministic Constrained Allocation Solver",
    "version": "1.0.0",
    "strategy": "Deterministic Constrained Prioritization (Lowest Unit Cost & Distance)"
  },
  "totals": {
    "total_requested_volume_kl": 4500.0,
    "total_available_volume_kl": 7700.0,
    "total_allocated_volume_kl": 4500.0,
    "total_unfulfilled_volume_kl": 0.0,
    "overall_fulfillment_rate": 100.0,
    "total_supplier_cost": 4125.0,
    "total_delivered_cost": 5580.45,
    "is_delivered_cost_fully_known": true,
    "total_potential_displacement_kl": 4500.0
  },
  "proposed_allocations": [
    {
      "candidate_id": "CAND-SYNTH-LIST-01-SYNTH-DEM-01",
      "listing_id": "SYNTH-LIST-01",
      "facility_id": "SYNTH-FAC-01",
      "demand_id": "SYNTH-DEM-01",
      "water_grade": "TERTIARY_POLISHED",
      "allocated_volume_kl": 3000.0,
      "cost_estimate": {
        "allocated_volume_kl": 3000.0,
        "unit_supplier_price_per_kl": 0.78,
        "supplier_subtotal": 2340.0,
        "distance_km": 29.64,
        "transport_rate_per_kl_km": 0.015,
        "is_transport_cost_known": true,
        "transport_subtotal": 1333.80,
        "unit_transport_cost_per_kl": 0.44,
        "total_delivered_cost": 3673.80,
        "delivered_cost_per_kl": 1.22
      },
      "impact_estimate": {
        "allocated_volume_kl": 3000.0,
        "substitution_ratio": 1.0,
        "potential_freshwater_displacement_kl": 3000.0,
        "impact_lifecycle_stage": "POTENTIAL_PROPOSED"
      },
      "decision_reasons": [
        "Water-quality screening passed: all required chemical and physical limits satisfied.",
        "Allocated 3,000.0 kL based on available supplier capacity and buyer intake demand.",
        "Ex-works price: 0.78/kL.",
        "One-way transport distance: 29.6 km (within buyer limit)."
      ],
      "reason_codes": [
        "QUALITY_ELIGIBLE",
        "CAPACITY_CONSTRAINTS_SATISFIED",
        "PRIORITY_COST_OPTIMIZED"
      ]
    }
  ],
  "rejected_candidates": [],
  "demand_fulfillment": [],
  "supply_utilization": [],
  "assumptions": [
    "Freshwater substitution ratio modeled at 1.00 per kL of treated water.",
    "Logistics transport tariff modeled at 0.0150/kL-km where distances are known.",
    "Algorithm strictly excludes pairs violating quality constraints or with missing required laboratory evidence.",
    "Supply volumes are allocated under linear capacity constraints without double-counting."
  ],
  "disclaimer": "BlueLoop Allocation Screening Tool Notice: Proposed allocations represent screened compatibility matches and mathematical volume sharing. They do not constitute binding legal contracts, regulatory water safety certification, or confirmed physical delivery.",
  "is_synthetic": true
}
```

### 2.10 Inspect Allocation Run Detail
- **Method**: `GET /api/v1/allocations/{run_id}`
- **Status Code**: `200 OK` (or `404 Not Found`)
- **Response**: `AllocationRunResponse`

### 2.11 List Stored Allocation Runs
- **Method**: `GET /api/v1/allocations`
- **Query Parameters**:
  - `limit` (optional, int, default: 50, range: 1..100): Maximum results to return
  - `offset` (optional, int, default: 0, range: >= 0): Number of records to skip
- **Status Code**: `200 OK`
- **Response**: `List[AllocationRunResponse]`

### 2.12 Accept Allocation Proposal
- **Method**: `POST /api/v1/allocations/{run_id}/accept`
- **Status Code**: `200 OK` (or `404 Not Found`, `400 Bad Request` if invalid transition)
- **Behavior**: Transitions run status to `ACCEPTED`. Records immutable `AuditEvent`. Rejects transitions if run was previously `REJECTED`.
- **Response**: `AllocationRunResponse`

### 2.13 Reject Allocation Proposal
- **Method**: `POST /api/v1/allocations/{run_id}/reject`
- **Status Code**: `200 OK` (or `404 Not Found`, `400 Bad Request` if invalid transition)
- **Behavior**: Transitions run status to `REJECTED`. Records immutable `AuditEvent`. Rejects transitions if run was previously `ACCEPTED`.
- **Response**: `AllocationRunResponse`

### 2.14 List Delivery Records
- **Method**: `GET /api/v1/deliveries`
- **Query Parameters**:
  - `allocation_candidate_id` (optional, string): Filter by originating allocation candidate ID
  - `status` (optional, `DeliveryLifecycleStatus`): `SCHEDULED`, `DISPATCHED`, `IN_TRANSIT`, `DELIVERED_SAMPLE_PENDING`, `ACCEPTED_CONFIRMED`, `REJECTED_QUALITY_FAILURE`
  - `limit` (optional, int, default: 50, range: 1..100): Maximum results to return
  - `offset` (optional, int, default: 0, range: >= 0): Number of records to skip
- **Status Code**: `200 OK`
- **Response**: `DeliveryListResponse` (`items: [DeliveryRecordResponse]`, `total: int`, `limit: int`, `offset: int`, `is_synthetic: bool`)

### 2.15 Get Delivery Record Detail
- **Method**: `GET /api/v1/deliveries/{id}`
- **Status Code**: `200 OK` (or `404 Not Found`)
- **Response**: `DeliveryRecordResponse`

### 2.16 Schedule Delivery Dispatch
- **Method**: `POST /api/v1/deliveries`
- **Status Code**: `201 Created` (or `400 Bad Request`, `422 Unprocessable Entity`)
- **Request Body**: `DeliveryCreateRequest`
```json
{
  "allocation_candidate_id": "CAND-SYNTH-LIST-01-SYNTH-DEM-01",
  "listing_id": "SYNTH-LIST-01",
  "demand_id": "SYNTH-DEM-01",
  "volume_kl": 500.0,
  "transport_vehicle_identifier": "TN-04-W-4821",
  "driver_contact": "+91-98400-12345",
  "scheduled_dispatch_time": "2026-01-12T08:00:00Z",
  "source_facility_id": "SYNTH-FAC-01",
  "destination_facility_id": "BUYER-PLANT-01",
  "notes": "Direct insulated stainless tanker dispatch"
}
```
- **Response**: `DeliveryRecordResponse`

### 2.17 Update Delivery Custody Lifecycle Status
- **Method**: `PATCH /api/v1/deliveries/{id}/status`
- **Status Code**: `200 OK` (or `400 Bad Request` if invalid transition, `404 Not Found`)
- **Lifecycle Transition Rules**:
  - `SCHEDULED` &rarr; `DISPATCHED`
  - `DISPATCHED` &rarr; `IN_TRANSIT`
  - `IN_TRANSIT` &rarr; `DELIVERED_SAMPLE_PENDING`
  - `DELIVERED_SAMPLE_PENDING` &rarr; `ACCEPTED_CONFIRMED` or `REJECTED_QUALITY_FAILURE`
  - Terminal statuses (`ACCEPTED_CONFIRMED`, `REJECTED_QUALITY_FAILURE`) cannot be modified.
- **Request Body**: `DeliveryStatusUpdateRequest`
```json
{
  "status": "DISPATCHED",
  "verification_notes": "Departed terminal gate following pre-fill valve inspection.",
  "testing_lab_reference": "LAB-GATE-2026-0041"
}
```
- **Response**: `DeliveryRecordResponse`

### 2.18 Get Environmental Impact Summary
- **Method**: `GET /api/v1/impact/summary`
- **Status Code**: `200 OK`
- **Response**: `ImpactSummaryResponse`
```json
{
  "potential_displacement_kl": 6500.0,
  "accepted_estimated_displacement_kl": 4500.0,
  "delivery_confirmed_displacement_kl": 1250.0,
  "independently_verified_displacement_kl": 0.0,
  "active_allocations_count": 2,
  "active_deliveries_count": 3,
  "displacement_accounting_policy": "BlueLoop Certified Accounting Policy: Potential displacement represents proposed matches. Accepted displacement represents agreed allocations pending physical transfer. Confirmed displacement represents verified physical receipt under valid custody transfer.",
  "disclaimer": "BlueLoop Impact Accounting Notice: Displacement quantities represent computed volume equivalences under modeled substitution ratios. Independent ESG certification requires third-party metering accreditation.",
  "is_synthetic": true,
  "generated_at": "2026-10-11T03:30:00Z"
}
```

---

## 3. Planned Endpoints (Scheduled for Subsequent Stages)

> **STATUS NOTE:**
> Entity creation and historical ledger queries are planned for Stage 5 and beyond.

### 3.1 Entity Registration Endpoints (Planned)
- `POST /api/v1/suppliers`: Register a new treatment plant.
- `POST /api/v1/supplies`: Register a new water batch with laboratory certificate.
- `POST /api/v1/demands`: Submit a buyer demand request.

### 3.2 Historical Audit Trail (Planned)
- `GET /api/v1/audit/events`: Retrieve immutable chronological ledger of screening and allocation decisions.
