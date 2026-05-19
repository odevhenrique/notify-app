from typing import Optional
from pydantic import BaseModel, EmailStr

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class GoogleLoginRequest(BaseModel):
    access_token: str

class ChangePasswordRequest(BaseModel):
    current_password: Optional[str] = None
    new_password: str