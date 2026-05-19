from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.allowed_email import AllowedEmail
from app.models.user import User
from app.core.deps import get_current_user

router = APIRouter()


class AllowedEmailCreate(BaseModel):
    email: EmailStr


def require_admin(current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Acesso negado: requer administrador")
    return current_user


# --- Emails autorizados para login com Google ---

@router.get("/allowed-emails")
def list_allowed_emails(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    emails = db.query(AllowedEmail).all()
    return [{"id": e.id, "email": e.email, "created_at": e.created_at} for e in emails]


@router.post("/allowed-emails")
def add_allowed_email(body: AllowedEmailCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    existing = db.query(AllowedEmail).filter(AllowedEmail.email == body.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email já está na lista de autorizados")
    allowed = AllowedEmail(email=body.email)
    db.add(allowed)
    db.commit()
    db.refresh(allowed)
    return {"message": f"{body.email} autorizado com sucesso", "id": allowed.id}


@router.delete("/allowed-emails/{email_id}")
def remove_allowed_email(email_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    allowed = db.query(AllowedEmail).filter(AllowedEmail.id == email_id).first()
    if not allowed:
        raise HTTPException(status_code=404, detail="Email não encontrado")
    email = allowed.email
    db.delete(allowed)
    db.commit()
    return {"message": f"{email} removido da lista de autorizados"}


# --- Gerenciamento de usuários ---

@router.get("/users")
def list_users(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    users = db.query(User).all()
    return [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "is_active": u.is_active,
            "is_admin": u.is_admin,
            "has_google": bool(u.google_id),
        }
        for u in users
    ]


@router.patch("/users/{user_id}/deactivate")
def deactivate_user(user_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Não é possível desativar a própria conta")
    user.is_active = False
    db.commit()
    return {"message": f"Usuário {user.email} desativado"}


@router.patch("/users/{user_id}/activate")
def activate_user(user_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    user.is_active = True
    db.commit()
    return {"message": f"Usuário {user.email} ativado"}
