"""
Database engine, session factory, and declarative base.

Provides:
  - engine          : SQLAlchemy Engine connected to PostgreSQL
  - SessionLocal    : Session factory for use in FastAPI dependencies
  - Base            : Declarative base for all ORM models (Part 3+)
  - get_db()        : FastAPI dependency that yields a database session
  - check_db_connection() : Lightweight connectivity probe (SELECT 1)
"""

from collections.abc import Generator

from sqlalchemy import create_engine, text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import settings


# ---------------------------------------------------------------------------
# Engine
# ---------------------------------------------------------------------------
def _build_engine():
    """Create the SQLAlchemy engine only when DATABASE_URL is configured."""
    url = settings.database_url
    if not url:
        return None

    return create_engine(
        url,
        pool_pre_ping=True,  # Drop stale connections before using them
        pool_size=5,
        max_overflow=10,
        echo=settings.environment == "development",  # SQL logging in dev only
    )


engine = _build_engine()

# ---------------------------------------------------------------------------
# Session factory
# ---------------------------------------------------------------------------
SessionLocal: sessionmaker | None = (
    sessionmaker(autocommit=False, autoflush=False, bind=engine)
    if engine is not None
    else None
)


# ---------------------------------------------------------------------------
# Declarative base — all ORM models will inherit from this (Part 3+)
# ---------------------------------------------------------------------------
class Base(DeclarativeBase):
    pass


# ---------------------------------------------------------------------------
# FastAPI session dependency
# ---------------------------------------------------------------------------
def get_db() -> Generator[Session, None, None]:
    """
    Yield a database session for a single request, then close it.

    Usage in a route:
        db: Session = Depends(get_db)
    """
    if SessionLocal is None:
        raise RuntimeError("DATABASE_URL is not configured. Check your .env file.")
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------------------------------------------------------------------
# Connectivity probe
# ---------------------------------------------------------------------------
def check_db_connection() -> dict:
    """
    Execute 'SELECT 1' to verify the database is reachable.

    Returns a dict with keys:
        connected (bool), detail (str)

    Never raises — always returns a safe response so callers can decide
    how to surface the result without leaking stack traces.
    """
    if engine is None:
        return {
            "connected": False,
            "detail": "DATABASE_URL is not configured.",
        }

    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"connected": True, "detail": "PostgreSQL connection successful."}
    except Exception:
        # Do NOT expose the raw exception message — it may contain credentials
        return {
            "connected": False,
            "detail": (
                "Could not connect to PostgreSQL. "
                "Verify that PostgreSQL is running and DATABASE_URL is correct."
            ),
        }
