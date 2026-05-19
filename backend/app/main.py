from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler
from app.database.connection import Base, engine
from app.routes import auth, expense, upload, admin
from app.core.limiter import limiter
from app.models.user import User  # noqa: F401 — registra modelo no SQLAlchemy
from app.models.allowed_email import AllowedEmail  # noqa: F401 — registra modelo no SQLAlchemy


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    with engine.connect() as conn:
        conn.execute(text("""
            ALTER TABLE expenses
            ADD COLUMN IF NOT EXISTS payment_date DATE,
            ADD COLUMN IF NOT EXISTS receipt_url VARCHAR
        """))
        conn.execute(text("""
            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS google_id VARCHAR,
            ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
            ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS reset_code VARCHAR,
            ADD COLUMN IF NOT EXISTS reset_code_expires TIMESTAMP
        """))
        conn.commit()
    yield


app = FastAPI(
    title="Controle de Despesas API",
    description="API para gerenciamento de despesas domésticas",
    version="1.0.0",
    lifespan=lifespan
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Mobile apps não enviam Origin, então allow_origins=["*"] é seguro aqui.
# Se adicionar um painel web no futuro, restrinja para o domínio do painel.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(expense.router, prefix="/expenses", tags=["Expenses"])
app.include_router(upload.router, prefix="/upload", tags=["Upload"])
app.include_router(admin.router, prefix="/admin", tags=["Admin"])


@app.get('/')
def read_root():
    return {"message": "Api está funcionando"}


@app.get('/health')
def health_check():
    return {"status": "OK"}

#  python -m uvicorn app.main:app --reload
