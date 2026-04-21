from sqlalchemy.orm import Session
from app.models.expense import Expense

def create_expense(db: Session, data, user_id: int):
    expense = Expense(
        title = data.title,
        amount = data.amount,
        due_date = data.due_date,
        user_id = user_id
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense

def get_expenses(db: Session, user_id: int):
    return db.query(Expense).filter(Expense.user_id == user_id).all()

def mark_as_paid(db: Session, expense_id: int, user_id: int):
    expense = db.query(Expense).filter(
        Expense.id == expense_id,
        Expense.user_id == user_id
    ).first()

    if expense:
        expense.is_paid = True
        db.commit()
        db.refresh(expense)

    return expense

def delete_expense(db: Session, expense_id: int, user_id: int):
    expense = db.query(Expense).filter(
        Expense.id == expense_id,
        Expense.user_id == user_id
    ).first()

    if expense:
        db.delete(expense)
        db.commit()

    return expense