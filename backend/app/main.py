from fastapi import FastAPI
from app.database.connection import Base, engine
from app.routes import auth, expense

app = FastAPI(
    title="Controle de Despesas API",
    description="API para gerencimaneto de despesas domésticas",
    version="1.0.0"
)

# Criar tabelas automaticamente
Base.metadata.create_all(bind=engine)

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(expense.router, prefix="/expenses", tags=["Expenses"])

# Rota básica (teste)
@app.get('/')
def read_root():
    return {"message": "Api está funcionando"}

# Rota de saúde
@app.get('/health')
def health_check():
    return {"status": "OK"}

#  python -m uvicorn app.main:app --reload