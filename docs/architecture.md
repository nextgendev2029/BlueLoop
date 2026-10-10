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
|   - app.api.v1.endpoints: suppliers, supplies, demands, compatibility, health        |
|   - app.schemas: Pydantic v2 Request & Response Contract Models                       |
+-------------------------------------------+-------------------------------------------+
                                            |
                                            v
+---------------------------------------------------------------------------------------+
|                                 DOMAIN SERVICES TIER                                  |
|   app.services.quality: QualityCompatibilityService                                    |
|   - Parameter-by-parameter constraint evaluation (pH, TDS, COD, BOD, TSS, Turbidity)  |
|   - Missing measurement = UNKNOWN policy                                              |
|   - Strict linear safety margins & screening disclaimer                               |
+-------------------------------------------+-------------------------------------------+
                                            |
                                            v
+---------------------------------------------------------------------------------------+
|                                 REPOSITORIES & STORAGE                                |
|   Local Stage 2 Reality: In-Memory Thread-Safe Repositories (app.repositories.memory) |
|   - OrganisationRepository, SupplierFacilityRepository, SupplyListingRepository       |
|   - DemandRequestRepository, QualityEvidenceRepository                                |
|   - Mutation-isolated model copying (deep copies)                                     |
|   - Seeded via app.core.seeds.seed_demonstration_data()                               |
|                                                                                       |
|   Target AWS Production Architecture (Planned for Deployment):                        |
|   - Amazon DynamoDB Single-Table Design (`blueloop-core`)                             |
|   - Amazon S3 Encrypted Document Store (`blueloop-quality-docs`)                      |
|   - AWS Lambda Runtime via Mangum ASGI Adapter                                        |
+---------------------------------------------------------------------------------------+
```

---

## 3. Tier Responsibilities

### 3.1 Domain & Entity Models (`app/models/`)
- Encapsulates core business entities: `Organisation`, `SupplierFacility`, `SupplyListing`, `DemandRequest`, `QualityEvidence`, `WaterQualityMeasurements`, `QualityLimits`, `AllocationCandidate`, `DeliveryRecord`, `AuditEvent`.
- Enforces strict data types, explicit physical units (`_kl`, `_mg_l`, `_ntu`, `_km`), and validation invariants (e.g. `min_ph <= max_ph`, volume > 0, price &ge; 0).

### 3.2 Quality Compatibility Service (`app/services/quality.py`)
- Independent, deterministic business service.
- Evaluates candidate measurements against buyer limits.
- Treats missing required values as `UNKNOWN`, refusing to certify compliance on missing data.
- Generates parameter-by-parameter reason strings with quantitative buffer margins.

### 3.3 In-Memory Repository Abstraction (`app/repositories/`)
- Generic `IRepository[T]` interface isolating persistence mechanics from business logic.
- `InMemoryRepository[T]` uses thread-safe dictionaries with deep copying, preventing in-memory mutations.
- Enables complete test isolation and rapid local execution without cloud or database dependencies.
- Standardized CRUD interface makes future migration to Amazon DynamoDB straightforward.

---

## 4. Implementation Status Matrix

| Component | Architecture Role | Stage 2 Status | Next Milestone |
| :--- | :--- | :--- | :--- |
| **Frontend Shell & UI** | React 18 SPA, Navigation, Editorial Design | **Implemented & Verified** | Interactive Form Mutations |
| **Backend API Core** | FastAPI Application & Router | **Implemented & Verified** | Mutation Endpoints |
| **Domain Models & Enums** | Core Data Entities & Validations | **Implemented & Verified** | Stage 3 Persistence Schema |
| **Compatibility Service** | Deterministic Quality Screening | **Implemented & Verified** | Multi-Parameter Rule Enhancements |
| **In-Memory Repository** | Thread-Safe Local Data Layer | **Implemented & Verified** | DynamoDB Single-Table Adapter |
| **Synthetic Seed Fixtures** | Reproducible Hackathon Baseline | **Implemented & Verified** | Expanded Regional Fixtures |
| **Allocation Solver** | Multi-Facility Constrained Optimizer | *Planned (Phase 3)* | Linear Programming Implementation |
| **AWS Cloud Infrastructure** | API Gateway, Lambda, DynamoDB, S3 | *Planned (Phase 5)* | Infrastructure as Code (SAM/CDK) |
