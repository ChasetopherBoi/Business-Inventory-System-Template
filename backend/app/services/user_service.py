from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate
from app.core.security import hash_password
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException
from datetime import datetime


def create_user(db: Session, user_in: UserCreate) -> User:
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing and existing.is_deleted:
        raise HTTPException(409, "Account is deactivated. Contact support.")
    if existing:
        raise HTTPException(409, "Email already exists.")

    user = User(
        email=user_in.email,
        full_name=user_in.full_name,
        hashed_password=hash_password(user_in.password),
        role="shop",
    )

    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        # likely unique constraint on email
        raise HTTPException(status_code=409, detail="Email already exists")
    db.refresh(user)
    return user


def get_users(
    db: Session, skip: int = 0, limit: int = 50, include_deleted: bool = False
) -> list[User]:
    q = db.query(User)
    if not include_deleted:
        q = q.filter(User.is_deleted == False)  # noqa: E712
    return q.offset(skip).limit(limit).all()


def delete_user(db: Session, user_id: int) -> bool:
    user = (
        db.query(User).filter(User.id == user_id, User.is_deleted == False).first()
    )  # noqa: E712
    if not user:
        return False
    user.is_deleted = True
    user.deleted_at = datetime.utcnow()
    db.commit()
    return True
