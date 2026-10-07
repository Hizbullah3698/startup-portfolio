"""
Testimonials CRUD API routes.

Prefix  : /api/testimonials
Tag     : Testimonials
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

from app.core.security import get_current_admin
from app.database import get_db
from app.models.admin import Admin
from app.models.testimonial import Testimonial
from app.schemas.testimonial import (
    TestimonialCreate,
    TestimonialResponse,
    TestimonialUpdate,
)

router = APIRouter(prefix="/api/testimonials", tags=["Testimonials"])

MAX_LIMIT = 100


def _get_testimonial_or_404(testimonial_id: int, db: Session) -> Testimonial:
    """Return testimonial or raise 404 — never expose DB internals."""
    testimonial = db.get(Testimonial, testimonial_id)
    if testimonial is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Testimonial with id={testimonial_id} was not found.",
        )
    return testimonial


@router.get(
    "/",
    response_model=list[TestimonialResponse],
    summary="List Testimonials",
    description=(
        "Return a paginated list of testimonials, ordered by display_order ascending, "
        "then created_at descending. Optionally filter by featured."
    ),
    status_code=status.HTTP_200_OK,
)
def list_testimonials(
    skip: int = Query(0, ge=0, description="Number of records to skip (offset)"),
    limit: int = Query(
        10, ge=1, le=MAX_LIMIT, description="Maximum number of records to return"
    ),
    featured: Optional[bool] = Query(None, description="Filter by featured status"),
    db: Session = Depends(get_db),
) -> list[Testimonial]:
    stmt = select(Testimonial)

    if featured is not None:
        stmt = stmt.where(Testimonial.featured == featured)

    stmt = (
        stmt.order_by(Testimonial.display_order.asc(), Testimonial.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return list(db.execute(stmt).scalars().all())


@router.get(
    "/{testimonial_id}",
    response_model=TestimonialResponse,
    summary="Get Testimonial",
    description="Return a single testimonial by its integer ID.",
    status_code=status.HTTP_200_OK,
)
def get_testimonial(testimonial_id: int, db: Session = Depends(get_db)) -> Testimonial:
    return _get_testimonial_or_404(testimonial_id, db)


@router.post(
    "/",
    response_model=TestimonialResponse,
    summary="Create Testimonial",
    description=(
        "Create a new testimonial. "
        "⚠️ Unprotected until Part 5 authentication is implemented."
    ),
    status_code=status.HTTP_201_CREATED,
)
def create_testimonial(
    payload: TestimonialCreate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
) -> Testimonial:
    testimonial = Testimonial(**payload.model_dump())
    db.add(testimonial)
    try:
        db.commit()
        db.refresh(testimonial)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Could not create testimonial due to a data conflict.",
        )
    return testimonial


@router.put(
    "/{testimonial_id}",
    response_model=TestimonialResponse,
    summary="Update Testimonial",
    description=(
        "Partially or fully update an existing testimonial. "
        "⚠️ Unprotected until Part 5 authentication is implemented."
    ),
    status_code=status.HTTP_200_OK,
)
def update_testimonial(
    testimonial_id: int,
    payload: TestimonialUpdate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
) -> Testimonial:
    testimonial = _get_testimonial_or_404(testimonial_id, db)

    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(testimonial, field, value)

    try:
        db.commit()
        db.refresh(testimonial)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Could not update testimonial due to a data conflict.",
        )
    return testimonial


@router.delete(
    "/{testimonial_id}",
    summary="Delete Testimonial",
    description=(
        "Permanently delete a testimonial. "
        "⚠️ Unprotected until Part 5 authentication is implemented."
    ),
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_testimonial(
    testimonial_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
) -> None:
    testimonial = _get_testimonial_or_404(testimonial_id, db)
    db.delete(testimonial)
    db.commit()
