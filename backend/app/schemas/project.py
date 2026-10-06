"""
Pydantic schemas for the Project resource.

Separates request (input) and response (output) shapes.
Never expose the ORM model object directly from a route.
"""

from datetime import datetime
from typing import Optional

from pydantic import AnyHttpUrl, BaseModel, Field, field_validator


# ---------------------------------------------------------------------------
# Shared base — fields common to both create and update
# ---------------------------------------------------------------------------
class _ProjectBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255, description="Project title")
    slug: str = Field(
        ...,
        min_length=1,
        max_length=255,
        pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$",
        description="URL-friendly slug (lowercase letters, digits, hyphens)",
    )
    description: str = Field(..., min_length=1, description="Full project description")
    category: str = Field(
        ..., min_length=1, max_length=100, description="Project category"
    )
    technologies: list[str] = Field(
        default_factory=list, description="List of technology names used in the project"
    )
    image_url: Optional[str] = Field(None, description="URL to the project cover image")
    github_url: Optional[str] = Field(None, description="GitHub repository URL")
    live_url: Optional[str] = Field(None, description="Live demo URL")
    featured: bool = Field(False, description="Whether the project is featured")

    # -----------------------------------------------------------------------
    # Validators
    # -----------------------------------------------------------------------
    @field_validator("title", "description", "category", mode="before")
    @classmethod
    def _strip_strings(cls, v: str) -> str:
        if isinstance(v, str):
            v = v.strip()
        if not v:
            raise ValueError("Field cannot be blank.")
        return v

    @field_validator("technologies", mode="before")
    @classmethod
    def _validate_technologies(cls, v: list) -> list:
        if not isinstance(v, list):
            raise ValueError("technologies must be a list of strings.")
        for item in v:
            if not isinstance(item, str):
                raise ValueError("Each technology must be a string.")
        return [t.strip() for t in v if t.strip()]

    @field_validator("image_url", "github_url", "live_url", mode="before")
    @classmethod
    def _validate_urls(cls, v: Optional[str]) -> Optional[str]:
        if v is None or v == "":
            return None
        # Basic URL presence check — AnyHttpUrl is used only in strict contexts
        v = v.strip()
        if not (v.startswith("http://") or v.startswith("https://")):
            raise ValueError("URL must start with http:// or https://")
        return v


# ---------------------------------------------------------------------------
# Create request — all fields required except optionals
# ---------------------------------------------------------------------------
class ProjectCreate(_ProjectBase):
    pass


# ---------------------------------------------------------------------------
# Update request — every field is optional for partial updates
# ---------------------------------------------------------------------------
class ProjectUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    slug: Optional[str] = Field(
        None,
        min_length=1,
        max_length=255,
        pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$",
    )
    description: Optional[str] = Field(None, min_length=1)
    category: Optional[str] = Field(None, min_length=1, max_length=100)
    technologies: Optional[list[str]] = None
    image_url: Optional[str] = None
    github_url: Optional[str] = None
    live_url: Optional[str] = None
    featured: Optional[bool] = None

    @field_validator("title", "description", "category", mode="before")
    @classmethod
    def _strip_strings(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.strip()
        if not v:
            raise ValueError("Field cannot be blank.")
        return v

    @field_validator("technologies", mode="before")
    @classmethod
    def _validate_technologies(cls, v: Optional[list]) -> Optional[list]:
        if v is None:
            return v
        if not isinstance(v, list):
            raise ValueError("technologies must be a list of strings.")
        for item in v:
            if not isinstance(item, str):
                raise ValueError("Each technology must be a string.")
        return [t.strip() for t in v if t.strip()]

    @field_validator("image_url", "github_url", "live_url", mode="before")
    @classmethod
    def _validate_urls(cls, v: Optional[str]) -> Optional[str]:
        if v is None or v == "":
            return None
        v = v.strip()
        if not (v.startswith("http://") or v.startswith("https://")):
            raise ValueError("URL must start with http:// or https://")
        return v


# ---------------------------------------------------------------------------
# Response — output shape (includes DB-generated fields)
# ---------------------------------------------------------------------------
class ProjectResponse(_ProjectBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}  # Enables ORM mode (SQLAlchemy → Pydantic)
