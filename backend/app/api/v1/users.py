from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.api.deps_auth import get_current_user
from app.models.user import User
from app.db.deps import get_db
from app.schemas.user import UserCreate, UserRead, UserMe
from app.services.user_service import create_user, get_users, delete_user
from app.api.deps_roles import require_role


router = APIRouter()


@router.post("/", response_model=UserRead)
def create_user_endpoint(user_in: UserCreate, db: Session = Depends(get_db)):
    return create_user(db, user_in)


@router.get("/me", response_model=UserMe)
def read_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("/", response_model=list[UserRead])
def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    include_deleted: bool = False,
    db: Session = Depends(get_db),
):
    return get_users(db, skip=skip, limit=limit, include_deleted=include_deleted)


@router.delete("/{user_id}", response_model=dict)
def delete_user_endpoint(user_id: int, db: Session = Depends(get_db)):
    ok = delete_user(db, user_id)
    if not ok:
        raise HTTPException(status_code=404, detail="User not found")
    return {"ok": True}


@router.get("/admin-only")
def admin_only(user: User = Depends(require_role("admin"))):
    return {"ok": True}
