from typing import Optional
from pydantic import BaseModel, EmailStr

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class ChangePasswordRequest(BaseModel):
    current_password: Optional[str] = None
    new_password: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    code: str
    new_password: str
