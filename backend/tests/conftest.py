"""
BlueLoop Automated Test Configuration & Client Fixtures
"""

from datetime import datetime, timezone, timedelta
import pytest
from fastapi.testclient import TestClient

from app.core.config import settings
from app.core.seeds import seed_demonstration_data
from app.db.sqlite import init_db
from app.main import create_application
from app.repositories.memory import get_repository_container

ADMIN_TEST_TOKEN = "blueloop-test-admin-token"


@pytest.fixture(scope="session", autouse=True)
def initialize_test_database():
    """Initializes database schema, seed fixtures, and global test admin session."""
    init_db()
    container = get_repository_container()
    seed_demonstration_data(container)

    admin = container.users.get_by_email("admin@blueloop.io")
    if admin:
        container.sessions.create_session(
            ADMIN_TEST_TOKEN,
            admin.id,
            datetime.now(timezone.utc) + timedelta(days=7),
        )
    return container


def create_authenticated_client(email: str, token: str) -> TestClient:
    """Helper creating a TestClient authenticated with a real session for the given user email."""
    app = create_application()
    client = TestClient(app)
    container = get_repository_container()
    user = container.users.get_by_email(email)
    assert user is not None, f"User {email} not found in database for test fixture."

    expires_at = datetime.now(timezone.utc) + timedelta(days=1)
    container.sessions.create_session(token, user.id, expires_at)
    client.cookies.set(settings.session_cookie_name, token)
    return client


@pytest.fixture
def admin_client() -> TestClient:
    return create_authenticated_client("admin@blueloop.io", "test-admin-session-token-fixture")


@pytest.fixture
def buyer_client() -> TestClient:
    return create_authenticated_client("buyer@blueloop.io", "test-buyer-session-token-fixture")


@pytest.fixture
def supplier_client() -> TestClient:
    return create_authenticated_client("supplier@blueloop.io", "test-supplier-session-token-fixture")


@pytest.fixture
def unauthenticated_client() -> TestClient:
    app = create_application()
    return TestClient(app)
