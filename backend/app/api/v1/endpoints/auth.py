"""
BlueLoop Authentication & Session Endpoints
Implements genuine signup, login, logout, profile resolution, and admin user controls.
"""

from datetime import datetime, timezone, timedelta
import logging
from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status

from app.core.auth import (
    check_login_throttled,
    extract_session_token,
    get_current_user,
    record_failed_login,
    require_admin,
    reset_failed_logins,
)
from app.core.config import settings
from app.core.security import (
    generate_session_token,
    hash_password,
    validate_email_format,
    validate_password_strength,
    verify_password,
)
from app.models.entities import AuditEvent, Organisation, User
from app.models.enums import ActorType, OrgType, VerificationStatus
from app.repositories.memory import get_repository_container
from app.schemas.auth import (
    AuthResponse,
    LoginRequest,
    SignupRequest,
    UpdateUserStatusRequest,
    UserResponse,
)

router = APIRouter()
logger = logging.getLogger("blueloop.api.auth")


def _build_user_response(user: User, container) -> UserResponse:
    org = container.organisations.get(user.org_id)
    return UserResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        role=user.role,
        org_id=user.org_id,
        org_name=org.name if org else None,
        org_type=org.org_type if org else None,
        is_active=user.is_active,
        email_verified=False,
        created_at=user.created_at,
    )


@router.post(
    "/signup",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create New Commercial Account",
    description="Registers a new buyer or supplier organisation and creates the primary operator credentials.",
)
async def signup(payload: SignupRequest, response: Response) -> AuthResponse:
    container = get_repository_container()

    # 1. Validate email format
    is_valid_email, email_msg = validate_email_format(payload.email)
    if not is_valid_email:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=email_msg)

    # 2. Validate password strength
    is_strong_pw, pw_msg = validate_password_strength(payload.password)
    if not is_strong_pw:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=pw_msg)

    # 3. Validate permitted self-registration roles
    clean_role = payload.role.strip().lower()
    if clean_role == "admin":
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Public administrator registration is prohibited. Administrator accounts must be provisioned internally.",
        )
    if clean_role not in ("buyer", "supplier"):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid registration role. Self-registration is restricted to 'buyer' or 'supplier'.",
        )

    # 4. Check for duplicate account email
    existing_user = container.users.get_by_email(payload.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"An account with email '{payload.email}' already exists. Please sign in instead.",
        )

    now = datetime.now(timezone.utc)

    # 5. Create Organization
    org_id = f"ORG-{uuid.uuid4().hex[:8].upper()}"
    org_type = OrgType.SUPPLIER if clean_role == "supplier" else OrgType.BUYER
    org = Organisation(
        id=org_id,
        name=payload.org_name.strip(),
        org_type=org_type,
        verification_status=VerificationStatus.UNVERIFIED,
        contact_email=payload.email.strip().lower(),
        is_synthetic=False,
        created_at=now,
    )
    container.organisations.create(org)

    # 6. Create User
    user_id = f"USR-{uuid.uuid4().hex[:8].upper()}"
    pwd_hash = hash_password(payload.password)
    user = User(
        id=user_id,
        org_id=org_id,
        name=payload.name.strip(),
        email=payload.email.strip().lower(),
        role=clean_role,
        is_active=True,
        password_hash=pwd_hash,
        created_at=now,
        updated_at=now,
    )
    created_user = container.users.create(user)

    # 7. Create Session
    token = generate_session_token()
    expires_at = now + timedelta(hours=settings.session_expiry_hours)
    container.sessions.create_session(token, user_id, expires_at)

    # 8. Set HTTP-only Cookie
    response.set_cookie(
        key=settings.session_cookie_name,
        value=token,
        httponly=True,
        samesite=settings.session_cookie_samesite,
        secure=settings.session_cookie_secure,
        max_age=settings.session_expiry_hours * 3600,
        path="/",
    )

    # 9. Audit event
    container.audit_events.create(
        AuditEvent(
            event_id=f"AUD-{uuid.uuid4().hex[:8].upper()}",
            entity_type="User",
            entity_id=user_id,
            actor_type=ActorType.USER_OPERATOR,
            action="SIGNUP",
            explanation=f"New {clean_role} user registered: {payload.email} under {payload.org_name}.",
            metadata={"org_id": org_id, "role": clean_role},
        )
    )

    user_resp = _build_user_response(created_user, container)
    return AuthResponse(
        token=token,
        token_type="bearer",
        user=user_resp,
        message="Account created and authenticated successfully.",
    )


@router.post(
    "/login",
    response_model=AuthResponse,
    status_code=status.HTTP_200_OK,
    summary="Sign In with Credentials",
    description="Authenticates corporate credentials and issues a secure HTTP-only session cookie.",
)
async def login(payload: LoginRequest, response: Response) -> AuthResponse:
    clean_email = payload.email.strip().lower()

    # 1. Rate limiting check
    if check_login_throttled(clean_email):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many failed login attempts. Account temporarily locked for 5 minutes.",
        )

    container = get_repository_container()
    user = container.users.get_by_email(clean_email)

    # 2. Verify existence and password constant-time
    if not user or not user.password_hash:
        record_failed_login(clean_email)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not verify_password(payload.password, user.password_hash):
        record_failed_login(clean_email)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 3. Check active status
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account has been disabled. Contact an administrator for assistance.",
        )

    # 4. Clear throttle on success
    reset_failed_logins(clean_email)

    # 5. Issue session
    now = datetime.now(timezone.utc)
    token = generate_session_token()
    expires_at = now + timedelta(hours=settings.session_expiry_hours)
    container.sessions.create_session(token, user.id, expires_at)

    # 6. Set HTTP-only Cookie
    response.set_cookie(
        key=settings.session_cookie_name,
        value=token,
        httponly=True,
        samesite=settings.session_cookie_samesite,
        secure=settings.session_cookie_secure,
        max_age=settings.session_expiry_hours * 3600,
        path="/",
    )

    user_resp = _build_user_response(user, container)
    return AuthResponse(
        token=token,
        token_type="bearer",
        user=user_resp,
        message="Authenticated successfully.",
    )


@router.post(
    "/logout",
    status_code=status.HTTP_200_OK,
    summary="Sign Out Current Session",
    description="Invalidates current session token in durable storage and clears browser session cookie.",
)
async def logout(
    request: Request,
    response: Response,
    current_user: User = Depends(get_current_user),
) -> dict:
    container = get_repository_container()
    token = extract_session_token(request)
    if token and hasattr(container, "sessions") and container.sessions:
        container.sessions.revoke_session(token)

    response.delete_cookie(
        key=settings.session_cookie_name,
        path="/",
    )
    return {"message": "Logged out successfully."}


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Current User Profile",
    description="Returns identity, role, and organisation details for the authenticated session.",
)
async def get_me(current_user: User = Depends(get_current_user)) -> UserResponse:
    container = get_repository_container()
    return _build_user_response(current_user, container)


@router.get(
    "/users",
    response_model=List[UserResponse],
    status_code=status.HTTP_200_OK,
    summary="List Platform Users (Admin Only)",
    description="Lists all user accounts across organisations. Restricted to administrators.",
)
async def list_users(admin: User = Depends(require_admin)) -> List[UserResponse]:
    container = get_repository_container()
    users = container.users.list()
    return [_build_user_response(u, container) for u in users]


@router.patch(
    "/users/{user_id}/status",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Update User Account Status (Admin Only)",
    description="Enables or disables a user account. Disabling immediately revokes all active sessions.",
)
async def update_user_status(
    user_id: str,
    payload: UpdateUserStatusRequest,
    admin: User = Depends(require_admin),
) -> UserResponse:
    container = get_repository_container()
    user = container.users.get(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID '{user_id}' not found.",
        )

    if user.id == admin.id and not payload.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot disable your own active administrator account.",
        )

    user.is_active = payload.is_active
    user.updated_at = datetime.now(timezone.utc)
    updated = container.users.update(user)

    if not payload.is_active and hasattr(container, "sessions") and container.sessions:
        container.sessions.revoke_all_for_user(user_id)

    # Record audit event
    container.audit_events.create(
        AuditEvent(
            event_id=f"AUD-{uuid.uuid4().hex[:8].upper()}",
            entity_type="User",
            entity_id=user_id,
            actor_type=ActorType.USER_OPERATOR,
            action="UPDATE_USER_STATUS",
            explanation=f"Administrator {admin.email} updated user {user.email} active status to {payload.is_active}.",
            metadata={"target_user_id": user_id, "is_active": payload.is_active},
        )
    )

    return _build_user_response(updated, container)
