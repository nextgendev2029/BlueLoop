# Backend Services (`app/services`)

## Purpose
This directory hosts core business logic and computational services for BlueLoop.

## Planned Services
1. **QualityValidationService**:
   - Deterministic water quality threshold checking (evaluating candidate supplier water against buyer tolerances for pH, TDS, COD, BOD, Turbidity, etc.).
   - Explicit exclusion of non-compliant sources.
2. **AllocationService**:
   - Constrained optimization engine allocating available supplier volumes to active buyer requests.
   - Cost and distance weighting while respecting capacity constraints.
3. **DisplacementCalculationService**:
   - Mathematical calculation of potential freshwater displaced (kL/day, annualized displacement).
   - Cost variance modeling comparing virgin freshwater procurement against treated water reuse.
4. **AuditService**:
   - Generation of explainable decision traces for every matching or rejection decision.

## Status
**Initialisation Phase:** No calculations are instantiated yet to prevent mock logic from being mistaken for the verified intelligence engine.
