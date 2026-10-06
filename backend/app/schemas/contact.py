"""
Pydantic schemas for the Contact Inquiry resource.
"""

import re
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, field_validator

from app.models.contact import InquiryStatus

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")


class _ContactBase(BaseModel):
    name: str = Field(
        ..., min_length=1, max_length=255, description="Sender's full name"
    )
    email: str = Field(
        ..., min_length=3, max_length=255, description="Sender's email address"
    )
    subject: str = Field(
        ..., min_length=1, max_length=255, description="Inquiry subject"
    )
    message: str = Field(..., min_length=1, description="Inquiry message body")

    @field_validator("name", "subject", "message", mode="before")
    @classmethod
    def _strip_and_validate_non_empty(cls, v: str) -> str:
        if isinstance(v, str):
            v = v.strip()
        if not v:
            raise ValueError("Field cannot be blank.")
        return v

    @field_validator("email", mode="before")
    @classmethod
    def _validate_email(cls, v: str) -> str:
        if isinstance(v, str):
            v = v.strip().lower()
        if not v or not EMAIL_REGEX.match(v):
            raise ValueError("Invalid email address format.")
        return v


class ContactInquiryCreate(_ContactBase):
    """
    Public contact form submission schema.
    Visitor CANNOT set status — it defaults automatically to 'new'.
    """

    pass


class ContactInquiryUpdate(BaseModel):
    """
    Admin update schema for managing inquiries.
    Allows updating status, as well as text fields if necessary.
    """

    status: Optional[InquiryStatus] = Field(None, description="Inquiry status")
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    email: Optional[str] = Field(None, min_length=3, max_length=255)
    subject: Optional[str] = Field(None, min_length=1, max_length=255)
    message: Optional[str] = Field(None, min_length=1)

    @field_validator("name", "subject", "message", mode="before")
    @classmethod
    def _strip_and_validate_non_empty(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        if isinstance(v, str):
            v = v.strip()
        if not v:
            raise ValueError("Field cannot be blank.")
        return v

    @field_validator("email", mode="before")
    @classmethod
    def _validate_email(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        if isinstance(v, str):
            v = v.strip().lower()
        if not v or not EMAIL_REGEX.match(v):
            raise ValueError("Invalid email address format.")
        return v


class ContactInquiryResponse(_ContactBase):
    id: int
    status: InquiryStatus
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
