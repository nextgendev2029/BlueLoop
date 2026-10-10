"""
Automated unit tests for BlueLoop service health and root endpoints.
"""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root_endpoint_returns_service_info():
    """Verify that root endpoint provides basic service metadata and links."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "BlueLoop"
    assert data["version"] == "0.1.0"
    assert "health" in data
    assert data["health"] == "/api/v1/health"


def test_health_endpoint_returns_ok_and_metadata():
    """Verify that GET /api/v1/health returns status 200 with structured status."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()

    # Verify required keys and values
    assert data["status"] == "ok"
    assert data["app_name"] == "BlueLoop"
    assert data["version"] == "0.1.0"
    assert data["environment"] == "development"
    assert data["synthetic_data_mode"] is True
    assert "timestamp" in data


def test_health_endpoint_cors_headers():
    """Verify CORS headers allow configured origin."""
    response = client.options(
        "/api/v1/health",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "GET"
        }
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:5173"
