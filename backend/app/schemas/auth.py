"""
BlueLoop Authentication & Authorization Schemas
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class SignupRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: str = Field(..., min_length=2, max_length=100, description="Full name of operator")
    email: str = Field(..., description="Corporate email address")
    password: str = Field(..., min_length=8, max_length=128, description="Secure account password")
    org_name: str = Field(..., min_length=2, max_length=120, description="Legal company or facility name")
    role: str = Field(..., description="Self-registration role: 'buyer' or 'supplier'")


class LoginRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    email: str = Field(..., description="Login email address")
    password: str = Field(..., description="Account password")


class OrganisationSummary(BaseModel):
    id: str
    name: str
    org_type: str
    verification_status: str
    contact_email: Optional[str] = None
    is_synthetic: bool = False


class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    org_id: str
    org_name: Optional[str] = None
    org_type: Optional[str] = None
    is_active: bool
    email_verified: bool = Field(
        default=False,
        description="Truthful disclosure: Email verification is not configured in this demonstration environment.",
    )
    created_at: datetime


class AuthResponse(BaseModel):
    token: str
    token_type: str = "bearer"
    user: UserResponse
    message: str = "Authenticated successfully"


class UpdateUserStatusRequest(BaseModel):
    is_active: bool = Field(..., description="Target active status for user account")
