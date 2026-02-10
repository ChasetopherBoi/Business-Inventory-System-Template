from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.schemas.auth import Token
from app.core.jwt import create_access_token
from app.services.auth_service import authenticate_user

router = APIRouter()


@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    # OAuth2PasswordRequestForm uses "username" field (we will treat it as email)
    user = authenticate_user(db, email=form_data.username, password=form_data.password)
    if not user:
        # Generic on purpose (don't leak whether email exists)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    token = create_access_token(subject=user.email)
    return Token(access_token=token)
