"""
FastAPI application — entry point.

Exposes:
  GET /             Root status
  GET /api/health   Application health (no DB dependency)
  GET /api/db-health  Database connectivity check
"""

from typing import Dict

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import check_db_connection
from app.routes.contact import router as contact_router
from app.routes.projects import router as projects_router
from app.routes.services import router as services_router
from app.routes.testimonials import router as testimonials_router

# ---------------------------------------------------------------------------
# App metadata
# ---------------------------------------------------------------------------
TITLE = "Freelance Agency Portfolio API"
VERSION = "1.0.0"
DESCRIPTION = (
    "FastAPI backend for powering a dynamic freelancing and agency portfolio platform."
)

app = FastAPI(
    title=TITLE,
    version=VERSION,
    description=DESCRIPTION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# ---------------------------------------------------------------------------
# CORS Middleware
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins_list(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


from app.routes.admin import router as admin_router
from app.routes.auth import router as auth_router

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(projects_router)
app.include_router(services_router)
app.include_router(testimonials_router)
app.include_router(contact_router)



# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.get("/", summary="Root Endpoint", tags=["Root"])
def read_root() -> Dict[str, str]:
    """Root endpoint confirming that the backend application is running."""
    return {
        "title": TITLE,
        "version": VERSION,
        "status": "online",
        "message": "Welcome to the Freelance Agency Portfolio API backend.",
        "documentation": "/docs",
    }


@app.get("/api/health", summary="Application Health Check", tags=["Health"])
def health_check() -> Dict[str, str]:
    """
    Lightweight health check — does NOT require a database connection.
    Used by load balancers and deployment monitors.
    """
    return {
        "status": "ok",
        "message": "Backend is running",
    }


@app.get("/api/db-health", summary="Database Connectivity Check", tags=["Health"])
def db_health_check() -> Dict[str, object]:
    """
    Verify that the API can reach PostgreSQL.

    Returns status only — no credentials or internal details are exposed.
    """
    result = check_db_connection()
    return {
        "database": "postgresql",
        "connected": result["connected"],
        "detail": result["detail"],
    }


# ---------------------------------------------------------------------------
# Dev entry-point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=True,
    )
