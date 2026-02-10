from app.db.base import Base
from app.db.session import engine

# Create all tables defined in your SQLAlchemy models
Base.metadata.create_all(bind=engine)

print("All tables created successfully!")
