from app.db.session import SessionLocal
from app.models.user import User

EMAIL = input("Email: ")

db = SessionLocal()
u = db.query(User).filter(User.email == EMAIL).first()
if not u:
    print("User not found")
else:
    u.role = "admin"
    db.commit()
    print(f"Set {EMAIL} to admin")
db.close()
