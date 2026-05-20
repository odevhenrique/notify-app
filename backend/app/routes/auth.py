import os
import secrets
import string
import logging
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.security import OAuth2PasswordRequestForm
from app.database.connection import get_db
from app.schemas.user import ChangePasswordRequest, ForgotPasswordRequest, ResetPasswordRequest
from sqlalchemy.orm import Session
from app.models.user import User
from app.core.security import hash_password, verify_password, create_access_token
from app.core.deps import get_current_user
from app.core.limiter import limiter
from app.core.email import send_email, email_reset_senha

router = APIRouter()


@router.post("/login")
@limiter.limit("5/minute")
def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == form_data.username).first()

    if not db_user or not db_user.password or not verify_password(form_data.password, db_user.password):
        raise HTTPException(status_code=400, detail="Credenciais inválidas")

    if not db_user.is_active:
        raise HTTPException(status_code=403, detail="Conta desativada pelo administrador")

    access_token = create_access_token(data={"sub": db_user.email})
    return {
        "message": "Login realizado com sucesso",
        "access_token": access_token,
        "token_type": "bearer",
        "email": db_user.email,
        "name": db_user.name,
        "is_admin": db_user.is_admin,
    }


@router.post("/forgot-password")
@limiter.limit("3/minute")
def forgot_password(request: Request, body: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()

    # Resposta genérica para não revelar se o email existe
    resposta = {"message": "Se o email estiver cadastrado, você receberá um código em breve."}

    if not user or not user.is_active:
        return resposta

    code = "".join(secrets.choice(string.digits) for _ in range(6))
    user.reset_code = code
    user.reset_code_expires = datetime.utcnow() + timedelta(minutes=15)
    db.commit()

    try:
        send_email(
            user.email,
            "Notify Home — Código de recuperação de senha",
            email_reset_senha(user.name or "Usuário", code),
        )
    except Exception as e:
        logging.error(f"Erro ao enviar email de recuperação: {e}")

    return resposta


@router.post("/reset-password")
@limiter.limit("5/minute")
def reset_password(request: Request, body: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()

    if not user or not user.reset_code:
        raise HTTPException(status_code=400, detail="Código inválido ou expirado")

    if datetime.utcnow() > user.reset_code_expires:
        raise HTTPException(status_code=400, detail="Código expirado. Solicite um novo.")

    if user.reset_code != body.code:
        raise HTTPException(status_code=400, detail="Código incorreto")

    if len(body.new_password) < 6:
        raise HTTPException(status_code=400, detail="Senha deve ter pelo menos 6 caracteres")

    user.password = hash_password(body.new_password)
    user.reset_code = None
    user.reset_code_expires = None
    db.commit()

    return {"message": "Senha redefinida com sucesso"}


@router.put("/change-password")
@limiter.limit("5/minute")
def change_password(
    request: Request,
    body: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.password:
        if not body.current_password:
            raise HTTPException(status_code=400, detail="Senha atual é obrigatória")
        if not verify_password(body.current_password, current_user.password):
            raise HTTPException(status_code=400, detail="Senha atual incorreta")

    if len(body.new_password) < 6:
        raise HTTPException(status_code=400, detail="Nova senha deve ter pelo menos 6 caracteres")

    current_user.password = hash_password(body.new_password)
    db.commit()
    return {"message": "Senha alterada com sucesso"}
