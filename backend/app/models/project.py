"""
SQLAlchemy ORM model for the Project resource.

Table: projects
"""

from datetime import datetime

from sqlalchemy import JSON, Boolean, DateTime, Index, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Project(Base):
    """Represents a portfolio project stored in the projects table."""

    __tablename__ = "projects"

    # -------------------------------------------------------------------------
    # Primary key
    # -------------------------------------------------------------------------
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    # -------------------------------------------------------------------------
    # Required fields
    # -------------------------------------------------------------------------
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(
        String(255), nullable=False, unique=True, index=True
    )
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False, index=True)

    # -------------------------------------------------------------------------
    # Technology list stored as JSONB
    # Using JSON type — psycopg maps this to JSONB for PostgreSQL automatically
    # -------------------------------------------------------------------------
    technologies: Mapped[list] = mapped_column(JSON, nullable=False, default=list)

    # -------------------------------------------------------------------------
    # Optional fields
    # -------------------------------------------------------------------------
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    github_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    live_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # -------------------------------------------------------------------------
    # Status
    # -------------------------------------------------------------------------
    featured: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    # -------------------------------------------------------------------------
    # Timestamps — populated and maintained automatically
    # -------------------------------------------------------------------------
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    # -------------------------------------------------------------------------
    # Composite indexes for common query patterns
    # -------------------------------------------------------------------------
    __table_args__ = (
        Index("ix_projects_category_created_at", "category", "created_at"),
        Index("ix_projects_featured", "featured"),
    )

    def __repr__(self) -> str:
        return f"<Project id={self.id} slug={self.slug!r}>"
