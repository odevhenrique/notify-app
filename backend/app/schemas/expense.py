from pydantic import BaseModel
from datetime import date

class ExpenseCreate(BaseModel):
    title: str
    amount: float
    due_date: date

class ExpenseResponse(BaseModel):
    id: int
    title: str
    amount: float
    due_date: date
    is_paid: bool

    class Config:
        from_attributes = True