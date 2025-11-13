import re
from pydantic import BaseModel, Field, field_validator
from app.utils.validators import is_valid_email

class ValidatableModel(BaseModel):
    @field_validator("email", check_fields=False)
    def validate_email(cls, value):
        if not is_valid_email(value):
            raise ValueError(
                "The provided email address is invalid. Please ensure it is properly formatted."
            )
        return value
    
    @field_validator("password", check_fields=False)
    def validate_password(cls, value):
        if not re.search(r"\d", value):
            raise ValueError("The password must contain at least one numeric digit.")
        if not re.search(r"[A-Z]", value):
            raise ValueError("The password must contain at least one uppercase letter.")
        if not re.search(r"[a-z]", value):
            raise ValueError("The password must contain at least one lowercase letter.")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", value):
            raise ValueError(
                "The password must contain at least one special character (e.g., !@#$%^&*)."
            )
        return value
    
    
class AuthRequest(ValidatableModel):
    email: str = Field(
        ..., description="Valid email address to resend the verification link."
    )
    password: str = Field(
        ...,
        min_length=8,
        description="Password must be at least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character.",
    )

class AuthResponse(BaseModel):
    message: str
    accessToken: str