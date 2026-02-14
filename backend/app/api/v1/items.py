import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from app.schemas.items import ItemUpdate
from app.services.item_service import update_item_by_item_number

from app.db.deps import get_db
from app.schemas.items import ItemCreate, ItemRead
from app.services.item_service import (
    list_items,
    create_item,
    delete_item_by_item_number,
    update_item_image_url,
)

# You likely already have auth deps like get_current_user; adapt name as needed
from app.api.deps_auth import get_current_user  # <-- adjust to your project
from app.schemas.user import UserRead  # <-- adjust

router = APIRouter()


def require_admin(user: UserRead):
    if user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")


@router.get("/", response_model=list[ItemRead])
def get_items(db: Session = Depends(get_db)):
    return list_items(db)


@router.post("/", response_model=ItemRead)
def create_item_endpoint(
    item_in: ItemCreate,
    db: Session = Depends(get_db),
    user: UserRead = Depends(get_current_user),
):
    require_admin(user)
    try:
        return create_item(db, item_in)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{item_number}", status_code=204)
def delete_item_endpoint(
    item_number: str,
    db: Session = Depends(get_db),
    user: UserRead = Depends(get_current_user),
):
    require_admin(user)
    ok = delete_item_by_item_number(db, item_number)
    if not ok:
        raise HTTPException(status_code=404, detail="Item not found")
    return


@router.post("/{item_number}/image", response_model=ItemRead)
def upload_item_image(
    item_number: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: UserRead = Depends(get_current_user),
):
    require_admin(user)

    uploads_dir = "app/static/uploads"
    os.makedirs(uploads_dir, exist_ok=True)

    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in [".png", ".jpg", ".jpeg", ".webp"]:
        raise HTTPException(status_code=400, detail="Unsupported image type")

    filename = f"{item_number}-{uuid.uuid4().hex}{ext}"
    path = os.path.join(uploads_dir, filename)

    contents = file.file.read()
    with open(path, "wb") as f:
        f.write(contents)

    image_url = f"/static/uploads/{filename}"
    updated = update_item_image_url(db, item_number, image_url)
    if not updated:
        raise HTTPException(status_code=404, detail="Item not found")

    return updated


@router.put("/{item_number}", response_model=ItemRead)
def update_item_endpoint(
    item_number: str,
    item_in: ItemUpdate,
    db: Session = Depends(get_db),
    user: UserRead = Depends(get_current_user),
):
    require_admin(user)
    updated = update_item_by_item_number(db, item_number, item_in)
    if not updated:
        raise HTTPException(status_code=404, detail="Item not found")
    return updated
