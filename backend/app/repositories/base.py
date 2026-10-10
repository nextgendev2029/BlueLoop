"""
BlueLoop Generic Repository Interfaces
"""

from typing import Callable, Generic, List, Optional, TypeVar
from pydantic import BaseModel

T = TypeVar("T", bound=BaseModel)


class IRepository(Generic[T]):
    """Generic interface for domain entity persistence."""

    def get(self, entity_id: str) -> Optional[T]:
        """Retrieve an entity by its stable ID."""
        raise NotImplementedError

    def list(self, predicate: Optional[Callable[[T], bool]] = None) -> List[T]:
        """List all entities, optionally filtered by a predicate function."""
        raise NotImplementedError

    def create(self, entity: T) -> T:
        """Store a new entity and return the stored instance."""
        raise NotImplementedError

    def update(self, entity: T) -> T:
        """Update an existing entity and return the updated instance."""
        raise NotImplementedError

    def delete(self, entity_id: str) -> bool:
        """Delete an entity by its stable ID. Return True if deleted, False if not found."""
        raise NotImplementedError

    def count(self) -> int:
        """Return total count of entities in storage."""
        raise NotImplementedError
