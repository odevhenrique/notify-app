from fastapi import APIRouter, UploadFile, File, Depends, Form, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.core.deps import get_current_user
from app.models.expense import Expense
from app.service.upload_service import upload_file
import cloudinary.utils

router = APIRouter()

@router.post("/receipt")
async def upload_receipt(
    expense_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    '''
    Salvar comprovante de pagamento
    '''
    expense = db.query(Expense).filter(
        Expense.id == expense_id,
        Expense.user_id == user.id
    ).first()

    if not expense:
        raise HTTPException(status_code=404, detail="Despesa não encontrada")

    content = await file.read() 
    result = upload_file(content)

    expense.receipt_url = result["public_id"]
    db.commit()

    return {"message": "Comprovante anexado com sucesso!"}

@router.get("/{expense_id}/receipt")
def get_receipt(
    expense_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    '''
    Buscar comprovante de uma conta paga
    '''
    expense = db.query(Expense).filter(
        Expense.id == expense_id,
        Expense.user_id == user.id
    ).first()

    if not expense or not expense.receipt_url:
        raise HTTPException(status_code=404, detail="Comprovante não encontrado")
    
    url, _ = cloudinary.utils.cloudinary_url(
        expense.receipt_url,
        type="authenticated",
        sign_url=True
    )
    
    return {"url": url}