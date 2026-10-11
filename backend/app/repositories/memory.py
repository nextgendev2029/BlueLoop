"""
BlueLoop In-Memory Repository Implementations
Local thread-safe storage designed for hackathon MVP and fast testing.
Separates storage mechanics from business logic; easily replaceable by DynamoDB.
"""

import threading
from typing import Callable, Dict, Generic, List, Optional, TypeVar
from pydantic import BaseModel

from app.core.errors import EntityNotFoundError
from app.models.entities import (
    AllocationRun,
    AuditEvent,
    DeliveryRecord,
    DemandRequest,
    Organisation,
    QualityEvidence,
    SupplierFacility,
    SupplyListing,
    User,
)
from app.repositories.base import IRepository

T = TypeVar("T", bound=BaseModel)


class InMemoryRepository(IRepository[T], Generic[T]):
    """
    Thread-safe in-memory storage dictionary.
    Returns model copies to prevent caller mutations from silently corrupting state.
    """

    def __init__(self, id_field_name: str = "id", entity_name: str = "Entity"):
        self._store: Dict[str, T] = {}
        self._lock = threading.RLock()
        self._id_field_name = id_field_name
        self._entity_name = entity_name

    def _get_id(self, entity: T) -> str:
        val = getattr(entity, self._id_field_name, None)
        if val is None:
            raise ValueError(f"Entity missing ID field '{self._id_field_name}'.")
        return str(val)

    def get(self, entity_id: str) -> Optional[T]:
        with self._lock:
            entity = self._store.get(entity_id)
            if entity is None:
                return None
            return entity.model_copy(deep=True)

    def list(self, predicate: Optional[Callable[[T], bool]] = None) -> List[T]:
        with self._lock:
            entities = [e.model_copy(deep=True) for e in self._store.values()]
            if predicate is not None:
                return [e for e in entities if predicate(e)]
            return entities

    def create(self, entity: T) -> T:
        with self._lock:
            entity_id = self._get_id(entity)
            stored = entity.model_copy(deep=True)
            self._store[entity_id] = stored
            return stored.model_copy(deep=True)

    def update(self, entity: T) -> T:
        with self._lock:
            entity_id = self._get_id(entity)
            if entity_id not in self._store:
                raise EntityNotFoundError(self._entity_name, entity_id)
            stored = entity.model_copy(deep=True)
            self._store[entity_id] = stored
            return stored.model_copy(deep=True)

    def delete(self, entity_id: str) -> bool:
        with self._lock:
            if entity_id in self._store:
                del self._store[entity_id]
                return True
            return False

    def count(self) -> int:
        with self._lock:
            return len(self._store)

    def clear(self) -> None:
        with self._lock:
            self._store.clear()


class OrganisationRepository(InMemoryRepository[Organisation]):
    def __init__(self):
        super().__init__(id_field_name="id", entity_name="Organisation")


class UserRepository(InMemoryRepository[User]):
    def __init__(self):
        super().__init__(id_field_name="id", entity_name="User")

    def get_by_email(self, email: str) -> Optional[User]:
        with self._lock:
            for u in self._store.values():
                if u.email.strip().lower() == email.strip().lower():
                    return u.model_copy(deep=True)
            return None


class SupplierFacilityRepository(InMemoryRepository[SupplierFacility]):
    def __init__(self):
        super().__init__(id_field_name="id", entity_name="SupplierFacility")


class SupplyListingRepository(InMemoryRepository[SupplyListing]):
    def __init__(self):
        super().__init__(id_field_name="id", entity_name="SupplyListing")


class DemandRequestRepository(InMemoryRepository[DemandRequest]):
    def __init__(self):
        super().__init__(id_field_name="id", entity_name="DemandRequest")


class QualityEvidenceRepository(InMemoryRepository[QualityEvidence]):
    def __init__(self):
        super().__init__(id_field_name="id", entity_name="QualityEvidence")


class AllocationRunRepository(InMemoryRepository[AllocationRun]):
    def __init__(self):
        super().__init__(id_field_name="run_id", entity_name="AllocationRun")


class AllocationProposalRepository(InMemoryRepository):
    """Stores full AllocationRunResponse proposals for inspection."""

    def __init__(self):
        super().__init__(id_field_name="run_id", entity_name="AllocationProposal")


class DeliveryRepository(InMemoryRepository[DeliveryRecord]):
    def __init__(self):
        super().__init__(id_field_name="id", entity_name="DeliveryRecord")


class AuditEventRepository(InMemoryRepository[AuditEvent]):
    def __init__(self):
        super().__init__(id_field_name="event_id", entity_name="AuditEvent")


class RepositoryContainer:
    """Holds shared repository instances for local development & API services."""

    def __init__(self, use_sqlite: bool = True):
        self.use_sqlite = use_sqlite
        if use_sqlite:
            from app.repositories.sqlite_auth import (
                SQLiteOrganisationRepository,
                SQLiteUserRepository,
                SQLiteSessionRepository,
            )
            self.organisations = SQLiteOrganisationRepository()
            self.users = SQLiteUserRepository()
            self.sessions = SQLiteSessionRepository()
        else:
            self.organisations = OrganisationRepository()
            self.users = UserRepository()
            self.sessions = None

        self.facilities = SupplierFacilityRepository()
        self.listings = SupplyListingRepository()
        self.demands = DemandRequestRepository()
        self.evidences = QualityEvidenceRepository()
        self.allocation_runs = AllocationRunRepository()
        self.allocation_proposals = AllocationProposalRepository()
        self.deliveries = DeliveryRepository()
        self.audit_events = AuditEventRepository()

    def reset_all(self, clear_sessions: bool = False) -> None:
        """Clear all repositories (useful for test isolation)."""
        self.organisations.clear()
        self.users.clear()
        if clear_sessions and hasattr(self, "sessions") and self.sessions:
            self.sessions.clear()
        self.facilities.clear()
        self.listings.clear()
        self.demands.clear()
        self.evidences.clear()
        self.allocation_runs.clear()
        self.allocation_proposals.clear()
        self.deliveries.clear()
        self.audit_events.clear()


# Global container instance
_container: Optional[RepositoryContainer] = None


def get_repository_container(use_sqlite: bool = True) -> RepositoryContainer:
    """Singleton getter for local repository container."""
    global _container
    if _container is None:
        _container = RepositoryContainer(use_sqlite=use_sqlite)
    return _container
