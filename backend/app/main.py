"""
BlueLoop - Water Reuse Intelligence & Procurement Optimisation Platform
Backend Application Entry Point
"""

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from mangum import Mangum

from app.api.v1.router import api_v1_router
from app.core.config import settings
from app.core.errors import BlueLoopError, EntityNotFoundError, InvalidConstraintError
from app.core.seeds import seed_demonstration_data
from app.db.sqlite import init_db


def create_application() -> FastAPI:
    """
    Application factory initializing FastAPI with configuration,
    CORS middleware, error handling, seed fixtures, and routing.
    """
    application = FastAPI(
        title=f"{settings.app_name} API",
        version=settings.app_version,
        description=(
            "Water Reuse Intelligence and Procurement Optimisation Platform API. "
            "Evaluates quality compatibility, optimizes supply allocation, and provides "
            "transparent procurement auditing."
        ),
        docs_url="/docs" if settings.debug else None,
        redoc_url="/redoc" if settings.debug else None,
        openapi_url=f"{settings.api_v1_prefix}/openapi.json" if settings.debug else None,
    )

    # Configure Cross-Origin Resource Sharing (CORS)
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["*"],
    )

    # Initialize durable SQLite persistence layer
    init_db()

    # Seed demonstration fixtures for local MVP
    if settings.use_synthetic_data:
        seed_demonstration_data(force_reset=False)

    # Domain error handlers
    @application.exception_handler(EntityNotFoundError)
    async def entity_not_found_handler(request: Request, exc: EntityNotFoundError) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={
                "error": "EntityNotFound",
                "message": exc.message,
                "details": exc.details,
                "path": request.url.path,
            },
        )

    @application.exception_handler(InvalidConstraintError)
    async def invalid_constraint_handler(request: Request, exc: InvalidConstraintError) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "error": "InvalidConstraint",
                "message": exc.message,
                "details": exc.details,
                "path": request.url.path,
            },
        )

    @application.exception_handler(BlueLoopError)
    async def blueloop_error_handler(request: Request, exc: BlueLoopError) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "error": "DomainError",
                "message": exc.message,
                "details": exc.details,
                "path": request.url.path,
            },
        )

    @application.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
        error_type = "ClientError"
        if exc.status_code == 404:
            error_type = "ResourceNotFound"
        elif exc.status_code == 400:
            error_type = "BadRequest"
        elif exc.status_code == 422:
            error_type = "UnprocessableEntity"

        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": error_type,
                "message": str(exc.detail),
                "detail": exc.detail,
                "path": request.url.path,
            },
            headers=exc.headers,
        )

    @application.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "error": "ValidationError",
                "message": "Request validation failed. Verify parameters and payload structure.",
                "detail": exc.errors(),
                "path": request.url.path,
            },
        )

    # Standardized unhandled exception handler
    @application.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": "InternalServerError",
                "message": "An unexpected error occurred while processing the request.",
                "path": request.url.path,
            },
        )

    # Root informational route
    @application.get(
        "/",
        summary="Service Root",
        tags=["System"],
        include_in_schema=False,
    )
    async def root():
        return {
            "name": settings.app_name,
            "version": settings.app_version,
            "description": "Water Reuse Intelligence and Procurement Optimisation Platform",
            "health": f"{settings.api_v1_prefix}/health",
            "docs": "/docs" if settings.debug else "disabled in current mode",
        }

    # Mount API v1 router
    application.include_router(api_v1_router, prefix=settings.api_v1_prefix)

    return application


app = create_application()

# AWS Lambda Handler (ASGI adapter for serverless deployment)
handler = Mangum(app, lifespan="off")

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.debug,
    )
