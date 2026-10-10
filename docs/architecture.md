# BlueLoop System Architecture Document

## 1. Executive Summary & Core Philosophy
**BlueLoop** is a Water Reuse Intelligence and Procurement Optimisation Platform designed for the *Heat and Water* environmental track. The platform facilitates direct water reuse between industrial effluent producers (suppliers) and commercial water consumers (buyers).

The core technical philosophy of BlueLoop is **deterministic explainability**:
- Water quality compliance is verified via explicit mathematical rules against codified standards.
- Allocation matching solves supply-demand optimization deterministically without relying on probabilistic black-box generative AI models for critical engineering constraints.
- Every match or rejection decision is accompanied by a transparent audit trail.

---

## 2. Layered Architecture (Stage 2 Implementation)

```
+---------------------------------------------------------------------------------------+
|                                    CLIENT TIER                                        |
|   React 18 SPA (TypeScript + Vite + Tailwind CSS + Lucide Icons)                       |
|   - Editorial Dashboard (Regional Balance & Architecture Flow)                        |
|   - Deterministic Quality Gatekeeper Inspector                                        |
|   - Allocation Comparison & Ledger Preview                                            |
+-------------------------------------------+-------------------------------------------+
                                            | HTTPS / REST
                                            v
+---------------------------------------------------------------------------------------+
|                                  API & ROUTING TIER                                   |
|   FastAPI Application (Python 3.11)                                                   |
|   - app.api.v1.endpoints: suppliers, supplies, demands, compatibility, allocations, deliveries, impact, health
|   - app.schemas: Pydantic v2 Request & Response Contract Models                       |
+-------------------------------------------+-------------------------------------------+
                                            |
                                            v
+---------------------------------------------------------------------------------------+
|                           CORE INTELLIGENCE ENGINE TIER                               |
|   app.services.allocation_engine: AllocationEngine                                    |
|   - app.services.candidate: CandidateEvaluator (Feasibility Gates)                    |
|   - app.services.quality: QualityCompatibilityService (Fail-Closed Quality Screening) |
|   - app.services.geo: GeoDistanceCalculator (Haversine Logistics Distance)            |
|   - app.services.cost: CostCalculator (Verified Ex-Works vs Estimated Logistics)      |
|   - app.services.impact: ImpactCalculator (Freshwater Displacement Accounting)        |
+-------------------------------------------+-------------------------------------------+
                                            |
                                            v
+---------------------------------------------------------------------------------------+
|                                 REPOSITORIES & STORAGE                                |
|   Local Reality: In-Memory Thread-Safe Repositories (app.repositories.memory)         |
|   - OrganisationRepository, SupplierFacilityRepository, SupplyListingRepository       |
|   - DemandRequestRepository, QualityEvidenceRepository, AllocationProposalRepository |
|   - DeliveryRecordRepository, AuditEventRepository                                    |
|   - Mutation-isolated model copying (deep copies)                                     |
|   - Seeded via app.core.seeds.seed_demonstration_data()                               |
|                                                                                       |
|   Target AWS Production Architecture (Planned for Deployment):                        |
|   - Amazon DynamoDB Single-Table Design (`blueloop-core`)                             |
|   - Amazon S3 Encrypted Document Store (`blueloop-quality-docs`)                      |
|   - AWS Lambda Runtime via Mangum ASGI Adapter                                        |
+-------------------------------------------+-------------------------------------------+
```

---

## 3. Tier Responsibilities

### 3.1 Domain & Entity Models (`app/models/`)
- Encapsulates core business entities: `Organisation`, `SupplierFacility`, `SupplyListing`, `DemandRequest`, `QualityEvidence`, `WaterQualityMeasurements`, `QualityLimits`, `AllocationCandidate`, `AllocationRun`, `DeliveryRecord`, `AuditEvent`.
- Enforces strict data types, explicit physical units (`_kl`, `_mg_l`, `_ntu`, `_km`), and validation invariants (e.g. `min_ph <= max_ph`, volume > 0, price &ge; 0).

### 3.2 Quality Compatibility Service (`app/services/quality.py`)
- Independent, deterministic business service.
- Evaluates candidate measurements against buyer limits across physical and chemical thresholds.
- Treats missing required values as `UNKNOWN`, refusing to certify compliance on unmeasured data (fail-closed).
- Generates parameter-by-parameter reason strings with quantitative buffer margins.

### 3.3 Core Allocation Intelligence Engine (`app/services/allocation_engine.py`)
- **Deterministic Feasibility Screening**: Filters candidate pairs through operational status, positive volume, geographic range (`haversine_distance_km`), ex-works price ceilings, and lab-certified water quality parameters.
- **Constrained Volume Allocation**: Enforces linear capacity boundaries ensuring total allocated volume per listing never exceeds available supply (preventing double counting of scarce effluent across competing buyers).
- **Logistics & Cost Breakdown**: Accurately computes ex-works supplier subtotal and transport charges. When coordinates are missing, marks transport cost as unknown rather than fabricating zero freight charges.
- **Environmental Displacement Metric**: Calculates potential virgin freshwater displacement with rigorous validation ($0.0 \le \text{ratio} \le 1.0$).
- **Explainability & Decision Audit**: Produces machine-readable reason codes (`QUALITY_ELIGIBLE`, `SUPPLY_CAPACITY_EXHAUSTED`, `DISTANCE_EXCEEDED`, etc.) and human-readable audit explanations for every accepted or rejected candidate.
- **Solver Characterization & Limitations**: Uses deterministic greedy constrained prioritization (optimizing delivered unit cost, transport distance, and batch volume with stable ID tie-breaking). Guarantees exact constraint satisfaction and reproducibility; may produce slight sub-optimality compared to global mixed-integer programming on non-linear multi-echelon network flows.

### 3.4 In-Memory Repository Abstraction (`app/repositories/`)
- Generic `IRepository[T]` interface isolating persistence mechanics from business logic.
- `InMemoryRepository[T]` uses thread-safe dictionaries with deep copying, preventing in-memory mutations.
- Enables complete test isolation and rapid local execution without cloud or database dependencies.
- Standardized CRUD interface makes future migration to Amazon DynamoDB straightforward.

---

## 4. Implementation Status Matrix

| Component | Architecture Role | Status | Verification |
| :--- | :--- | :--- | :--- |
| **Frontend Shell & UI** | React 18 SPA, Navigation, Nature-Inspired Luxury UI | **Implemented** | TypeScript & Vite Build Passing |
| **Backend API Core** | FastAPI Application & API v1 Router | **Implemented** | 65 Automated Tests Passing |
| **Domain Models & Enums** | Core Data Entities & Validations | **Implemented** | Unit & Invariant Tests Passing |
| **Compatibility Service** | Deterministic Quality Screening (Fail-Closed) | **Implemented** | Quality Suite Passing |
| **Allocation Engine** | Constrained Optimizer, Cost & Impact Engine | **Implemented** | Allocation & Scarcity Tests Passing |
| **Allocation API** | `POST /allocations/run`, `GET /allocations/{id}`, accept/reject | **Implemented** | API Integration Tests Passing |
| **Delivery Tracking API** | Custody lifecycle tracking (`GET`, `POST`, `PATCH /deliveries`) | **Implemented** | Lifecycle Progression Tests Passing |
| **Impact Analytics API** | Multi-tier displacement reporting (`GET /impact/summary`) | **Implemented** | Accounting Policy Tests Passing |
| **In-Memory Repository** | Thread-Safe Local Data Layer & Seed Fixtures | **Implemented** | Deep Copy Isolation Passing |
| **AWS Cloud Infrastructure** | API Gateway, Lambda, DynamoDB, S3 | *Planned (Stage 5)* | Infrastructure as Code |
