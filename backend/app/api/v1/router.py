"""
BlueLoop API v1 Router Aggregator
"""

from fastapi import APIRouter
from app.api.v1.endpoints import compatibility, demands, health, suppliers, supplies

api_v1_router = APIRouter()

# Mount API Routers
api_v1_router.include_router(health.router, tags=["Health"])
api_v1_router.include_router(suppliers.router, prefix="/suppliers", tags=["Suppliers"])
api_v1_router.include_router(supplies.router, prefix="/supplies", tags=["Supply Listings"])
api_v1_router.include_router(demands.router, prefix="/demands", tags=["Demand Requests"])
api_v1_router.include_router(
    compatibility.router, prefix="/compatibility", tags=["Quality Compatibility"]
)
