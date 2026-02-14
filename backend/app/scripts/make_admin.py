from app.db.session import SessionLocal
from app.models.user import User

EMAIL = input("Email: ")
ROLE = input("Role: ")

db = SessionLocal()
u = db.query(User).filter(User.email == EMAIL).first()
if not u:
    print("User not found")
else:
    u.role = ROLE
    db.commit()
    print(f"Set {EMAIL} to {ROLE}")
db.close()
