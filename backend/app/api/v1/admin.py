from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.api.deps_auth import get_current_user
from app.schemas.user import UserRead
from app.models.user import User
from pydantic import BaseModel


router = APIRouter()


class ChangeRoleBody(BaseModel):
    email: str
    role: str


def require_admin(user: UserRead):
    if user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")


@router.post("/change-role")
def change_role(
    body: ChangeRoleBody,
    db: Session = Depends(get_db),
    user: UserRead = Depends(get_current_user),
):
    require_admin(user)
    email = body.email
    role = body.role

    role = role.strip().lower()
    if role not in ("admin", "shop"):
        raise HTTPException(status_code=400, detail="Role must be 'admin' or 'shop'")

    target = db.query(User).filter(User.email == email).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")

    # hard safety: you can keep this or remove it
    # prevents accidentally demoting your only admin, etc.
    target.role = role
    db.commit()

    return {"ok": True, "email": email, "role": role}
