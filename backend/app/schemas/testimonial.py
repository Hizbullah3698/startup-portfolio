"""
Pydantic schemas for the Testimonial resource.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, field_validator


class _TestimonialBase(BaseModel):
    client_name: str = Field(
        ..., min_length=1, max_length=255, description="Client name"
    )
    client_role: Optional[str] = Field(
        None, max_length=255, description="Client role/title"
    )
    company: Optional[str] = Field(None, max_length=255, description="Company name")
    content: str = Field(..., min_length=1, description="Testimonial content")
    rating: Optional[int] = Field(
        None, ge=1, le=5, description="Rating scale from 1 to 5"
    )
    avatar_url: Optional[str] = Field(
        None, max_length=500, description="Avatar image URL"
    )
    featured: bool = Field(False, description="Whether the testimonial is featured")
    display_order: int = Field(0, ge=0, description="Display order position (>= 0)")

    @field_validator("client_name", "content", mode="before")
    @classmethod
    def _strip_and_validate_non_empty(cls, v: str) -> str:
        if isinstance(v, str):
            v = v.strip()
        if not v:
            raise ValueError("Field cannot be blank.")
        return v

    @field_validator("client_role", "company", mode="before")
    @classmethod
    def _clean_optional_strings(cls, v: Optional[str]) -> Optional[str]:
        if v is None or v == "":
            return None
        if isinstance(v, str):
            v = v.strip()
        return v if v else None

    @field_validator("avatar_url", mode="before")
    @classmethod
    def _validate_avatar_url(cls, v: Optional[str]) -> Optional[str]:
        if v is None or v == "":
            return None
        v = v.strip()
        if not (v.startswith("http://") or v.startswith("https://")):
            raise ValueError("avatar_url must start with http:// or https://")
        return v


class TestimonialCreate(_TestimonialBase):
    pass


class TestimonialUpdate(BaseModel):
    client_name: Optional[str] = Field(None, min_length=1, max_length=255)
    client_role: Optional[str] = Field(None, max_length=255)
    company: Optional[str] = Field(None, max_length=255)
    content: Optional[str] = Field(None, min_length=1)
    rating: Optional[int] = Field(None, ge=1, le=5)
    avatar_url: Optional[str] = Field(None, max_length=500)
    featured: Optional[bool] = None
    display_order: Optional[int] = Field(None, ge=0)

    @field_validator("client_name", "content", mode="before")
    @classmethod
    def _strip_and_validate_non_empty(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        if isinstance(v, str):
            v = v.strip()
        if not v:
            raise ValueError("Field cannot be blank.")
        return v

    @field_validator("client_role", "company", mode="before")
    @classmethod
    def _clean_optional_strings(cls, v: Optional[str]) -> Optional[str]:
        if v is None or v == "":
            return None
        if isinstance(v, str):
            v = v.strip()
        return v if v else None

    @field_validator("avatar_url", mode="before")
    @classmethod
    def _validate_avatar_url(cls, v: Optional[str]) -> Optional[str]:
        if v is None or v == "":
            return None
        v = v.strip()
        if not (v.startswith("http://") or v.startswith("https://")):
            raise ValueError("avatar_url must start with http:// or https://")
        return v


class TestimonialResponse(_TestimonialBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
