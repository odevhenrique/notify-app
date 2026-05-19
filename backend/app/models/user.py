from sqlalchemy import Column, Integer, String, Boolean, DateTime
from app.database.connection import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password = Column(String, nullable=True)
    google_id = Column(String, unique=True, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_admin = Column(Boolean, default=False, nullable=False)
    reset_code = Column(String, nullable=True)
    reset_code_expires = Column(DateTime, nullable=True)