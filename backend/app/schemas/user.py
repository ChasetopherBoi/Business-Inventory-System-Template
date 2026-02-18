from pydantic import BaseModel, EmailStr, Field, field_validator


class UserCreate(BaseModel):
    full_name: str
    email: str
    password: str
    role: str = "shop"

    @field_validator("email")
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()

    @classmethod
    def password_max_len(cls, v: str) -> str:
        if len(v.encode("utf-8")) > 72:
            raise ValueError("Password must be 72 bytes or fewer")
        return v


class UserRead(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: str

    class Config:
        from_attributes = True


class UserMe(UserRead):
    role: str
