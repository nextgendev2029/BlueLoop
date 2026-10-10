# BlueLoop Phased Development Plan

## 1. Plan Overview
This document outlines the sequential engineering phases for developing BlueLoop from repository initialisation through to full AWS deployment.

---

## 2. Phase Breakdown

### Phase 1: Repository Foundation & Architectural Baseline
**Current Status: Completed (Master Prompt 01)**
- [x] Workspace inspection and clean directory monorepo layout.
- [x] Frontend foundation: React 18, TypeScript, Vite, React Router, Lucide icons, restrained styling.
- [x] Application shell: responsive sidebar, top bar, placeholder routes (`/`, `/suppliers`, `/demands`, `/allocations`, `/deliveries`, `/impact`, `/settings`).
- [x] Backend foundation: Python 3.11, FastAPI, Pydantic v2 configuration, CORS, Mangum ASGI Lambda handler.
- [x] Health check endpoint `GET /api/v1/health` with automated tests (`pytest`).
- [x] Environment template (`.env.example`) and comprehensive `.gitignore`.
- [x] Architectural documentation (`architecture.md`, `api-contracts.md`, `data-model.md`, `development-plan.md`).

---

### Phase 2: Core Engineering Engine (Quality & Allocation)
**Target: Master Prompt 02**
- [ ] Define standardized water quality parameter models and industrial reuse threshold matrices.
- [ ] Implement deterministic `QualityValidationService`:
  - Parameter-by-parameter evaluation (pH, TDS, COD, BOD, TSS, Turbidity).
  - Explicit explanation generator outputting delta margins and failure reasons.
- [ ] Implement `AllocationService`:
  - Multi-facility capacity-constrained matching algorithm.
  - Haversine distance calculation for road tanker delivery costs.
- [ ] Implement `DisplacementCalculationService`:
  - Freshwater displacement volume calculation.
  - Municipal water cost savings versus delivered reuse water cost.
- [ ] Implement comprehensive automated unit and property-based test suites for all deterministic math.

---

### Phase 3: Domain Data Layer & Synthetic Seed Fixtures
**Target: Master Prompt 03**
- [ ] Build synthetic dataset fixtures adhering strictly to the synthetic data policy (`data/`):
  - 10+ realistic industrial treated effluent suppliers across industrial clusters.
  - 15+ diverse commercial water buyers (cooling towers, construction, manufacturing).
  - Certified laboratory testing parameter mock documents.
- [ ] Implement repository persistence layer (in-memory mock store transitioning to Amazon DynamoDB).
- [ ] Expose REST API endpoints for Suppliers, Demands, Matching, and Impact.

---

### Phase 4: Frontend Feature Implementation & User Workflows
**Target: Master Prompt 04**
- [ ] Build Supplier Management views:
  - Interactive water quality certificate inspection.
  - Available volume listings and treatment stage filters.
- [ ] Build Buyer Demand Portal:
  - Water intake specification builder with tolerance sliders.
- [ ] Build Allocation & Intelligence Console:
  - Run matching solver with live constraint visualization.
  - Explainability modal displaying exact pass/fail reasons per parameter.
- [ ] Build Impact & ESG Reporting Dashboard:
  - Interactive freshwater displacement charts.
  - Cost savings vs municipal freshwater comparison.

---

### Phase 5: AWS Cloud Deployment & Production Hardening
**Target: Master Prompt 05**
- [ ] Prepare Infrastructure-as-Code (AWS SAM / CDK / Terraform).
- [ ] Provision Amazon DynamoDB single-table schema with primary indexes.
- [ ] Provision Amazon S3 buckets with encryption and CORS policies.
- [ ] Package FastAPI backend for AWS Lambda execution.
- [ ] Deploy Amazon API Gateway with Lambda integration.
- [ ] Deploy Amazon CloudFront distribution serving static React SPA from S3.
- [ ] Execute end-to-end integration smoke tests against live AWS endpoints.
- [ ] Prepare hackathon submission walkthrough and live demonstration environment.
