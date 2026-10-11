"""
BlueLoop Security & Cryptography Utilities
Implements robust password hashing using PBKDF2-HMAC-SHA256 (OWASP compliant),
constant-time digest verification, strength validation, and secure session tokens.
"""

import base64
from datetime import timedelta
import hashlib
import hmac
import json
import re
import secrets
import time
from typing import Any, Dict, Optional, Tuple

from app.core.config import settings

PBKDF2_ALGORITHM = "sha256"
PBKDF2_ITERATIONS = 600000  # OWASP 2023 recommended iterations for PBKDF2-HMAC-SHA256
SALT_BYTE_LENGTH = 16

EMAIL_REGEX = re.compile(
    r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
)

# Common trivial passwords to reject
COMMON_PASSWORDS = {
    "password", "password123", "password123!", "12345678", "123456789",
    "qwerty", "qwerty123", "admin", "admin123", "admin123!", "welcome123"
}


def hash_password(plain_password: str) -> str:
    """
    Hash plaintext password using PBKDF2-HMAC-SHA256 with a unique random salt.
    Format: pbkdf2_sha256$<iterations>$<salt_hex>$<hash_hex>
    """
    salt = secrets.token_bytes(SALT_BYTE_LENGTH)
    key = hashlib.pbkdf2_hmac(
        hash_name=PBKDF2_ALGORITHM,
        password=plain_password.encode("utf-8"),
        salt=salt,
        iterations=PBKDF2_ITERATIONS,
    )
    return f"pbkdf2_{PBKDF2_ALGORITHM}${PBKDF2_ITERATIONS}${salt.hex()}${key.hex()}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify plaintext password against PBKDF2 hashed password using constant-time comparison.
    """
    try:
        parts = hashed_password.split("$")
        if len(parts) != 4:
            return False
        algo, iterations_str, salt_hex, key_hex = parts
        if algo != f"pbkdf2_{PBKDF2_ALGORITHM}":
            return False
        iterations = int(iterations_str)
        salt = bytes.fromhex(salt_hex)
        expected_key = bytes.fromhex(key_hex)

        computed_key = hashlib.pbkdf2_hmac(
            hash_name=PBKDF2_ALGORITHM,
            password=plain_password.encode("utf-8"),
            salt=salt,
            iterations=iterations,
        )
        return hmac.compare_digest(computed_key, expected_key)
    except Exception:
        return False


def validate_email_format(email: str) -> Tuple[bool, str]:
    """Validate RFC-compliant email address structure."""
    clean = email.strip()
    if not clean:
        return False, "Email address is required."
    if len(clean) > 254:
        return False, "Email address is too long."
    if not EMAIL_REGEX.match(clean):
        return False, "Invalid email address format."
    return True, ""


def validate_password_strength(password: str) -> Tuple[bool, str]:
    """
    Validate password complexity:
    - Minimum 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one digit or special character
    - Not in trivial common passwords list
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long."
    if len(password) > 128:
        return False, "Password cannot exceed 128 characters."
    if password.lower() in COMMON_PASSWORDS:
        return False, "Password is too common or easily guessable."
    if not re.search(r"[A-Z]", password):
        return False, "Password must contain at least one uppercase letter."
    if not re.search(r"[a-z]", password):
        return False, "Password must contain at least one lowercase letter."
    if not re.search(r"[\d\W_]", password):
        return False, "Password must contain at least one digit or symbol."
    return True, ""


def generate_session_token() -> str:
    """Generate a high-entropy URL-safe session token (256 bits)."""
    return secrets.token_urlsafe(32)


def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode("utf-8").rstrip("=")


def _b64url_decode(data: str) -> bytes:
    padding = "=" * (4 - (len(data) % 4)) if len(data) % 4 != 0 else ""
    return base64.urlsafe_b64decode((data + padding).encode("utf-8"))


def create_access_token(
    user_id: str,
    email: str,
    role: str,
    org_id: str,
    name: Optional[str] = None,
    expires_delta: Optional[timedelta] = None,
    secret_key: Optional[str] = None,
) -> str:
    """
    Generate a cryptographically signed HMAC-SHA256 stateless session token (JWT).
    Allows instantaneous, multi-container validation across distributed serverless Lambda instances.
    """
    key = secret_key or settings.secret_key
    now = int(time.time())
    if expires_delta:
        exp = now + int(expires_delta.total_seconds())
    else:
        exp = now + (settings.session_expiry_hours * 3600)

    header = {"alg": "HS256", "typ": "JWT"}
    payload: Dict[str, Any] = {
        "sub": user_id,
        "email": email,
        "role": role,
        "org_id": org_id,
        "name": name or "",
        "iat": now,
        "exp": exp,
    }

    header_b64 = _b64url_encode(json.dumps(header, separators=(",", ":")).encode("utf-8"))
    payload_b64 = _b64url_encode(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
    signing_input = f"{header_b64}.{payload_b64}".encode("utf-8")
    sig = hmac.new(key.encode("utf-8"), signing_input, hashlib.sha256).digest()
    sig_b64 = _b64url_encode(sig)

    return f"{header_b64}.{payload_b64}.{sig_b64}"


def verify_access_token(token: str, secret_key: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """
    Verify HMAC-SHA256 signature and expiration of a stateless session token.
    Returns decoded claims dict if valid and unexpired; None otherwise.
    """
    if not token or not isinstance(token, str):
        return None
    parts = token.strip().split(".")
    if len(parts) != 3:
        return None
    header_b64, payload_b64, sig_b64 = parts
    key = secret_key or settings.secret_key
    signing_input = f"{header_b64}.{payload_b64}".encode("utf-8")
    expected_sig = hmac.new(key.encode("utf-8"), signing_input, hashlib.sha256).digest()
    try:
        actual_sig = _b64url_decode(sig_b64)
    except Exception:
        return None
    if not hmac.compare_digest(expected_sig, actual_sig):
        return None
    try:
        payload_bytes = _b64url_decode(payload_b64)
        payload = json.loads(payload_bytes.decode("utf-8"))
    except Exception:
        return None
    exp = payload.get("exp")
    if exp is not None and time.time() > exp:
        return None
    return payload
