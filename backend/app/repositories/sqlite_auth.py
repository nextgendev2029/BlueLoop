"""
BlueLoop SQLite-Backed Repositories for Auth & Multi-Tenancy
Provides persistent implementations of IRepository for Users, Organisations,
Sessions, and Audit Events.
"""

from datetime import datetime, timezone
import json
import logging
from typing import Callable, List, Optional
import uuid

from app.core.errors import EntityNotFoundError
from app.db.sqlite import get_connection
from app.models.entities import AuditEvent, Organisation, User
from app.models.enums import ActorType, OrgType, VerificationStatus
from app.repositories.base import IRepository

logger = logging.getLogger("blueloop.repositories.sqlite_auth")


class SQLiteOrganisationRepository(IRepository[Organisation]):
    def __init__(self, db_path: Optional[str] = None):
        self._db_path = db_path

    def _row_to_model(self, row) -> Organisation:
        return Organisation(
            id=row["id"],
            name=row["name"],
            org_type=OrgType(row["org_type"]),
            verification_status=VerificationStatus(row["verification_status"]),
            contact_email=row["contact_email"],
            is_synthetic=bool(row["is_synthetic"]),
            created_at=datetime.fromisoformat(row["created_at"]),
        )

    def get(self, entity_id: str) -> Optional[Organisation]:
        conn = get_connection(self._db_path)
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM organisations WHERE id = ?", (entity_id,))
            row = cursor.fetchone()
            return self._row_to_model(row) if row else None
        finally:
            conn.close()

    def list(self, predicate: Optional[Callable[[Organisation], bool]] = None) -> List[Organisation]:
        conn = get_connection(self._db_path)
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM organisations ORDER BY name ASC")
            items = [self._row_to_model(row) for row in cursor.fetchall()]
            if predicate:
                return [i for i in items if predicate(i)]
            return items
        finally:
            conn.close()

    def create(self, entity: Organisation) -> Organisation:
        conn = get_connection(self._db_path)
        try:
            cursor = conn.cursor()
            created_at_iso = entity.created_at.isoformat() if isinstance(entity.created_at, datetime) else str(entity.created_at)
            cursor.execute(
                """
                INSERT OR REPLACE INTO organisations (id, name, org_type, verification_status, contact_email, is_synthetic, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    entity.id,
                    entity.name,
                    entity.org_type.value if hasattr(entity.org_type, "value") else str(entity.org_type),
                    entity.verification_status.value if hasattr(entity.verification_status, "value") else str(entity.verification_status),
                    entity.contact_email,
                    1 if entity.is_synthetic else 0,
                    created_at_iso,
                ),
            )
            conn.commit()
            return entity.model_copy(deep=True)
        finally:
            conn.close()

    def update(self, entity: Organisation) -> Organisation:
        existing = self.get(entity.id)
        if not existing:
            raise EntityNotFoundError("Organisation", entity.id)
        return self.create(entity)

    def delete(self, entity_id: str) -> bool:
        conn = get_connection(self._db_path)
        try:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM organisations WHERE id = ?", (entity_id,))
            conn.commit()
            return cursor.rowcount > 0
        finally:
            conn.close()

    def count(self) -> int:
        conn = get_connection(self._db_path)
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM organisations")
            return cursor.fetchone()[0]
        finally:
            conn.close()

    def clear(self) -> None:
        conn = get_connection(self._db_path)
        try:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM organisations")
            conn.commit()
        finally:
            conn.close()


class SQLiteUserRepository(IRepository[User]):
    def __init__(self, db_path: Optional[str] = None):
        self._db_path = db_path

    def _row_to_model(self, row) -> User:
        return User(
            id=row["id"],
            org_id=row["org_id"],
            name=row["name"],
            email=row["email"],
            role=row["role"],
            is_active=bool(row["is_active"]),
            password_hash=row["password_hash"],
            created_at=datetime.fromisoformat(row["created_at"]),
            updated_at=datetime.fromisoformat(row["updated_at"]) if row["updated_at"] else None,
        )

    def get(self, entity_id: str) -> Optional[User]:
        conn = get_connection(self._db_path)
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE id = ?", (entity_id,))
            row = cursor.fetchone()
            return self._row_to_model(row) if row else None
        finally:
            conn.close()

    def get_by_email(self, email: str) -> Optional[User]:
        conn = get_connection(self._db_path)
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE LOWER(email) = LOWER(?)", (email.strip(),))
            row = cursor.fetchone()
            return self._row_to_model(row) if row else None
        finally:
            conn.close()

    def list(self, predicate: Optional[Callable[[User], bool]] = None) -> List[User]:
        conn = get_connection(self._db_path)
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users ORDER BY created_at DESC")
            items = [self._row_to_model(row) for row in cursor.fetchall()]
            if predicate:
                return [i for i in items if predicate(i)]
            return items
        finally:
            conn.close()

    def create(self, entity: User) -> User:
        conn = get_connection(self._db_path)
        try:
            cursor = conn.cursor()
            now_iso = datetime.now(timezone.utc).isoformat()
            created_at_iso = entity.created_at.isoformat() if isinstance(entity.created_at, datetime) else now_iso
            updated_at_iso = entity.updated_at.isoformat() if isinstance(entity.updated_at, datetime) else now_iso
            cursor.execute(
                """
                INSERT OR REPLACE INTO users (id, email, password_hash, name, role, org_id, is_active, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    entity.id,
                    entity.email.strip().lower(),
                    entity.password_hash or "",
                    entity.name,
                    entity.role,
                    entity.org_id,
                    1 if entity.is_active else 0,
                    created_at_iso,
                    updated_at_iso,
                ),
            )
            conn.commit()
            return entity.model_copy(deep=True)
        finally:
            conn.close()

    def update(self, entity: User) -> User:
        existing = self.get(entity.id)
        if not existing:
            raise EntityNotFoundError("User", entity.id)
        return self.create(entity)

    def delete(self, entity_id: str) -> bool:
        conn = get_connection(self._db_path)
        try:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM users WHERE id = ?", (entity_id,))
            conn.commit()
            return cursor.rowcount > 0
        finally:
            conn.close()

    def count(self) -> int:
        conn = get_connection(self._db_path)
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM users")
            return cursor.fetchone()[0]
        finally:
            conn.close()

    def clear(self) -> None:
        conn = get_connection(self._db_path)
        try:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM users")
            conn.commit()
        finally:
            conn.close()


class SQLiteSessionRepository:
    def __init__(self, db_path: Optional[str] = None):
        self._db_path = db_path

    def create_session(self, token: str, user_id: str, expires_at: datetime) -> None:
        conn = get_connection(self._db_path)
        try:
            cursor = conn.cursor()
            now_iso = datetime.now(timezone.utc).isoformat()
            expires_at_iso = expires_at.isoformat()
            cursor.execute(
                """
                INSERT OR REPLACE INTO sessions (token, user_id, created_at, expires_at, is_revoked)
                VALUES (?, ?, ?, ?, 0)
                """,
                (token, user_id, now_iso, expires_at_iso),
            )
            conn.commit()
        finally:
            conn.close()

    def get_session(self, token: str) -> Optional[dict]:
        conn = get_connection(self._db_path)
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM sessions WHERE token = ?", (token,))
            row = cursor.fetchone()
            if not row:
                return None
            return {
                "token": row["token"],
                "user_id": row["user_id"],
                "created_at": datetime.fromisoformat(row["created_at"]),
                "expires_at": datetime.fromisoformat(row["expires_at"]),
                "is_revoked": bool(row["is_revoked"]),
            }
        finally:
            conn.close()

    def revoke_session(self, token: str) -> bool:
        conn = get_connection(self._db_path)
        try:
            cursor = conn.cursor()
            cursor.execute("UPDATE sessions SET is_revoked = 1 WHERE token = ?", (token,))
            conn.commit()
            return cursor.rowcount > 0
        finally:
            conn.close()

    def revoke_all_for_user(self, user_id: str) -> int:
        conn = get_connection(self._db_path)
        try:
            cursor = conn.cursor()
            cursor.execute("UPDATE sessions SET is_revoked = 1 WHERE user_id = ?", (user_id,))
            conn.commit()
            return cursor.rowcount
        finally:
            conn.close()

    def clear(self) -> None:
        conn = get_connection(self._db_path)
        try:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM sessions")
            conn.commit()
        finally:
            conn.close()
