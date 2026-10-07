import logging

from sqlalchemy.exc import IntegrityError

from app.config import settings
from app.core.security import get_password_hash
from app.database import SessionLocal
from app.models.admin import Admin

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def bootstrap_admin():
    username = settings.admin_username
    email = settings.admin_email
    password = settings.admin_password

    if not username or not email or not password:
        logger.error("Admin credentials not fully provided in environment variables.")
        logger.error(
            "Make sure ADMIN_USERNAME, ADMIN_EMAIL, and ADMIN_PASSWORD are set."
        )
        return

    db = SessionLocal()
    try:
        # Check if admin already exists
        existing_admin = (
            db.query(Admin)
            .filter((Admin.username == username) | (Admin.email == email))
            .first()
        )
        if existing_admin:
            logger.info(
                f"Admin '{username}' or an admin with email '{email}' already exists. Skipping bootstrap."
            )
            return

        hashed_password = get_password_hash(password)
        admin = Admin(
            username=username,
            email=email,
            hashed_password=hashed_password,
            is_active=True,
        )
        db.add(admin)
        db.commit()
        logger.info(f"Successfully bootstrapped admin user '{username}'.")
    except IntegrityError as e:
        db.rollback()
        logger.error("Failed to create admin due to a database integrity error.")
    except Exception as e:
        db.rollback()
        logger.error(f"An unexpected error occurred: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    bootstrap_admin()
