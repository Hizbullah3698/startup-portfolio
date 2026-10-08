import logging

from app.config import settings
from app.core.security import get_password_hash
from app.database import SessionLocal
from app.models.admin import Admin

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def reset_admin_password():
    username = settings.admin_username
    password = settings.admin_password

    if not username or not password:
        logger.error("ADMIN_USERNAME and ADMIN_PASSWORD must be set in .env")
        return

    db = SessionLocal()
    try:
        admin = db.query(Admin).filter(Admin.username == username).first()
        if not admin:
            logger.error(f"No admin named '{username}' found. Run bootstrap_admin.py instead.")
            return
        admin.hashed_password = get_password_hash(password)
        db.commit()
        logger.info(f"Password updated for admin '{username}'.")
    except Exception as e:
        db.rollback()
        logger.error(f"Unexpected error: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    reset_admin_password()