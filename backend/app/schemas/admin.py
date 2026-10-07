from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr


class AdminBase(BaseModel):
    username: str
    email: EmailStr
    is_active: bool = True


class AdminCreate(AdminBase):
    password: str


class AdminResponse(AdminBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
