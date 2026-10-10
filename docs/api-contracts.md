# BlueLoop API Contracts Specification

## 1. Overview & Protocol Standards
BlueLoop exposes a standardized RESTful API over HTTP/JSON.
- **Base URL (Local)**: `http://localhost:8000/api/v1`
- **Data Format**: `application/json; charset=utf-8`
- **Date/Time Standard**: ISO 8601 UTC timestamps (e.g., `2026-10-11T02:30:00Z`)
- **Error Format Standard**: RFC 7807 compliant error object structure

```json
{
  "error": "ErrorTypeIdentifier",
  "message": "Human-readable explanation of error condition",
  "details": [],
  "path": "/api/v1/requested-path"
}
```

---

## 2. Implemented Endpoints (Current Foundation Status)

### 2.1 Root Information Endpoint
- **Method**: `GET /`
- **Status Code**: `200 OK`
- **Description**: Returns root service metadata and documentation links.
- **Response Example**:
```json
{
  "name": "BlueLoop",
  "version": "0.1.0",
  "description": "Water Reuse Intelligence and Procurement Optimisation Platform",
  "health": "/api/v1/health",
  "docs": "/docs"
}
```

### 2.2 System Health Check
- **Method**: `GET /api/v1/health`
- **Status Code**: `200 OK`
- **Description**: Returns real-time health status, software version, running environment, and synthetic data mode indicator.
- **Response Schema (`HealthResponse`)**:
```json
{
  "status": "ok",
  "app_name": "BlueLoop",
  "version": "0.1.0",
  "environment": "development",
  "timestamp": "2026-10-11T02:30:00Z",
  "synthetic_data_mode": true
}
```

---

## 3. Planned Endpoints (Scheduled for Implementation in Subsequent Stages)

> **IMPORTANT:**
> The endpoints listed in this section describe the contract specifications planned for subsequent development stages.
> They are **not yet active** in the current repository initialisation stage.

### 3.1 Water Supplier Endpoints (Planned)
- `POST /api/v1/suppliers`
  - Register a new industrial wastewater treatment facility.
- `GET /api/v1/suppliers`
  - Query supplier facilities with geographical radius and treatment capacity filters.
- `GET /api/v1/suppliers/{supplier_id}`
  - Retrieve supplier profile and facility accreditation.
- `POST /api/v1/suppliers/{supplier_id}/listings`
  - Register available treated water volume batch with certified water quality parameters (pH, TDS, COD, BOD, Turbidity).
- `GET /api/v1/suppliers/{supplier_id}/listings`
  - List active water batches and pricing for a supplier.

### 3.2 Buyer Demand Requests (Planned)
- `POST /api/v1/demands`
  - Submit buyer demand request specifying required volume (kL/day), required duration, application type (cooling, boiler, flushing, irrigation), and maximum allowable contaminant thresholds.
- `GET /api/v1/demands`
  - List buyer demand requests and status.
- `GET /api/v1/demands/{demand_id}`
  - Retrieve demand request detail and compatibility evaluation status.

### 3.3 Quality Eligibility & Matching Engine (Planned)
- `POST /api/v1/matching/evaluate-eligibility`
  - Deterministic evaluation test: checks whether a specific supplier water listing satisfies a buyer demand's parameter threshold limits. Returns pass/fail with exact parameter delta explanation.
- `POST /api/v1/matching/run-allocation`
  - Triggers the multi-facility allocation optimization algorithm. Returns optimal supply allocations, delivered cost estimations, and explanation traces.
- `GET /api/v1/matching/allocations/{allocation_id}`
  - Retrieve details, decision rationale, and freshwater displacement metrics for an allocation plan.

### 3.4 Delivery & Verification (Planned)
- `POST /api/v1/deliveries`
  - Create scheduled delivery batch based on an approved allocation.
- `PATCH /api/v1/deliveries/{delivery_id}/status`
  - Update delivery milestone (`DISPATCHED`, `IN_TRANSIT`, `DELIVERED`, `ACCEPTED`).
- `POST /api/v1/deliveries/{delivery_id}/verify`
  - Buyer digital signature and quality sample verification upon physical delivery.

### 3.5 Impact Analytics (Planned)
- `GET /api/v1/impact/summary`
  - Aggregate verified freshwater displacement (kL), groundwater stress reduction index, and procurement cost savings across all verified deliveries.
