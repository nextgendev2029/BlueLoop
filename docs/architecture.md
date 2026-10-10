# BlueLoop System Architecture Document

## 1. Executive Summary & Purpose
**BlueLoop** is a Water Reuse Intelligence and Procurement Optimisation Platform designed for the *Heat and Water* environmental track. The platform addresses industrial freshwater exhaustion by enabling direct, certified water reuse between industrial effluent producers (suppliers) and commercial water consumers (buyers).

The core technical philosophy of BlueLoop is **deterministic explainability**:
- Water quality compliance is verified via explicit mathematical rules against codified standards.
- Allocation matching solves supply-demand optimization deterministically without relying on probabilistic black-box generative AI models for critical engineering constraints.
- Every match or rejection decision is accompanied by a transparent audit trail.

---

## 2. High-Level System Architecture

```
+---------------------------------------------------------------------------------------+
|                                    CLIENT TIER                                        |
|                                                                                       |
|   React 18 SPA (TypeScript + Vite + Tailwind CSS + Lucide Icons)                       |
|   - Buyer Portal (Demand Requests, Threshold Tolerances, Match Inspection)            |
|   - Supplier Portal (Listing Management, Volume Availability, Lab Certs)              |
|   - Operations & Audit Dashboard (Allocation Traces, Delivery Verification)           |
+-------------------------------------------+-------------------------------------------+
                                            | HTTPS / REST
                                            v
+---------------------------------------------------------------------------------------+
|                                  API & COMPUTE TIER                                   |
|                                                                                       |
|   Amazon API Gateway (REST API Routes, Throttling, CORS, Auth Validation)             |
|                                           |                                           |
|                                           v                                           |
|   AWS Lambda Compute (Python 3.11 + FastAPI via Mangum ASGI Adapter)                  |
|   +-------------------------------------------------------------------------------+   |
|   | app.core (Settings, CORS, Security)                                           |   |
|   | app.api.v1 (Endpoints & Input Validation)                                      |   |
|   | app.services.quality (Deterministic Water Quality Verification Engine)        |   |
|   | app.services.allocation (Constrained Supply Allocation Optimizer)             |   |
|   | app.services.impact (Freshwater Displacement & Economic Delta Calculator)     |   |
|   +-------------------------------------------------------------------------------+   |
+------------------------------------+--------------+-----------------------------------+
                                     |              |
                                     v              v
+---------------------------------------------------+-----------------------------------+
|                                   DATA & STORAGE TIER                                 |
|                                                                                       |
|   Amazon DynamoDB (Single-Table Design)           Amazon S3 Buckets                   |
|   - PK/SK Partition Strategy                      - Quality Lab Test PDF Certs        |
|   - Suppliers, Demands, Allocations, Deliveries   - Static SPA Distribution (CloudFront)
+---------------------------------------------------------------------------------------+
```

---

## 3. Tier Responsibilities

### 3.1 Frontend Tier (Single Page Application)
- **Framework**: React 18 with TypeScript and Vite bundler.
- **Styling**: Restrained enterprise B2B styling utilizing Tailwind CSS (slate/warm-neutral base with deep teal accents).
- **Navigation**: Client-side routing via React Router DOM (`/`, `/suppliers`, `/demands`, `/allocations`, `/deliveries`, `/impact`, `/settings`).
- **State & Service Layer**: Typed fetch clients (`src/lib/api.ts`) communicating with the backend REST endpoints.
- **Operational Safety**: Prominent UI indicators ensuring users clearly distinguish synthetic development data from verified real-world operational records.

### 3.2 API & Business Logic Tier (FastAPI + AWS Lambda)
- **Framework**: FastAPI (Python 3.11) with Pydantic v2 schemas for strict contract validation.
- **Serverless Adapter**: Mangum ASGI handler translating AWS API Gateway events to FastAPI requests without modification of native ASGI code.
- **Quality Engine (`QualityValidationService`)**:
  - Deterministic evaluation of water quality parameters: pH, Total Dissolved Solids (TDS), Chemical Oxygen Demand (COD), Biochemical Oxygen Demand (BOD), Total Suspended Solids (TSS), Turbidity, Heavy Metals.
  - Fail-closed validation: If any single parameter violates buyer tolerance, the candidate match is rejected.
- **Allocation Engine (`AllocationService`)**:
  - Solves the multi-supplier to multi-buyer supply allocation problem.
  - Objective: Maximize freshwater displacement while minimizing transport distances and delivered cost under capacity limits.
- **Impact Accounting (`DisplacementCalculationService`)**:
  - Explicit arithmetic computation of virgin freshwater saved (kL/day, annualized displacement).
  - Net economic difference calculation against regional municipal water tariffs.

### 3.3 Data & Storage Tier (Target Architecture)
- **Amazon DynamoDB**: Single-table design (`blueloop-core`) storing multi-entity items:
  - `SUPPLIER#<id>`: Supplier profiles and facility capabilities.
  - `LISTING#<id>`: Available water batches and chemical parameters.
  - `DEMAND#<id>`: Buyer water specifications and volume requests.
  - `ALLOCATION#<id>`: Optimized allocation results and constraint logs.
  - `DELIVERY#<id>`: Custody transfer and delivery receipts.
- **Amazon S3**:
  - `blueloop-web-frontend`: Hosting built frontend assets behind Amazon CloudFront.
  - `blueloop-quality-docs`: Immutable storage for certified laboratory test reports and chain-of-custody transfer receipts.

---

## 4. Implementation Status Matrix

| Component | Architecture Role | Current Status (Initialisation) | Next Milestone |
| :--- | :--- | :--- | :--- |
| **Frontend Shell** | React SPA, Navigation, Shell Layout | **Implemented & Verified** | Feature Forms & Grids |
| **Backend Core** | FastAPI App, Settings, Health API | **Implemented & Verified** | Quality & Allocation Engine |
| **Lambda Adapter** | Mangum ASGI bridge | **Configured in main.py** | Packaging & SAM/CDK template |
| **Quality Engine** | Parameter Threshold Validation | Planned (Interface defined) | Unit tests & Standard limits |
| **Allocation Solver** | Constrained Supply Optimizer | Planned (Interface defined) | Multi-facility solver |
| **DynamoDB Store** | Single-table persistence | Planned (Schema defined) | Repository implementation |
| **Amazon S3 Docs** | Lab report document store | Planned (Schema defined) | Presigned URL upload API |
