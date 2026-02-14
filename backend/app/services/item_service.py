from sqlalchemy.orm import Session
from app.models.item import Item
from app.schemas.items import ItemCreate
from app.schemas.items import ItemUpdate


def list_items(db: Session) -> list[Item]:
    return db.query(Item).order_by(Item.id.desc()).all()


def get_item_by_item_number(db: Session, item_number: str) -> Item | None:
    return db.query(Item).filter(Item.item_number == item_number).first()


def create_item(db: Session, item_in: ItemCreate) -> Item:
    existing = get_item_by_item_number(db, item_in.item_number)
    if existing:
        raise ValueError("Item number already exists")

    item = Item(**item_in.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def delete_item_by_item_number(db: Session, item_number: str) -> bool:
    item = get_item_by_item_number(db, item_number)
    if not item:
        return False
    db.delete(item)
    db.commit()
    return True


def update_item_image_url(db: Session, item_number: str, image_url: str) -> Item | None:
    item = get_item_by_item_number(db, item_number)
    if not item:
        return None

    setattr(item, "image_url", image_url)
    db.commit()
    db.refresh(item)
    return item


def update_item_by_item_number(
    db: Session, item_number: str, item_in: ItemUpdate
) -> Item | None:
    item = get_item_by_item_number(db, item_number)
    if not item:
        return None

    data = item_in.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(item, k, v)

    db.commit()
    db.refresh(item)
    return item
