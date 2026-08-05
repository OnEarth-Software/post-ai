from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User
from app.schemas.user_schema import UserCreate, UserUpdate, ChangePassword, TwoFactorVerify
import pyotp
from app.core.security import get_password_hash, verify_password

def create_user(db: Session, user_in: UserCreate) -> User:
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    
    hashed_password = get_password_hash(user_in.password)
    db_user = User(
        email=user_in.email,
        name=user_in.name,
        surname=user_in.surname,
        password_hash=hashed_password,
        plan_id=user_in.plan_id
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, email: str, password: str) -> User:
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user

def update_user(db: Session, current_user: User, user_in: UserUpdate) -> User:
    if user_in.name is not None:
        current_user.name = user_in.name
    if user_in.surname is not None:
        current_user.surname = user_in.surname
        
    if user_in.email is not None and user_in.email != current_user.email:
        # Check if email is already taken
        existing_user = db.query(User).filter(User.email == user_in.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is already in use by another account."
            )
        
        # Verify password
        if not user_in.current_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is required to change email."
            )
            
        if not verify_password(user_in.current_password, current_user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incorrect password."
            )
            
        current_user.email = user_in.email

    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user

def change_password(db: Session, current_user: User, password_in: ChangePassword) -> User:
    if not verify_password(password_in.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password."
        )
    current_user.password_hash = get_password_hash(password_in.new_password)
    db.add(current_user)
    db.commit()
    return current_user

def setup_2fa(db: Session, current_user: User) -> str:
    if current_user.is_2fa_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA is already enabled."
        )
    secret = pyotp.random_base32()
    current_user.two_factor_secret = secret
    db.add(current_user)
    db.commit()
    
    uri = pyotp.totp.TOTP(secret).provisioning_uri(name=current_user.email, issuer_name="PostAI")
    return uri

def verify_2fa(db: Session, current_user: User, verify_in: TwoFactorVerify) -> User:
    if current_user.is_2fa_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA is already enabled."
        )
    if not current_user.two_factor_secret:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA setup not initiated."
        )
        
    totp = pyotp.TOTP(current_user.two_factor_secret)
    if not totp.verify(verify_in.code):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid 2FA code."
        )
        
    current_user.is_2fa_enabled = True
    db.add(current_user)
    db.commit()
    return current_user

def disable_2fa(db: Session, current_user: User, verify_in: TwoFactorVerify) -> User:
    if not current_user.is_2fa_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA is not enabled."
        )
    totp = pyotp.TOTP(current_user.two_factor_secret)
    if not totp.verify(verify_in.code):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid 2FA code."
        )
        
    current_user.is_2fa_enabled = False
    current_user.two_factor_secret = None
    db.add(current_user)
    db.commit()
    return current_user

def verify_2fa_token(db: Session, user_id: str, code: str) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_2fa_enabled:
        raise HTTPException(status_code=400, detail="Invalid 2FA request.")
        
    totp = pyotp.TOTP(user.two_factor_secret)
    if not totp.verify(code):
        raise HTTPException(status_code=400, detail="Invalid 2FA code.")
    return user
