"""
Pydantic schemas for the Service resource.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, field_validator


class _ServiceBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255, description="Service title")
    slug: str = Field(
        ...,
        min_length=1,
        max_length=255,
        pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$",
        description="URL-friendly slug (lowercase letters, digits, hyphens)",
    )
    description: str = Field(..., min_length=1, description="Full service description")
    icon: Optional[str] = Field(None, max_length=100, description="Icon name or URL")
    featured: bool = Field(False, description="Whether the service is featured")
    display_order: int = Field(0, ge=0, description="Display order position (>= 0)")

    @field_validator("title", "slug", "description", mode="before")
    @classmethod
    def _strip_and_validate_non_empty(cls, v: str) -> str:
        if isinstance(v, str):
            v = v.strip()
        if not v:
            raise ValueError("Field cannot be blank.")
        return v

    @field_validator("icon", mode="before")
    @classmethod
    def _clean_icon(cls, v: Optional[str]) -> Optional[str]:
        if v is None or v == "":
            return None
        if isinstance(v, str):
            v = v.strip()
        return v if v else None


class ServiceCreate(_ServiceBase):
    pass


class ServiceUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    slug: Optional[str] = Field(
        None,
        min_length=1,
        max_length=255,
        pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$",
    )
    description: Optional[str] = Field(None, min_length=1)
    icon: Optional[str] = Field(None, max_length=100)
    featured: Optional[bool] = None
    display_order: Optional[int] = Field(None, ge=0)

    @field_validator("title", "slug", "description", mode="before")
    @classmethod
    def _strip_and_validate_non_empty(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        if isinstance(v, str):
            v = v.strip()
        if not v:
            raise ValueError("Field cannot be blank.")
        return v

    @field_validator("icon", mode="before")
    @classmethod
    def _clean_icon(cls, v: Optional[str]) -> Optional[str]:
        if v is None or v == "":
            return None
        if isinstance(v, str):
            v = v.strip()
        return v if v else None


class ServiceResponse(_ServiceBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
