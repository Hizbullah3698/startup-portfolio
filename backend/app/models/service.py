"""
SQLAlchemy ORM model for the Service resource.

Table: services
"""

from datetime import datetime

from sqlalchemy import Boolean, DateTime, Index, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Service(Base):
    """Represents a service offered in the portfolio."""

    __tablename__ = "services"

    # Primary key
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    # Required fields
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(
        String(255), nullable=False, unique=True, index=True
    )
    description: Mapped[str] = mapped_column(Text, nullable=False)

    # Optional fields
    icon: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # Status & Ordering
    featured: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    display_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    # Timestamps
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

    __table_args__ = (
        Index("ix_services_display_order_created_at", "display_order", "created_at"),
        Index("ix_services_featured", "featured"),
    )

    def __repr__(self) -> str:
        return f"<Service id={self.id} slug={self.slug!r}>"
