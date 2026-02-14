from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.api.deps_auth import get_current_user
from app.schemas.user import UserRead
from app.schemas.orders import OrderCreate, OrderRead
from app.models.order import Order
from app.models.order_item import OrderItem
from app.services.item_service import get_item_by_item_number

TAX_RATE = 0.0825

router = APIRouter()


def require_shop(user: UserRead):
    if user.role != "shop":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Shop users only"
        )


def require_admin(user: UserRead):
    if user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")


@router.post("/checkout", response_model=OrderRead)
def checkout(
    payload: OrderCreate,
    db: Session = Depends(get_db),
    user: UserRead = Depends(get_current_user),
):
    require_shop(user)

    if not payload.lines:
        raise HTTPException(status_code=400, detail="Cart is empty")

    subtotal = 0.0
    order_items: list[OrderItem] = []

    for line in payload.lines:
        item = get_item_by_item_number(db, line.item_number)
        if not item:
            raise HTTPException(
                status_code=404, detail=f"Item not found: {line.item_number}"
            )
        qty_in_stock = int(getattr(item, "qty_in_stock"))
        if qty_in_stock < line.quantity:
            raise HTTPException(
                status_code=400, detail=f"Not enough stock for {item.item_number}"
            )

        unit_price = float(getattr(item, "price"))
        line_total = unit_price * line.quantity
        subtotal += line_total

        # decrement stock
        setattr(item, "qty_in_stock", qty_in_stock - line.quantity)

        order_items.append(
            OrderItem(
                item_number=item.item_number,
                name=item.name,
                unit_price=unit_price,
                quantity=line.quantity,
                line_total=line_total,
            )
        )

    tax = round(subtotal * TAX_RATE, 2)
    total = round(subtotal + tax, 2)

    order = Order(
        user_id=user.id,
        status="in_progress",
        subtotal=subtotal,
        tax=tax,
        total=total,
        items=order_items,
    )

    db.add(order)
    db.commit()
    db.refresh(order)
    return order


@router.get("/me", response_model=list[OrderRead])
def list_my_orders(
    db: Session = Depends(get_db),
    user: UserRead = Depends(get_current_user),
):
    require_shop(user)
    return (
        db.query(Order).filter(Order.user_id == user.id).order_by(Order.id.desc()).all()
    )


@router.get("/", response_model=list[OrderRead])
def list_all_orders(
    db: Session = Depends(get_db),
    user: UserRead = Depends(get_current_user),
):
    require_admin(user)
    return db.query(Order).order_by(Order.id.desc()).all()


@router.put("/{order_id}/status", response_model=OrderRead)
def set_order_status(
    order_id: int,
    status_value: str,
    db: Session = Depends(get_db),
    user: UserRead = Depends(get_current_user),
):
    require_admin(user)

    status_value = status_value.strip().lower()
    if status_value not in ("in_progress", "shipped", "complete"):
        raise HTTPException(status_code=400, detail="Invalid status")

    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    setattr(order, "status", status_value)
    db.commit()
    db.refresh(order)
    return order
