"""
Application configuration using pydantic-settings.

All settings are read exclusively from environment variables / .env file.
Never hard-code secrets here.
"""

from typing import List
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central settings object populated from the .env file."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Application
    environment: str = "development"
    host: str = "127.0.0.1"
    port: int = 8000

    # CORS — comma-separated list of allowed origins
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"

    # Database
    database_url: str = ""

    @field_validator("cors_origins", mode="before")
    @classmethod
    def _validate_cors(cls, v: str) -> str:
        if not v:
            return "http://localhost:3000,http://127.0.0.1:3000"
        return v

    def get_cors_origins_list(self) -> List[str]:
        """Return CORS origins as a cleaned list."""
        return [
            origin.strip() for origin in self.cors_origins.split(",") if origin.strip()
        ]


# Module-level singleton — import this everywhere
settings = Settings()
