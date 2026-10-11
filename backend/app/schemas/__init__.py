"""
BlueLoop Schemas Package
"""

from app.schemas.allocation import (
    AllocationRunRequest,
    AllocationRunResponse,
    AllocationRunTotals,
    DemandFulfillmentStatus,
    ProposedAllocationItem,
    RejectedCandidateItem,
    SupplyUtilizationStatus,
)
from app.schemas.compatibility import (
    CompatibilityEvaluationRequest,
    CompatibilityEvaluationResponse,
)
from app.schemas.auth import (
    AuthResponse,
    LoginRequest,
    SignupRequest,
    UpdateUserStatusRequest,
    UserResponse,
)
from app.schemas.delivery import (
    DeliveryCreateRequest,
    DeliveryListResponse,
    DeliveryRecordResponse,
    DeliveryStatusUpdateRequest,
)
from app.schemas.demand import (
    DemandListResponse,
    DemandRequestCreate,
    DemandRequestResponse,
)
from app.schemas.health import HealthResponse
from app.schemas.impact import ImpactSummaryResponse
from app.schemas.supplier import SupplierFacilityResponse, SupplierListResponse
from app.schemas.supply import (
    SupplyListingCreateRequest,
    SupplyListingResponse,
    SupplyListResponse,
)

__all__ = [
    "AllocationRunRequest",
    "AllocationRunResponse",
    "AllocationRunTotals",
    "DemandFulfillmentStatus",
    "ProposedAllocationItem",
    "RejectedCandidateItem",
    "SupplyUtilizationStatus",
    "CompatibilityEvaluationRequest",
    "CompatibilityEvaluationResponse",
    "DeliveryCreateRequest",
    "DeliveryListResponse",
    "DeliveryRecordResponse",
    "DeliveryStatusUpdateRequest",
    "DemandListResponse",
    "DemandRequestResponse",
    "HealthResponse",
    "ImpactSummaryResponse",
    "SupplierFacilityResponse",
    "SupplierListResponse",
    "SupplyListResponse",
    "SupplyListingResponse",
]
