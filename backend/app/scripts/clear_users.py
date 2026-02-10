from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.user import User

# Create a session
db: Session = SessionLocal()

# Delete all users
deleted_count = db.query(User).delete()
db.commit()
db.close()

print(f"Deleted {deleted_count} users")
