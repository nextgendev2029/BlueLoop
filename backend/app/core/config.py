import os
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Central application settings loaded from environment variables and .env file.
    Follows 12-factor application design, separating configuration from code.
    """
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False
    )

    # Core Application Settings
    app_name: str = "BlueLoop"
    app_version: str = "0.1.0"
    app_env: str = "development"
    debug: bool = True
    api_v1_prefix: str = "/api/v1"

    # Server Configuration
    api_host: str = "0.0.0.0"
    api_port: int = 8000

    # CORS Settings
    cors_origins: Union[List[str], str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ]

    # Target AWS Configuration Placeholders (dormant during foundation phase)
    aws_region: str = "ap-south-1"
    aws_dynamodb_table: str = "blueloop-core-dev"
    aws_s3_bucket: str = "blueloop-quality-docs-dev"
    cognito_user_pool_id: str = "placeholder_user_pool"
    cognito_client_id: str = "placeholder_client_id"

    # Safety & Synthetic Data Mode
    use_synthetic_data: bool = True
    demo_mode: bool = True

    # Database & Authentication Persistence
    # NOTE: On AWS Lambda, /tmp/blueloop.db is used via SQLITE_DB_PATH.
    # Note that /tmp is ephemeral across Lambda container instances, serving as an
    # isolated demonstration workaround rather than persistent distributed storage.
    sqlite_db_path: str = "backend/data/blueloop.db"
    session_expiry_hours: int = 24
    session_cookie_name: str = "blueloop_session"
    session_cookie_secure: bool = False
    session_cookie_samesite: str = "lax"

    @field_validator("sqlite_db_path", mode="after")
    @classmethod
    def resolve_sqlite_path(cls, v: str) -> str:
        # Automatic fallback for AWS Lambda execution environments if SQLITE_DB_PATH is default
        if os.environ.get("AWS_LAMBDA_FUNCTION_NAME") and v == "backend/data/blueloop.db":
            return "/tmp/blueloop.db"
        return v

    @field_validator("cors_origins", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            return [i.strip() for i in v.split(",") if i.strip()]
        return v


# Singleton instance
settings = Settings()
