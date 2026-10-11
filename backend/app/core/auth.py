"""
BlueLoop Authentication & Authorization Dependencies
Provides session validation, user resolution, login rate limiting, and RBAC enforcement.
"""

from datetime import datetime, timezone
import logging
import threading
from typing import Callable, Dict, List, Optional
from fastapi import Depends, HTTPException, Request, Response, status

from app.core.config import settings
from app.core.security import verify_access_token
from app.models.entities import Organisation, User
from app.models.enums import OrgType, VerificationStatus
from app.repositories.memory import get_repository_container

logger = logging.getLogger("blueloop.core.auth")

# In-memory login attempt throttling tracker
_login_throttle_lock = threading.RLock()
_failed_attempts: Dict[str, List[datetime]] = {}
MAX_FAILED_ATTEMPTS = 5
LOCKOUT_WINDOW_SECONDS = 300  # 5 minutes


def record_failed_login(identifier: str) -> None:
    """Record a failed login attempt for brute-force protection."""
    now = datetime.now(timezone.utc)
    with _login_throttle_lock:
        attempts = _failed_attempts.get(identifier, [])
        cutoff = now.timestamp() - LOCKOUT_WINDOW_SECONDS
        attempts = [t for t in attempts if t.timestamp() > cutoff]
        attempts.append(now)
        _failed_attempts[identifier] = attempts


def check_login_throttled(identifier: str) -> bool:
    """Returns True if the identifier has exceeded allowed failed attempts."""
    now = datetime.now(timezone.utc)
    with _login_throttle_lock:
        attempts = _failed_attempts.get(identifier, [])
        cutoff = now.timestamp() - LOCKOUT_WINDOW_SECONDS
        attempts = [t for t in attempts if t.timestamp() > cutoff]
        _failed_attempts[identifier] = attempts
        return len(attempts) >= MAX_FAILED_ATTEMPTS


def reset_failed_logins(identifier: str) -> None:
    """Clear failed login attempts upon successful authentication."""
    with _login_throttle_lock:
        if identifier in _failed_attempts:
            del _failed_attempts[identifier]


def extract_session_token(request: Request) -> Optional[str]:
    """
    Extract session token from HTTP-only cookie first,
    falling back to Authorization: Bearer <token> header.
    """
    # 1. Check HTTP-only cookie
    cookie_token = request.cookies.get(settings.session_cookie_name)
    if cookie_token:
        return cookie_token.strip()

    # 2. Check Authorization header
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header[len("Bearer ") :].strip()
        if token:
            return token

    return None


async def get_current_user(request: Request) -> User:
    """
    FastAPI dependency validating the session token and returning the active User.
    Supports stateless HMAC-SHA256 tokens for distributed multi-container Lambda resilience,
    with fallback to opaque SQLite session records for backwards compatibility.
    Raises 401 Unauthorized if missing, expired, revoked, or disabled.
    """
    token = extract_session_token(request)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please sign in to access this resource.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    container = get_repository_container()

    # 1. Stateless HMAC-SHA256 token verification (multi-container serverless safe)
    claims = verify_access_token(token)
    if claims:
        # Check revocation in local session store if recorded
        if hasattr(container, "sessions") and container.sessions:
            session_row = container.sessions.get_session(token)
            if session_row and session_row.get("is_revoked"):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Session has been invalidated. Please sign in again.",
                    headers={"WWW-Authenticate": "Bearer"},
                )

        user_id = claims.get("sub")
        user = container.users.get(user_id)
        if not user and claims.get("email"):
            # Ensure organization exists in local container
            org_id = claims.get("org_id", "ORG-DEFAULT")
            if not container.organisations.get(org_id):
                container.organisations.create(
                    Organisation(
                        id=org_id,
                        name=claims.get("name") or "Organization",
                        org_type=OrgType.BUYER if claims.get("role") == "buyer" else OrgType.SUPPLIER,
                        verification_status=VerificationStatus.VERIFIED_DEMO,
                        contact_email=claims.get("email"),
                        is_synthetic=True,
                        created_at=datetime.now(timezone.utc),
                    )
                )
            # Reconstruct user from verified signed claims in this container
            user = User(
                id=user_id,
                org_id=org_id,
                name=claims.get("name") or "User",
                email=claims.get("email"),
                role=claims.get("role"),
                is_active=True,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
            )
            container.users.create(user)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account no longer exists.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account has been disabled. Contact an administrator for assistance.",
            )

        return user

    # 2. Fallback to opaque token in session repository (for legacy tokens / test fixtures)
    if hasattr(container, "sessions") and container.sessions:
        session = container.sessions.get_session(token)
        if session:
            if session["is_revoked"]:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Session has been invalidated. Please sign in again.",
                    headers={"WWW-Authenticate": "Bearer"},
                )

            now = datetime.now(timezone.utc)
            expires_at = session["expires_at"]
            if expires_at.tzinfo is None:
                expires_at = expires_at.replace(tzinfo=timezone.utc)

            if expires_at < now:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Session has expired. Please sign in again.",
                    headers={"WWW-Authenticate": "Bearer"},
                )

            user = container.users.get(session["user_id"])
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="User account no longer exists.",
                    headers={"WWW-Authenticate": "Bearer"},
                )

            if not user.is_active:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Account has been disabled. Contact an administrator for assistance.",
                )

            return user

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired session. Please sign in again.",
        headers={"WWW-Authenticate": "Bearer"},
    )


async def get_optional_current_user(request: Request) -> Optional[User]:
    """Dependency returning User if authenticated, None otherwise without raising."""
    try:
        return await get_current_user(request)
    except HTTPException:
        return None


def require_role(*allowed_roles: str) -> Callable:
    """
    Dependency factory enforcing that the authenticated user possesses one of the allowed roles.
    Raises 403 Forbidden if the user's role is not permitted.
    """
    normalized_roles = [r.lower() for r in allowed_roles]

    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        user_role = (current_user.role or "").lower()
        if user_role not in normalized_roles:
            logger.warning(
                "Access denied for user %s (role: %s); requires one of: %s",
                current_user.id,
                user_role,
                allowed_roles,
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Forbidden. Action requires role: {', '.join(allowed_roles)}.",
            )
        return current_user

    return role_checker


async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Dependency verifying the caller possesses the admin role."""
    if (current_user.role or "").lower() != "admin":
        logger.warning("Admin access denied for user %s (role: %s)", current_user.id, current_user.role)
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrative privileges required for this action.",
        )
    return current_user
