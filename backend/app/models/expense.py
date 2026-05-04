from sqlalchemy import Column, Integer, String, Float, Date, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.database.connection import Base

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    due_date = Column(Date, nullable=False)

    is_paid = Column(Boolean, default=False)
    payment_date = Column(Date, nullable=True)
    receipt_url = Column(String, nullable=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    user = relationship("User")