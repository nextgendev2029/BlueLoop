# BlueLoop: Water Reuse Intelligence & Procurement Optimisation Platform

[![Platform](https://img.shields.io/badge/Platform-BlueLoop-0f766e.svg)](https://github.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](LICENSE)
[![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%7C%20TypeScript%20%7C%20Vite-blue.svg)](frontend/)
[![Backend](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.11-emerald.svg)](backend/)
[![Tests](https://img.shields.io/badge/Tests-139%20Passed-forest.svg)]()
[![Track](https://img.shields.io/badge/Hackathon%20Track-Heat%20%26%20Water-orange.svg)]()

> **Environmental Hacks / AWS Bharat Builds Tour Hackathon**  
> **Track:** Heat and Water  
> **Deployment Approach:** Ship It - Pre-Deployment Validated on Amazon Web Services (AWS) Architecture

---

## 1. What is BlueLoop?

**BlueLoop** is a Water Reuse Intelligence and Procurement Optimisation Platform that connects certified treated-water suppliers with commercial water consumers, evaluates chemical compatibility using deterministic gatekeeping rules, solves multi-facility allocation optimization, estimates delivered transport tariffs, and maintains auditable 4-tier freshwater displacement accounting.

### The Environmental Problem Addressed
Industrial clusters, data centers, district cooling plants, and infrastructure projects consume millions of kilolitres of potable municipal water and extract critical groundwater reserves daily. Simultaneously, industrial Common Effluent Treatment Plants (CETPs) and sewage treatment units produce high-grade treated effluent that is discharged into natural bodies instead of recirculating into productive industrial loops.

The primary barriers to industrial water reuse are:
1. **Chemical Uncertainty & Equipment Risk**: Industrial consumers cannot risk scaling, fouling, or heat-exchanger degradation from mismatched water quality.
2. **Logistics & Tariff Friction**: Sourcing treated effluent historically relies on ad-hoc arrangements with opaque transport costs.
3. **Greenwashing Risk & Accounting Opacity**: Corporate sustainability declarations cannot withstand third-party audits without auditable provenance tiers.

### Core Value Proposition
BlueLoop resolves this through **deterministic, explainable engineering logic**:
- **Strict Fail-Closed Gatekeeper**: Parameter checks against codified tolerances; missing measurements evaluate to `UNKNOWN` and fail closed.
- **Constrained Allocation Solver**: Minimizes unit costs and Haversine transport distances while respecting facility capacities.
- **4-Tier Provenance Accounting**: Distinguishes modeled potential displacement from metered deliveries and third-party verified outcomes.

---

## 2. Implemented Roles & Capabilities

BlueLoop provides role-based access control (RBAC) and organisation-level multi-tenant isolation across three core actor profiles:

### 1. Industrial Buyer (e.g. Apex Hyperscale Data Center Campus)
- **Supply Discovery**: Browse active treated-effluent listings and certified chemical profiles.
- **Demand Requests**: Publish intake requirements and parameter tolerances (pH, TDS, TSS, COD, BOD).
- **Optimization Console**: Trigger deterministic matching and review candidate compatibility traces.
- **Proposal Acceptance**: Review cost breakdowns and accept/reject allocation proposals.
- **Delivery Oversight**: Monitor physical transfers and meter logs across receiving docks.
- **Impact Accounting**: Track verified displacement metrics with clear calculation baselines.

### 2. Effluent Producer / Supplier (e.g. Maraimalai Clean Tech Industrial Park)
- **Facility & Supply Management**: Register treatment plants and publish batch listings with lab evidence.
- **Open Market Discovery**: Discover open buyer demand requests across the regional cluster.
- **Tenant Isolation**: Protected from viewing private or closed competitor demand records.
- **Dispatch Tracking**: Manage proposal commitments and log custody transfer receipts.

### 3. Platform Operations Administrator
- **Operational Oversight**: Platform-wide metrics, regional balance, and transaction history.
- **Tenant Management**: Inspect and manage registered organizations and active user accounts.
- **Audit Trails**: Inspect cryptographic logs, API health, and system security events.

---

## 3. Technology Stack

### Frontend Application
- **Runtime & Bundler**: Vite 5.x
- **Framework**: React 18.x
- **Language**: TypeScript 5.x
- **Routing & Guards**: React Router DOM 6.x with custom `PublicRoute` and `ProtectedRoute` navigation guards
- **3D & Motion**: Three.js (Photographic industrial landscape overlay with telemetry beacons and vapor particles)
- **Styling**: Tailwind CSS 3.4 (Restrained editorial palette: canvas white, slate neutral, deep ocean, and river cyan)
- **Icons**: Lucide React
- **Test Framework**: Vitest 2.x (54 unit, component, and route-guard tests)

### Backend Service
- **Runtime**: Python 3.11+
- **API Framework**: FastAPI 0.110+
- **Security & Cryptography**: PBKDF2-HMAC-SHA256 password hashing, bearer session tokens, tenant-isolated data access
- **Data Validation**: Pydantic v2 & Pydantic-Settings
- **Local Persistence**: Thread-safe SQLite repository layer with synthetic seed fixtures
- **Serverless Adapter**: Mangum ASGI adapter for AWS Lambda
- **Test Framework**: Pytest 8.x with HTTPX TestClient (85 security, domain, and API tests)

### Target AWS Cloud Architecture (Prepared for Deployment)
- **Amazon CloudFront**: Global edge CDN with Origin Access Control (OAC) and SPA routing fallbacks.
- **Amazon S3**: Secure static SPA hosting and encrypted quality document storage.
- **Amazon API Gateway**: HTTP API routing with automatic CORS preflight handling.
- **AWS Lambda**: Serverless Python 3.11 runtime on Graviton2 (`arm64`) executing FastAPI via Mangum.
- **Amazon CloudWatch**: Centralized operational logging with 7-day retention.
- **AWS SAM**: Complete infrastructure template packaged and lint-validated in `infra/template.yaml`.

*(Note: In accordance with hackathon resource safety protocols, live billable AWS resources have not been created. All deployment bundles and IaC templates are validated via dry-run).*

---

## 4. Repository Structure

```
blueloop/
├── frontend/                     # React 18 + TypeScript + Vite Application
│   ├── public/                   # Static assets & photographic landscape references
│   ├── src/
│   │   ├── components/           # UI components, Three.js scenes, modals, and route guards
│   │   │   ├── common/           # BlueLoop logo, gatekeeper cards, status badges
│   │   │   ├── landing/          # Hero water scene, how-it-works, scroll-scrubbed impact ledger
│   │   │   ├── ProtectedRoute.tsx # Route guard redirecting unauthenticated users to /login
│   │   │   └── PublicRoute.tsx   # Route guard redirecting authenticated users to /app/dashboard
│   │   ├── context/              # AuthContext (session state, quick-demo logins, tenant info)
│   │   ├── layouts/              # AppLayout (role-aware sidebar without public links)
│   │   ├── pages/                # Route pages (Landing, Login, Signup, Dashboard, Suppliers, Demands, Allocations, Deliveries, Impact, Settings)
│   │   ├── services/             # Typed API services for all platform capabilities
│   │   └── App.tsx               # Router configuration and guarded route hierarchy
│   ├── tests/                    # Vitest regression suite (54 passed tests)
│   └── package.json              # Frontend manifest & scripts
├── backend/                      # FastAPI Python 3.11 Application
│   ├── app/
│   │   ├── api/v1/               # REST API endpoints (auth, suppliers, demands, allocations, deliveries, impact, health)
│   │   ├── core/                 # Settings, security hashing, CORS, and synthetic seed fixtures
│   │   ├── db/                   # SQLite persistence and tenant session management
│   │   ├── models/               # Domain entity models (Organisation, Facility, Listing, Demand, Proposal)
│   │   ├── repositories/         # Repository abstractions with tenant isolation
│   │   ├── schemas/              # Pydantic request and response schemas
│   │   ├── services/             # Optimization solver, compatibility screener, impact calculator
│   │   └── main.py               # FastAPI entry point & Mangum Lambda handler
│   ├── tests/                    # Pytest test suite (85 passed tests)
│   └── requirements.txt          # Python dependencies
├── data/                         # Synthetic data policy and documentation
├── docs/                         # Engineering specifications, demo runbook, architecture guides
│   ├── demo-runbook.md           # 10-step hackathon demo presentation sequence
│   ├── deployment-handoff.md     # Pre-deployment architecture, AWS IAM, and checklist
│   ├── architecture.md           # System architecture blueprint
│   └── api-contracts.md          # REST API contracts
├── infra/                        # Infrastructure-as-Code definitions
│   ├── template.yaml             # Validated AWS SAM serverless cloud formation template
│   └── README.md                 # Cloud architecture specification
├── scripts/                      # Automation scripts (verify.sh, deploy.sh)
├── .env.example                  # Safe environment variable template
├── .gitignore                    # Secrets, build outputs, and runtime exclusions
└── README.md                     # Platform overview & developer guide
```

---

## 5. Prerequisites

- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- **Python**: v3.11.x or higher
- **AWS SAM CLI**: (Optional, for deployment template validation)

---

## 6. Getting Started & Local Development

### 6.1 Environment Configuration
Create a local `.env` configuration from the provided template:
```bash
cp .env.example .env
```

### 6.2 Backend Setup & Execution
1. Navigate to the backend directory and activate the virtual environment:
   ```bash
   cd backend
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```
2. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
3. Verify the backend health endpoint:
   ```bash
   curl http://localhost:8000/api/v1/health
   ```
   Interactive OpenAPI documentation is available at: `http://localhost:8000/docs`

### 6.3 Frontend Setup & Execution
1. In a separate terminal, navigate to the frontend directory:
   ```bash
   cd frontend
   npm install
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to: `http://localhost:5173`

---

## 7. Demo Account Access

For convenience during hackathon evaluation, the login page (`/login`) includes 1-click sandbox access buttons with verified tenant permissions:

| Actor Role | Preloaded Account Name | Tenant Organisation | Intended Exploration Path |
| :--- | :--- | :--- | :--- |
| **Industrial Buyer** | Apex Facilities Lead | Apex Hyperscale Data Center Campus | Demand creation, allocation solver, proposal review, impact reporting |
| **Effluent Supplier** | Maraimalai Plant Director | Maraimalai Clean Tech Industrial Park | Supply listings, open market demand discovery, dispatch logging |
| **Platform Administrator** | System Administrator | BlueLoop Platform Operations | User administration, regional balance monitoring, cross-tenant audit |

*(Note: Authenticated sessions are strictly prevented from viewing the public marketing landing page; logging out cleanly restores public access).*

---

## 8. Running Automated Verifications

BlueLoop includes multi-layer automated verification covering unit tests, security regression, typechecking, and production builds:

```bash
# 1. Run full verification script
./scripts/verify.sh

# 2. Or run individual suites independently:
# Backend pytest suite (85 tests)
cd backend && source .venv/bin/activate && pytest

# Frontend TypeScript typecheck, Vitest suite (54 tests), and production build
cd frontend && npm run typecheck && npm test && npm run build

# 3. Validate AWS SAM deployment template
sam validate --lint --template-file infra/template.yaml

# 4. Dry-run AWS packaging
./scripts/deploy.sh --dry-run
```

---

## 9. Engineering Integrity & Synthetic Data Disclosure

> **ENGINEERING INTEGRITY NOTICE:**  
> During demonstration mode, all facility listings, laboratory test profiles, and water transfer records are generated from **explicitly labeled synthetic demonstration fixtures**. Under no circumstances are fictional supplier records or modeled savings presented as verified physical operational truth. BlueLoop's 4-tier impact ledger enforces strict provenance separation so that modeled potential savings cannot be conflated with independently certified freshwater displacement.

---

## 10. License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
