"""
SQLAlchemy ORM model for Contact Inquiries.

Table: contact_inquiries
"""

from datetime import datetime
from enum import Enum

from sqlalchemy import DateTime, Enum as SQLEnum, Index, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class InquiryStatus(str, Enum):
    NEW = "new"
    READ = "read"
    REPLIED = "replied"
    ARCHIVED = "archived"


class ContactInquiry(Base):
    """Represents a contact form submission / client inquiry."""

    __tablename__ = "contact_inquiries"

    # Primary key
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    # Required fields
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    subject: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)

    # Status field with default "new"
    status: Mapped[InquiryStatus] = mapped_column(
        SQLEnum(
            InquiryStatus,
            native_enum=False,
            values_callable=lambda obj: [e.value for e in obj],
        ),
        nullable=False,
        default=InquiryStatus.NEW,
        server_default=InquiryStatus.NEW.value,
    )

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
        Index("ix_contact_inquiries_status_created_at", "status", "created_at"),
    )

    def __repr__(self) -> str:
        return (
            f"<ContactInquiry id={self.id} email={self.email!r} status={self.status}>"
        )
