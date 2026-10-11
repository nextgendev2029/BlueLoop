# BlueLoop Data Model Specification

## 1. Domain Entities Architecture (Stage 2 Implemented)

BlueLoop models the full water reuse lifecycle through strongly typed, validated domain models implemented in `backend/app/models/entities.py`.

```
+--------------------------+       1:N       +-----------------------------+
|       Organisation       | --------------< |       SupplierFacility      |
| (Supplier / Buyer / Admin) |                 | (CETP / STP / WWTP)         |
+--------------------------+                 +-----------------------------+
             |                                              | 1:N
             | 1:N                                          v
+--------------------------+                 +-----------------------------+
|      DemandRequest       |                 |        SupplyListing        |
|  - Required Volume (kL)  |                 |  - Available Volume (kL)    |
|  - Quality Limits        |                 |  - Price per kL             |
+--------------------------+                 |  - Quality Measurements     |
             |                               +-----------------------------+
             |                                              |
             +----------------------+-----------------------+
                                    |
                                    v Evaluated by QualityCompatibilityService
             +---------------------------------------------+
             |            CompatibilityDecision            |
             |  - is_eligible: bool                        |
             |  - parameter_results: [ParameterResult]     |
             |  - screening disclaimer                     |
             +---------------------------------------------+
                                    |
                                    v Planned Allocation Engine
             +---------------------------------------------+
             |             AllocationCandidate             |
             |  - Proposed Volume (kL)                     |
             |  - Delivered Cost per kL                    |
             +---------------------------------------------+
                                    |
                                    v Planned Delivery & Audit
             +---------------------------------------------+
             |        DeliveryRecord & AuditEvent          |
             +---------------------------------------------+
```

---

## 2. Implemented Entity Schemas & Explicit Units

### 2.1 Organisation & User
- **`Organisation`**:
  - `id`: str (e.g. `SYNTH-ORG-01`)
  - `name`: str
  - `org_type`: `OrgType` (`SUPPLIER`, `BUYER`, `PLATFORM_OPERATOR`)
  - `verification_status`: `VerificationStatus` (`UNVERIFIED`, `PENDING_REVIEW`, `VERIFIED_DEMO`, `CERTIFIED`)
  - `is_synthetic`: bool (default `True` for demonstration integrity)
  - `created_at`: UTC datetime
- **`User`**:
  - `id`: str, `org_id`: str, `name`: str, `email`: str, `role`: str, `created_at`: UTC datetime

### 2.2 SupplierFacility
Represents a physical treatment facility or industrial discharge source.
- `id`: str (e.g. `SYNTH-FAC-01`)
- `org_id`: str (Foreign key to Organisation)
- `name`: str (Facility designation)
- `facility_type`: `FacilityType` (`CETP`, `INDUSTRIAL_STP`, `MANUFACTURING_WWTP`, `MUNICIPAL_TERTIARY`)
- `city`: str, `state`: str
- `latitude`: Optional[float] ([-90.0, 90.0])
- `longitude`: Optional[float] ([-180.0, 180.0])
- `coordinates_synthetic`: bool (default `True`)
- `verification_status`: `VerificationStatus`
- `contact_email`: Optional[str], `contact_phone`: Optional[str]
- `is_synthetic`: bool (`True`)
- `created_at`: UTC datetime, `updated_at`: UTC datetime

### 2.3 WaterQualityMeasurements & QualityEvidence
> **MISSING MEASUREMENTS POLICY**:
> Missing chemical and physical measurements are strictly represented as `None` (`UNKNOWN`).
> Missing values are **never treated as zero** and **never treated as passing results**.
- **`WaterQualityMeasurements`**:
  - `ph`: Optional[float] - Standard pH scale [0.0 – 14.0]
  - `tds_mg_l`: Optional[float] - Total Dissolved Solids in **milligrams per litre (mg/L)**
  - `cod_mg_l`: Optional[float] - Chemical Oxygen Demand in **mg/L**
  - `bod_mg_l`: Optional[float] - Biochemical Oxygen Demand in **mg/L**
  - `tss_mg_l`: Optional[float] - Total Suspended Solids in **mg/L**
  - `turbidity_ntu`: Optional[float] - Nephelometric Turbidity Units (**NTU**)
  - `heavy_metals_pass`: Optional[bool] - Binary toxicology certificate (pass/fail)
- **`QualityEvidence`**:
  - `id`: str, `facility_id`: Optional[str], `listing_id`: Optional[str]
  - `measured_at`: UTC datetime
  - `evidence_type`: `EvidenceType` (`CERTIFIED_LAB_REPORT`, `INLINE_SENSOR_TELEMETRY`, `SELF_REPORTED`)
  - `verification_status`: `VerificationStatus`
  - `lab_name`: Optional[str], `lab_accreditation`: Optional[str] (e.g. NABL / ISO 17025)
  - `measurements`: `WaterQualityMeasurements`

### 2.4 SupplyListing
Represents an available volume of treated water.
- `id`: str (e.g. `SYNTH-LIST-01`)
- `facility_id`: str
- `name`: str
- `water_grade`: `WaterGrade` (`RO_PERMEATE`, `TERTIARY_POLISHED`, `SECONDARY_CLARIFIED`, `INDUSTRIAL_RECYCLED`)
- `available_volume_kl`: float - Available volume in **kilolitres (kL)**, strictly > 0
- `price_per_kl`: float - Ex-works price per kilolitre, strictly &ge; 0
- `available_from`: UTC datetime, `available_until`: Optional[UTC datetime]
- `delivery_radius_km`: Optional[float] - Maximum logistics radius in **kilometres (km)**
- `quality_evidence_status`: `VerificationStatus`
- `quality_evidence_id`: Optional[str]
- `measurements`: Optional[WaterQualityMeasurements]
- `status`: `ListingStatus` (`ACTIVE`, `COMMITTED`, `PAUSED`, `EXPIRED`)
- `is_synthetic`: bool (`True`)

### 2.5 DemandRequest & QualityLimits
Represents commercial intake specifications.
- **`QualityLimits`**:
  - `min_ph`: Optional[float], `max_ph`: Optional[float] (Enforces `min_ph <= max_ph`)
  - `max_tds_mg_l`: Optional[float] (mg/L)
  - `max_cod_mg_l`: Optional[float] (mg/L)
  - `max_bod_mg_l`: Optional[float] (mg/L)
  - `max_tss_mg_l`: Optional[float] (mg/L)
  - `max_turbidity_ntu`: Optional[float] (NTU)
  - `require_heavy_metals_pass`: bool (default `True`)
  - `required_parameters`: list[str] - Mandatory parameter names that cannot be missing
- **`DemandRequest`**:
  - `id`: str (e.g. `SYNTH-DEM-01`)
  - `org_id`: str
  - `facility_name`: str
  - `intended_use`: `IntendedUse` (`COOLING_TOWER`, `BOILER_FEED`, `INDUSTRIAL_PROCESS`, `CONSTRUCTION_BATCHING`, `LANDSCAPE_IRRIGATION`, `NON_POTABLE_FLUSHING`)
  - `required_volume_kl`: float - Required intake volume in **kilolitres (kL)**, strictly > 0
  - `max_price_per_kl`: Optional[float] (&ge; 0)
  - `total_budget`: Optional[float]
  - `max_distance_km`: Optional[float]
  - `quality_limits`: `QualityLimits`
  - `status`: `DemandStatus` (`OPEN`, `ALLOCATED`, `PARTIALLY_ALLOCATED`, `CANCELLED`)

### 2.6 Decision & Audit Models
- **`CompatibilityDecision`**:
  - `is_eligible`: bool
  - `decision_summary`: str
  - `parameter_results`: list[`ParameterEvaluationResult`] (`parameter_name`, `measured_value`, `unit`, `buyer_min`, `buyer_max`, `status`, `reason`)
  - `failed_parameters`: list[str]
  - `unknown_parameters`: list[str]
  - `disclaimer`: Screening disclaimer
- **`AllocationCandidate`** & **`AllocationRun`**: Foundations for Stage 3 allocation engine.
- **`DeliveryRecord`** & **`AuditEvent`**: Foundations for custody lifecycle and immutable event tracking.

---

## 3. Storage Assumptions & Implementation Status

| Component | Stage 2 Reality | Target Cloud Architecture |
| :--- | :--- | :--- |
| **Persistence Mechanism** | **In-Memory Thread-Safe Repositories** (`InMemoryRepository[T]`) | Amazon DynamoDB Single-Table Design (`blueloop-core`) |
| **Data Lifecycle** | Reset and re-seeded on app restart via `seed_demonstration_data()` | Persistent AWS DynamoDB partition strategy |
| **Integrity & Mutability** | Repositories return deep model copies preventing accidental in-memory mutation | ACID transactions & conditional writes |
| **Authentication & Users** | Minimal domain representations (no fake auth or false claims) | Amazon Cognito User Pools |
| **Document Storage** | Metadata references (`QualityEvidence.lab_accreditation`) | Amazon S3 encrypted buckets (`blueloop-quality-docs`) |
