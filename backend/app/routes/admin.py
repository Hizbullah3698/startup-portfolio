"""
Admin Dashboard API routes.

Prefix: /api/admin
Tag: Admin
Auth: Protected (requires valid admin Bearer token)
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.security import get_current_admin
from app.database import get_db
from app.models.admin import Admin
from app.models.contact import ContactInquiry, InquiryStatus
from app.models.project import Project
from app.models.service import Service
from app.models.testimonial import Testimonial
from app.schemas.admin import DashboardStatsResponse

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get(
    "/stats",
    response_model=DashboardStatsResponse,
    summary="Get Dashboard Statistics",
    description="Returns aggregate KPI counts and recent contact inquiries for the admin dashboard overview.",
    status_code=status.HTTP_200_OK,
)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
) -> DashboardStatsResponse:
    total_projects = db.query(func.count(Project.id)).scalar() or 0
    featured_projects = (
        db.query(func.count(Project.id)).filter(Project.featured.is_(True)).scalar() or 0
    )

    total_services = db.query(func.count(Service.id)).scalar() or 0
    featured_services = (
        db.query(func.count(Service.id)).filter(Service.featured.is_(True)).scalar() or 0
    )

    total_testimonials = db.query(func.count(Testimonial.id)).scalar() or 0

    total_inquiries = db.query(func.count(ContactInquiry.id)).scalar() or 0
    new_inquiries = (
        db.query(func.count(ContactInquiry.id))
        .filter(ContactInquiry.status == InquiryStatus.NEW)
        .scalar()
        or 0
    )

    recent_inquiries = (
        db.query(ContactInquiry)
        .order_by(ContactInquiry.created_at.desc())
        .limit(5)
        .all()
    )

    return DashboardStatsResponse(
        total_projects=total_projects,
        featured_projects=featured_projects,
        total_services=total_services,
        featured_services=featured_services,
        total_testimonials=total_testimonials,
        total_inquiries=total_inquiries,
        new_inquiries=new_inquiries,
        recent_inquiries=recent_inquiries,
    )
