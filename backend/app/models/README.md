# Backend Domain Models (`app/models`)

## Purpose
This directory will contain internal Python domain models and entities used by the BlueLoop business logic layer.

## Intended Entities (Planned for Implementation in Subsequent Stages)
1. **Supplier**: Industrial water discharger or treatment facility profile, operational permits, geographic coordinates.
2. **WaterListing**: Batch/stream parameters including available flow rate (kL/day), treatment stage, certified parameters (pH, TDS, COD, BOD, Turbidity, Heavy Metals), unit price.
3. **DemandRequest**: Commercial/industrial consumer water requirement, acceptable parameter thresholds, volume needed, delivery timeline.
4. **Allocation**: Deterministic matching result mapping eligible supplier volume to buyer demand with constraint rationale.
5. **Delivery**: Scheduled dispatch, custody transfer, and delivery verification records.
6. **ImpactLedger**: Verified freshwater displacement records and cost savings tracking.

## Status
**Initialisation Phase:** No domain entities are instantiated yet. Request/response schemas are declared in `app/schemas/`.
