from pydantic import BaseModel
from typing import Optional

class Token(BaseModel):
    access_token: Optional[str] = None
    token_type: Optional[str] = None
    requires_2fa: Optional[bool] = False
    temp_token: Optional[str] = None

class TokenPayload(BaseModel):
    sub: Optional[str] = None
