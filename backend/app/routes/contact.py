"""
Contact Inquiry API routes.

Prefix  : /api/contact
Tag     : Contact
Auth    : NONE (Part 5 will add authentication to GET / PUT / DELETE)

Public Endpoint:
  POST /api/contact (submits new inquiry, forces status = "new")

Admin / Data Endpoints (unprotected until Part 5):
  GET /api/contact
  GET /api/contact/{inquiry_id}
  PUT /api/contact/{inquiry_id}
  DELETE /api/contact/{inquiry_id}
"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.contact import ContactInquiry, InquiryStatus
from app.schemas.contact import (
    ContactInquiryCreate,
    ContactInquiryResponse,
    ContactInquiryUpdate,
)

router = APIRouter(prefix="/api/contact", tags=["Contact"])

MAX_LIMIT = 100


def _get_inquiry_or_404(inquiry_id: int, db: Session) -> ContactInquiry:
    """Return inquiry or raise 404 — never expose DB internals."""
    inquiry = db.get(ContactInquiry, inquiry_id)
    if inquiry is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Contact inquiry with id={inquiry_id} was not found.",
        )
    return inquiry


# ---------------------------------------------------------------------------
# PUBLIC: Submit contact form
# ---------------------------------------------------------------------------
@router.post(
    "/",
    response_model=ContactInquiryResponse,
    summary="Submit Contact Inquiry",
    description=(
        "Public form endpoint to submit a contact inquiry. "
        "Status is automatically set to 'new'."
    ),
    status_code=status.HTTP_201_CREATED,
)
def create_inquiry(
    payload: ContactInquiryCreate, db: Session = Depends(get_db)
) -> ContactInquiry:
    # Visitors cannot set status — always set status to 'new'
    inquiry_data = payload.model_dump()
    inquiry_data["status"] = InquiryStatus.NEW

    inquiry = ContactInquiry(**inquiry_data)
    db.add(inquiry)
    try:
        db.commit()
        db.refresh(inquiry)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Could not submit inquiry due to a data conflict.",
        )
    return inquiry


# ---------------------------------------------------------------------------
# ADMIN/PANEL: List inquiries
# ---------------------------------------------------------------------------
@router.get(
    "/",
    response_model=list[ContactInquiryResponse],
    summary="List Contact Inquiries",
    description=(
        "Return a paginated list of contact inquiries, ordered newest first. "
        "Optionally filter by status. "
        "⚠️ Admin endpoint, will be protected by authentication in Part 5."
    ),
    status_code=status.HTTP_200_OK,
)
def list_inquiries(
    skip: int = Query(0, ge=0, description="Number of records to skip (offset)"),
    limit: int = Query(
        10, ge=1, le=MAX_LIMIT, description="Maximum number of records to return"
    ),
    status_filter: Optional[InquiryStatus] = Query(
        None,
        alias="status",
        description="Filter inquiries by status (new, read, replied, archived)",
    ),
    db: Session = Depends(get_db),
) -> list[ContactInquiry]:
    stmt = select(ContactInquiry)

    if status_filter is not None:
        stmt = stmt.where(ContactInquiry.status == status_filter)

    stmt = stmt.order_by(ContactInquiry.created_at.desc()).offset(skip).limit(limit)
    return list(db.execute(stmt).scalars().all())


# ---------------------------------------------------------------------------
# ADMIN/PANEL: Get inquiry by ID
# ---------------------------------------------------------------------------
@router.get(
    "/{inquiry_id}",
    response_model=ContactInquiryResponse,
    summary="Get Contact Inquiry",
    description=(
        "Return a single contact inquiry by its integer ID. "
        "⚠️ Admin endpoint, will be protected by authentication in Part 5."
    ),
    status_code=status.HTTP_200_OK,
)
def get_inquiry(inquiry_id: int, db: Session = Depends(get_db)) -> ContactInquiry:
    return _get_inquiry_or_404(inquiry_id, db)


# ---------------------------------------------------------------------------
# ADMIN/PANEL: Update inquiry
# ---------------------------------------------------------------------------
@router.put(
    "/{inquiry_id}",
    response_model=ContactInquiryResponse,
    summary="Update Contact Inquiry",
    description=(
        "Update status or contents of an existing inquiry. "
        "⚠️ Admin endpoint, will be protected by authentication in Part 5."
    ),
    status_code=status.HTTP_200_OK,
)
def update_inquiry(
    inquiry_id: int, payload: ContactInquiryUpdate, db: Session = Depends(get_db)
) -> ContactInquiry:
    inquiry = _get_inquiry_or_404(inquiry_id, db)

    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(inquiry, field, value)

    try:
        db.commit()
        db.refresh(inquiry)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Could not update inquiry due to a data conflict.",
        )
    return inquiry


# ---------------------------------------------------------------------------
# ADMIN/PANEL: Delete inquiry
# ---------------------------------------------------------------------------
@router.delete(
    "/{inquiry_id}",
    summary="Delete Contact Inquiry",
    description=(
        "Permanently delete a contact inquiry. "
        "⚠️ Admin endpoint, will be protected by authentication in Part 5."
    ),
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_inquiry(inquiry_id: int, db: Session = Depends(get_db)) -> None:
    inquiry = _get_inquiry_or_404(inquiry_id, db)
    db.delete(inquiry)
    db.commit()
