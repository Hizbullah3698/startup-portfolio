import re
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")


class AdminBase(BaseModel):
    username: str
    email: str = Field(..., description="Admin email address")
    is_active: bool = True

    @field_validator("email", mode="before")
    @classmethod
    def _validate_email(cls, v: str) -> str:
        if isinstance(v, str):
            v = v.strip().lower()
        if not v or not EMAIL_REGEX.match(v):
            raise ValueError("Invalid email address format.")
        return v



class AdminCreate(AdminBase):
    password: str


class AdminResponse(AdminBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


from app.schemas.contact import ContactInquiryResponse


class DashboardStatsResponse(BaseModel):
    total_projects: int
    featured_projects: int
    total_services: int
    featured_services: int
    total_testimonials: int
    total_inquiries: int
    new_inquiries: int
    recent_inquiries: list[ContactInquiryResponse]

    model_config = ConfigDict(from_attributes=True)

