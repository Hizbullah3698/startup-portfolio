"""
Alembic migration environment.

- DATABASE_URL is read from the .env file via pydantic-settings (never hardcoded).
- All ORM models are imported so autogenerate can detect schema differences.
"""

import os
import sys
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool
from alembic import context

# Make sure the backend/ directory is on sys.path so 'app.*' imports work
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.config import settings
from app.database import Base

# Import every model module here so Alembic autogenerate can see all tables.
import app.models.contact  # noqa: F401 – registers ContactInquiry with Base.metadata
import app.models.project  # noqa: F401 – registers Project with Base.metadata
import app.models.service  # noqa: F401 – registers Service with Base.metadata
import app.models.testimonial  # noqa: F401 – registers Testimonial with Base.metadata

# ---------------------------------------------------------------------------
# Standard Alembic setup
# ---------------------------------------------------------------------------
alembic_config = context.config

# Wire in DATABASE_URL from settings (never from alembic.ini)
alembic_config.set_main_option("sqlalchemy.url", settings.database_url)

if alembic_config.config_file_name is not None:
    fileConfig(alembic_config.config_file_name)

target_metadata = Base.metadata


# ---------------------------------------------------------------------------
# Offline mode (generates SQL without a live connection)
# ---------------------------------------------------------------------------
def run_migrations_offline() -> None:
    url = alembic_config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


# ---------------------------------------------------------------------------
# Online mode (applies migrations to a live database)
# ---------------------------------------------------------------------------
def run_migrations_online() -> None:
    connectable = engine_from_config(
        alembic_config.get_section(alembic_config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
