from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    password = password.encode("utf-8")[:72]
    return pwd_context.hash(password)

def verify_password(plain_password: str, hash_password: str) -> bool:
    plain_password = plain_password.encode("utf-8")[:72]
    return pwd_context.verify(plain_password, hash_password)