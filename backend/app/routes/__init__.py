"""API routes package."""

from app.routes.contact import router as contact_router
from app.routes.projects import router as projects_router
from app.routes.services import router as services_router
from app.routes.testimonials import router as testimonials_router

__all__ = [
    "projects_router",
    "services_router",
    "testimonials_router",
    "contact_router",
]
