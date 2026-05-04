from contextlib import asynccontextmanager
from fastapi import FastAPI
from sqlalchemy import text
from app.database.connection import Base, engine
from app.routes import auth, expense, upload

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    with engine.connect() as conn:
        conn.execute(text("""
            ALTER TABLE expenses
            ADD COLUMN IF NOT EXISTS payment_date DATE,
            ADD COLUMN IF NOT EXISTS receipt_url VARCHAR
        """))
        conn.commit()
    yield

app = FastAPI(
    title="Controle de Despesas API",
    description="API para gerencimaneto de despesas domésticas",
    version="1.0.0",
    lifespan=lifespan
)

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(expense.router, prefix="/expenses", tags=["Expenses"])
app.include_router(upload.router, prefix="/upload", tags=["Upload"])

@app.get('/')
def read_root():
    return {"message": "Api está funcionando"}

@app.get('/health')
def health_check():
    return {"status": "OK"}

#  python -m uvicorn app.main:app --reload
