import os
import asyncio
import secrets
import string
import httpx
from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.security import OAuth2PasswordRequestForm
from app.database.connection import get_db
from app.schemas.user import GoogleLoginRequest, ChangePasswordRequest
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.allowed_email import AllowedEmail
from app.core.security import hash_password, verify_password, create_access_token
from app.core.deps import get_current_user
from app.core.limiter import limiter
from app.core.email import send_email, email_boas_vindas

router = APIRouter()


def _gerar_senha(length: int = 12) -> str:
    alphabet = string.ascii_letters + string.digits + "!@#$"
    return "".join(secrets.choice(alphabet) for _ in range(length))


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
    }


@router.post("/google")
@limiter.limit("5/minute")
async def google_login(request: Request, token_data: GoogleLoginRequest, db: Session = Depends(get_db)):
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {token_data.access_token}"},
        )

    if resp.status_code != 200:
        raise HTTPException(status_code=401, detail="Token Google inválido")

    google_data = resp.json()
    email = google_data.get("email")
    google_id = google_data.get("sub")
    name = google_data.get("name") or (email.split("@")[0] if email else "Usuário")
    email_verified = google_data.get("email_verified", False)

    if not email or not email_verified:
        raise HTTPException(status_code=401, detail="Email Google não verificado")

    admin_email = os.getenv("ADMIN_EMAIL", "")
    is_admin_email = bool(admin_email) and email == admin_email

    allowed = db.query(AllowedEmail).filter(AllowedEmail.email == email).first()
    if not allowed and not is_admin_email:
        raise HTTPException(
            status_code=403,
            detail="Email não autorizado. Solicite acesso ao administrador.",
        )

    user = db.query(User).filter(User.email == email).first()
    is_new_user = user is None

    if is_new_user:
        plain_password = _gerar_senha()
        user = User(
            name=name,
            email=email,
            google_id=google_id,
            password=hash_password(plain_password),
            is_admin=is_admin_email,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        # Envia email em background — falha silenciosa para não bloquear o login
        try:
            await asyncio.to_thread(
                send_email,
                email,
                "Notify Home — sua senha de acesso",
                email_boas_vindas(name, plain_password),
            )
        except Exception:
            pass
    else:
        if not user.google_id:
            user.google_id = google_id
            db.commit()

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Conta desativada pelo administrador")

    access_token = create_access_token(data={"sub": user.email})
    return {
        "message": "Login com Google realizado com sucesso",
        "access_token": access_token,
        "token_type": "bearer",
        "email": user.email,
        "name": user.name,
        "is_new_user": is_new_user,
    }


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
