"""
Service CRUD API routes.

Prefix  : /api/services
Tag     : Services
Auth    : NONE (Part 5 will add authentication)

⚠️  SECURITY WARNING — Part 5 is NOT yet implemented.
    POST / PUT / DELETE are currently unprotected.
    Do NOT expose this backend publicly until Part 5 authentication is in place.
"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.security import get_current_admin
from app.models.admin import Admin
from app.models.service import Service
from app.schemas.service import ServiceCreate, ServiceResponse, ServiceUpdate

router = APIRouter(prefix="/api/services", tags=["Services"])

MAX_LIMIT = 100


def _get_service_or_404(service_id: int, db: Session) -> Service:
    """Return service or raise 404 — never expose DB internals."""
    service = db.get(Service, service_id)
    if service is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Service with id={service_id} was not found.",
        )
    return service


def _slug_exists(slug: str, db: Session, exclude_id: Optional[int] = None) -> bool:
    """Check if a slug is already used by another service."""
    stmt = select(Service).where(Service.slug == slug)
    if exclude_id is not None:
        stmt = stmt.where(Service.id != exclude_id)
    return db.execute(stmt).scalar_one_or_none() is not None


@router.get(
    "/",
    response_model=list[ServiceResponse],
    summary="List Services",
    description=(
        "Return a paginated list of services, ordered by display_order ascending, "
        "then created_at descending. Optionally filter by featured."
    ),
    status_code=status.HTTP_200_OK,
)
def list_services(
    skip: int = Query(0, ge=0, description="Number of records to skip (offset)"),
    limit: int = Query(
        10, ge=1, le=MAX_LIMIT, description="Maximum number of records to return"
    ),
    featured: Optional[bool] = Query(
        None, description="Filter services by featured status"
    ),
    db: Session = Depends(get_db),
) -> list[Service]:
    stmt = select(Service)

    if featured is not None:
        stmt = stmt.where(Service.featured == featured)

    stmt = (
        stmt.order_by(Service.display_order.asc(), Service.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return list(db.execute(stmt).scalars().all())


@router.get(
    "/{service_id}",
    response_model=ServiceResponse,
    summary="Get Service",
    description="Return a single service by its integer ID.",
    status_code=status.HTTP_200_OK,
)
def get_service(service_id: int, db: Session = Depends(get_db)) -> Service:
    return _get_service_or_404(service_id, db)


@router.post(
    "/",
    response_model=ServiceResponse,
    summary="Create Service",
    description=(
        "Create a new service. "
        "⚠️ Unprotected until Part 5 authentication is implemented."
    ),
    status_code=status.HTTP_201_CREATED,
)
def create_service(
    payload: ServiceCreate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
) -> Service:
    if _slug_exists(payload.slug, db):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A service with slug '{payload.slug}' already exists.",
        )

    service = Service(**payload.model_dump())
    db.add(service)
    try:
        db.commit()
        db.refresh(service)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Could not create service due to a data conflict.",
        )
    return service


@router.put(
    "/{service_id}",
    response_model=ServiceResponse,
    summary="Update Service",
    description=(
        "Partially or fully update an existing service. "
        "⚠️ Unprotected until Part 5 authentication is implemented."
    ),
    status_code=status.HTTP_200_OK,
)
def update_service(
    service_id: int,
    payload: ServiceUpdate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
) -> Service:
    service = _get_service_or_404(service_id, db)

    updates = payload.model_dump(exclude_unset=True)

    if "slug" in updates and updates["slug"] != service.slug:
        if _slug_exists(updates["slug"], db, exclude_id=service_id):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"A service with slug '{updates['slug']}' already exists.",
            )

    for field, value in updates.items():
        setattr(service, field, value)

    try:
        db.commit()
        db.refresh(service)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Could not update service due to a data conflict.",
        )
    return service


@router.delete(
    "/{service_id}",
    summary="Delete Service",
    description=(
        "Permanently delete a service. "
        "⚠️ Unprotected until Part 5 authentication is implemented."
    ),
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_service(
    service_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
) -> None:
    service = _get_service_or_404(service_id, db)
    db.delete(service)
    db.commit()
