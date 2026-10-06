"""
SQLAlchemy ORM model for the Testimonial resource.

Table: testimonials
"""

from datetime import datetime

from sqlalchemy import Boolean, DateTime, Index, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Testimonial(Base):
    """Represents a client testimonial stored in the testimonials table."""

    __tablename__ = "testimonials"

    # Primary key
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    # Required fields
    client_name: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)

    # Optional fields
    client_role: Mapped[str | None] = mapped_column(String(255), nullable=True)
    company: Mapped[str | None] = mapped_column(String(255), nullable=True)
    rating: Mapped[int | None] = mapped_column(Integer, nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

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
        Index(
            "ix_testimonials_display_order_created_at", "display_order", "created_at"
        ),
        Index("ix_testimonials_featured", "featured"),
    )

    def __repr__(self) -> str:
        return f"<Testimonial id={self.id} client_name={self.client_name!r}>"
