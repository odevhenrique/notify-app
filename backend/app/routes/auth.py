from fastapi import APIRouter, HTTPException, Depends
from app.database.connection import SessionLocal
from app.schemas.user import UserCreate, UserLogin
from sqlalchemy.orm import Session
from app.models.user import User
from app.core.security import hash_password, verify_password
from app.core.security import create_access_token

router = APIRouter()

# Dependencia do banco
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post('/register')
def register(user: UserCreate, db: Session = Depends(get_db)):
    '''
    Cadastro de um novo usuário
    '''
    existing_user = db.query(User).filter(User.email == user.email).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    
    new_user = User(
        name = user.name,
        email = user.email,
        password = hash_password(user.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "Usuário criado com sucesso!"}

@router.post('/login')
def login(user: UserLogin, db: Session = Depends(get_db)):
    '''
    Login de usuário(Autenticação)
    '''
    db_user = db.query(User).filter(User.email == user.email).first()

    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=400, detail="Credencias inválidas")
    
    access_token = create_access_token(
        data={"sub": db_user.email}
    )

    return {
        "message": "Login realizado com sucesso",
        "access_token": access_token,
        "token_type": "bearer"
    }