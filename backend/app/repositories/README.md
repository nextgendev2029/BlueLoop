# Backend Repositories (`app/repositories`)

## Purpose
This directory isolates persistence mechanisms from business logic, implementing the Repository Pattern.

## Planned Interfaces
1. **BaseRepository**: Common interface for single-table DynamoDB operations (get, put, update, query).
2. **SupplierRepository**: Persistence for supplier profiles and water quality listings.
3. **DemandRepository**: Persistence for buyer demand requests and status changes.
4. **AllocationRepository**: Persistence for solver results, constraint logs, and allocations.
5. **DeliveryRepository**: Persistence for delivery milestones and receipt validations.

## Status
**Initialisation Phase:** No persistence layer is connected yet. DynamoDB integration will be implemented in subsequent stages.
