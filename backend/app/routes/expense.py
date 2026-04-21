from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.expense import ExpenseCreate, ExpenseResponse
from app.service import expense_service
from app.core.deps import get_current_user

router = APIRouter()

@router.post("/", response_model=ExpenseResponse)
def create(data: ExpenseCreate, db: Session = Depends(get_db), user = Depends(get_current_user)):
    '''
    Criação de uma nova conta a pagar
    '''
    return expense_service.create_expense(db, data, user.id)

@router.get("/", response_model=list[ExpenseResponse])
def list_all(db: Session = Depends(get_db), user = Depends(get_current_user)):
    '''
    Listar todas as contas
    '''
    return expense_service.get_expenses(db, user.id)

@router.put("/{expense_id}/pay")
def pay(expense_id: int, db: Session = Depends(get_db), user = Depends(get_current_user)):
    '''
    Atualizar contas pagas
    '''
    return expense_service.mark_as_paid(db, expense_id, user.id)

@router.delete("/{expense_id}")
def delete(expense_id: int, db: Session = Depends(get_db), user = Depends(get_current_user)):
    '''
    Exclui uma conta
    '''
    return expense_service.delete_expense(db, expense_id, user.id)