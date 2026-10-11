# BlueLoop - Water Reuse Intelligence & Procurement Optimisation Platform

[![Platform](https://img.shields.io/badge/Platform-BlueLoop-0f766e.svg)](https://github.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](LICENSE)
[![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%7C%20TypeScript%20%7C%20Vite-blue.svg)](frontend/)
[![Backend](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.11-emerald.svg)](backend/)
[![Track](https://img.shields.io/badge/Hackathon%20Track-Heat%20%26%20Water-orange.svg)]()

> **Environmental Hacks / AWS Bharat Builds Tour Hackathon**  
> **Track:** Heat and Water  
> **Deployment Approach:** Ship It - Deploying on Amazon Web Services (AWS)

---

## 1. What is BlueLoop?

**BlueLoop** is a Water Reuse Intelligence and Procurement Optimisation Platform that helps commercial and industrial water consumers identify suitable treated-water suppliers, evaluate chemical and physical quality eligibility, optimize multi-facility supply allocation, estimate delivered procurement costs, and accurately quantify freshwater displacement.

### The Environmental Problem Addressed
Industrial clusters, data centers, construction projects, and commercial cooling facilities consume billions of liters of potable municipal freshwater or deplete critical groundwater reserves daily. Simultaneously, industrial wastewater treatment plants and sewage treatment facilities generate vast quantities of treated, high-grade effluent that is discharged into natural bodies instead of being recirculated into productive use.

The primary barriers to industrial water reuse are:
1. **Quality Uncertainty & Fear of Equipment Degradation**: Buyers fear scale, corrosion, or contamination if treated water does not match precise operating limits.
2. **Fragmented Discovery & Logistics Friction**: Sourcing treated water involves ad-hoc transport arrangements with non-transparent costs.
3. **Lack of Auditable Impact Accounting**: Organizations cannot easily verify how much virgin groundwater or municipal freshwater was displaced.

### Core Value Proposition
BlueLoop solves this with **deterministic, explainable engineering logic**:
- **Zero Black-Box Guesswork**: Water-quality compatibility checks use exact physical parameter math against codified industrial standards.
- **Constrained Optimization**: Solves multi-facility supply allocation minimizing transport distances and unit costs.
- **Auditable Environmental Savings**: Calculates verified cubic meters of freshwater saved without arbitrary inflation.

---

## 2. Target Users

1. **Commercial & Industrial Buyers (Water Consumers)**:
   - Data center cooling operators, district cooling plants, commercial HVAC facilities.
   - Manufacturing, textile, chemical, and automotive assembly facilities.
   - Ready-mix concrete and infrastructure construction sites.
2. **Treated Water Suppliers (Effluent Producers)**:
   - Industrial Common Effluent Treatment Plants (CETPs).
   - Private industrial wastewater treatment units with surplus treated effluent.
   - Municipal tertiary sewage treatment plants (STPs).
3. **Environmental & Sustainability Auditors**:
   - ESG reporting officers auditing certified freshwater displacement metrics.
   - Industrial park zone administrators monitoring water circularity compliance.

---

## 3. Technology Stack

### Frontend Application
- **Runtime & Bundler**: Vite 5.x
- **Framework**: React 18.x
- **Language**: TypeScript 5.x
- **Routing**: React Router DOM 6.x
- **Styling**: Tailwind CSS 3.4 (Restrained enterprise B2B styling: stone/neutral surfaces with deep teal accents)
- **Icons**: Lucide React

### Backend Service
- **Runtime**: Python 3.11+
- **API Framework**: FastAPI 0.110+
- **Data Validation & Settings**: Pydantic v2 & Pydantic-Settings
- **Server (Local)**: Uvicorn
- **Testing**: Pytest 8.x, HTTPX TestClient
- **Serverless Adapter**: Mangum (ASGI adapter for AWS Lambda)

### Target AWS Cloud Architecture (Planned for Deployment)
- **Amazon CloudFront**: Global edge CDN delivery for static React SPA.
- **Amazon S3**: Static website hosting and secure storage for lab test certificates.
- **Amazon API Gateway**: REST API routing, rate limiting, and CORS handling.
- **AWS Lambda**: Serverless Python 3.11 execution running FastAPI via Mangum.
- **Amazon DynamoDB**: Single-table NoSQL persistence for multi-entity workflows.
- **Amazon EventBridge**: Scheduled compliance audits and recertification events.
- **Amazon Cognito**: Multi-tenant authentication and role-based access control.
- **Amazon CloudWatch**: Centralized operational logging and metrics.

*(Note: Live AWS resources are scheduled for deployment in subsequent phases; no cloud resources are created during repository initialisation).*

---

## 4. Repository Structure

```
blueloop/
├── frontend/                     # React 18 + TypeScript + Vite Single-Page Application
│   ├── public/                   # Public static assets & favicon
│   ├── src/
│   │   ├── app/                  # Application configuration & providers
│   │   ├── components/           # Reusable UI components (Badge, UI elements)
│   │   ├── features/             # Feature-specific modules
│   │   ├── hooks/                # Custom React hooks
│   │   ├── layouts/              # App shell layout (Sidebar, Header, Main)
│   │   ├── lib/                  # Shared utilities & typed API fetch client
│   │   ├── pages/                # Route pages (Dashboard, Suppliers, Demands, Allocations, Deliveries, Impact, Settings)
│   │   ├── services/             # API services
│   │   ├── styles/               # Global Tailwind CSS definitions
│   │   ├── types/                # TypeScript interfaces and type definitions
│   │   ├── App.tsx               # Route mapping & layout wrapper
│   │   └── main.tsx              # Application mount point
│   ├── package.json              # Frontend manifest & scripts
│   ├── tsconfig.json             # TypeScript compiler configuration
│   ├── tailwind.config.js        # Design tokens & color configuration
│   └── vite.config.ts            # Vite bundler configuration & local API proxy
├── backend/                      # FastAPI Python 3.11 Application
│   ├── app/
│   │   ├── api/v1/               # REST API v1 routing & endpoints
│   │   │   └── endpoints/        # Health check endpoint
│   │   ├── core/                 # Settings (Pydantic-Settings) & CORS config
│   │   ├── models/               # Domain models architecture
│   │   ├── repositories/         # Persistence repository abstractions
│   │   ├── schemas/              # Pydantic request/response schemas
│   │   ├── services/             # Planned business logic & optimization services
│   │   └── main.py               # FastAPI entry point & Mangum Lambda handler
│   ├── tests/                    # Pytest test suite (health endpoint & CORS tests)
│   ├── requirements.txt          # Python dependencies
│   └── pyproject.toml            # Python project manifest & pytest configuration
├── data/                         # Data fixtures & synthetic data policies
│   └── README.md                 # Synthetic sample data standard & rules
├── docs/                         # Comprehensive engineering documentation
│   ├── architecture.md           # System architecture & component responsibilities
│   ├── api-contracts.md          # REST API specifications (implemented vs planned)
│   ├── data-model.md             # Domain entities & DynamoDB single-table schema
│   └── development-plan.md       # Phased implementation roadmap
├── infra/                        # Infrastructure-as-Code definitions
│   └── README.md                 # Target AWS cloud architecture blueprint
├── scripts/                      # Developer utility scripts
├── .env.example                  # Safe environment variable template
├── .gitignore                    # Secrets, build outputs, and runtime exclusions
├── LICENSE                       # MIT Open Source License
└── README.md                     # Platform overview & developer guide
```

---

## 5. Prerequisites

Before running the application locally, ensure you have the following installed:
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- **Python**: v3.11.x (or higher)
- **Git**

---

## 6. Getting Started & Local Development

### 6.1 Environment Configuration
Create a local `.env` file from the provided safe template:
```bash
cp .env.example .env
```

### 6.2 Backend Setup & Execution
1. Navigate to the backend directory and create a Python 3.11 virtual environment:
   ```bash
   cd backend
   python3.11 -m venv .venv
   source .venv/bin/activate
   ```
2. Install backend dependencies:
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```
3. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
4. Verify the backend health endpoint:
   ```bash
   curl http://localhost:8000/api/v1/health
   ```
   Interactive OpenAPI documentation is accessible at: `http://localhost:8000/docs`

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

## 7. Running Tests

### Backend Automated Test Suite
From the `backend/` directory with the virtual environment activated:
```bash
cd backend
source .venv/bin/activate
pytest
```

### Frontend Automated Test Suite, Typecheck & Production Build
From the `frontend/` directory:
```bash
cd frontend
npm run typecheck
npm test
npm run build
```

### Unified Verification Script
Run the comprehensive multi-layer verification suite:
```bash
./scripts/verify.sh
```

### AWS Deployment Packaging & Dry-Run
```bash
./scripts/deploy.sh --dry-run
```

---

## 8. Current Implementation Status vs Planned Capabilities

| Capability | Current Status | Description |
| :--- | :--- | :--- |
| **Repository Foundation** | **Implemented** | Monorepo layout, .gitignore, .env.example, MIT license |
| **Frontend Platform & UX** | **Implemented** | React 18 SPA, Full REST API integration, Nature-Inspired Luxury UI, River Blue accents |
| **Backend API Core** | **Implemented** | FastAPI app, CORS middleware, Mangum adapter, health endpoint |
| **Domain Entities & Models** | **Implemented** | Typed models for organisations, facilities, listings, demands, evidence |
| **Quality Screening Engine** | **Implemented** | Deterministic threshold checking (pH, TDS, COD, BOD, TSS, Turbidity) |
| **In-Memory Repositories** | **Implemented** | Thread-safe local CRUD repositories with mutation isolation |
| **Synthetic Demo Dataset** | **Implemented** | Reproducible multi-facility seed fixtures with verified & mismatch cases |
| **Domain REST Endpoints** | **Implemented** | GET /suppliers, GET /supplies, GET /demands, POST /compatibility/evaluate (with bounded pagination & filters) |
| **Constrained Allocation Solver** | **Implemented** | Deterministic solver enforcing capacity limits and competing demand sharing |
| **Displacement & Cost Engine** | **Implemented** | Dedicated cost calculator and audited freshwater displacement metrics |
| **Allocation REST Endpoints** | **Implemented** | POST /allocations/run, GET /allocations/{id}, accept/reject proposals |
| **Delivery & Custody Tracking** | **Implemented** | GET/POST /deliveries, PATCH /deliveries/{id}/status with strict lifecycle validation |
| **Impact Analytics API** | **Implemented** | Multi-tier displacement reporting (potential, accepted, confirmed, verified) |
| **Complete Product Integration** | **Implemented** | Unified API client, reactive health indicator, modal flows, 102 automated tests |
| **AWS Serverless Packaging & IaC** | **Packaged & Verified** | SAM template (`infra/template.yaml`), deploy script (`scripts/deploy.sh`), dry-run verified (**Status: NOT DEPLOYED per resource safety protocol**) |
| **DynamoDB Persistence** | *Planned (Post-Hackathon)* | Transition in-memory store to DynamoDB single-table persistence |
| **Amazon Cognito Auth** | *Planned (Post-Hackathon)* | Multi-tenant RBAC with authenticated buyer/supplier portals |

---

## 9. Policy on Synthetic Sample Data
> **ENGINEERING INTEGRITY NOTICE:**  
> During this initialisation and early development phase, all data utilized by the platform consists of **clearly labeled synthetic sample fixtures**. Under no circumstances are fictional supplier records, simulated laboratory certificates, or estimated economic savings presented as verified real-world operational truth.

---

## 10. License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
