from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Any

from app.database.connection import get_db
from app.schemas.user_schema import UserCreate, UserResponse, UserUpdate, ChangePassword, TwoFactorVerify, Login2FA
import jwt
from app.schemas.token import Token
from app.controllers import auth_controller
from app.core.security import create_access_token
from app.core.config import settings
from app.core.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.post("/register", response_model=UserResponse)
def register(
    *,
    db: Session = Depends(get_db),
    user_in: UserCreate,
) -> Any:
    """
    Create new user.
    """
    user = auth_controller.create_user(db=db, user_in=user_in)
    return user

@router.post("/login", response_model=Token)
def login_access_token(
    db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = auth_controller.authenticate_user(
        db, email=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    if user.is_2fa_enabled:
        temp_token = create_access_token(user.id, role=user.role, expires_delta=timedelta(minutes=5))
        return {
            "requires_2fa": True,
            "temp_token": temp_token
        }

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": create_access_token(
            user.id, role=user.role, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.post("/login/2fa", response_model=Token)
def login_with_2fa(
    *,
    db: Session = Depends(get_db),
    login_in: Login2FA
) -> Any:
    try:
        payload = jwt.decode(login_in.temp_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=403, detail="Invalid token")
    except Exception:
        raise HTTPException(status_code=403, detail="Invalid token")

    user = auth_controller.verify_2fa_token(db, user_id=user_id, code=login_in.code)
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": create_access_token(
            user.id, role=user.role, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.get("/me", response_model=UserResponse)
def read_current_user(
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get current user.
    """
    return current_user

@router.patch("/me", response_model=UserResponse)
def update_current_user(
    *,
    db: Session = Depends(get_db),
    user_in: UserUpdate,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Update current user.
    """
    user = auth_controller.update_user(db=db, current_user=current_user, user_in=user_in)
    return user

@router.put("/password", response_model=UserResponse)
def change_password(
    *,
    db: Session = Depends(get_db),
    password_in: ChangePassword,
    current_user: User = Depends(get_current_user)
) -> Any:
    user = auth_controller.change_password(db=db, current_user=current_user, password_in=password_in)
    return user

@router.post("/2fa/setup")
def setup_2fa(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    uri = auth_controller.setup_2fa(db=db, current_user=current_user)
    return {"uri": uri}

@router.post("/2fa/verify", response_model=UserResponse)
def verify_2fa(
    *,
    db: Session = Depends(get_db),
    verify_in: TwoFactorVerify,
    current_user: User = Depends(get_current_user)
) -> Any:
    user = auth_controller.verify_2fa(db=db, current_user=current_user, verify_in=verify_in)
    return user

@router.post("/2fa/disable", response_model=UserResponse)
def disable_2fa(
    *,
    db: Session = Depends(get_db),
    verify_in: TwoFactorVerify,
    current_user: User = Depends(get_current_user)
) -> Any:
    user = auth_controller.disable_2fa(db=db, current_user=current_user, verify_in=verify_in)
    return user
