"""
BlueLoop Core Domain & Service Errors
"""


class BlueLoopError(Exception):
    """Base exception for all BlueLoop errors."""

    def __init__(self, message: str, details: dict | None = None):
        super().__init__(message)
        self.message = message
        self.details = details or {}


class EntityNotFoundError(BlueLoopError):
    """Raised when an entity with a specified ID is not found in the repository."""

    def __init__(self, entity_name: str, entity_id: str):
        super().__init__(
            f"{entity_name} with ID '{entity_id}' was not found.",
            {"entity_name": entity_name, "entity_id": entity_id},
        )
        self.entity_name = entity_name
        self.entity_id = entity_id


class InvalidConstraintError(BlueLoopError):
    """Raised when quality or operational constraints are logically invalid (e.g. min > max)."""

    def __init__(self, parameter: str, message: str):
        super().__init__(
            f"Invalid constraint on parameter '{parameter}': {message}",
            {"parameter": parameter},
        )
        self.parameter = parameter


class QualityEvaluationError(BlueLoopError):
    """Raised when quality parameters cannot be evaluated due to structural incompatibility."""

    def __init__(self, message: str, details: dict | None = None):
        super().__init__(message, details)
