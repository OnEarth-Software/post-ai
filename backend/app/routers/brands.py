from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.database.connection import get_db
from app.controllers import brand_controller
from app.schemas.brand_schema import BrandCreate, BrandUpdate, BrandResponse
from app.models.user import User
from app.core.deps import get_current_user

router = APIRouter()

@router.get("/", response_model=List[BrandResponse])
def get_user_brands(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Kullanıcının oluşturduğu tüm markaları getirir.
    """
    return brand_controller.get_brands_by_user(db=db, current_user=current_user)

from fastapi import Form, UploadFile, File
from typing import Optional

@router.post("/", response_model=BrandResponse)
def create_brand(
    name: str = Form(...),
    description: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Kullanıcı için yeni bir marka oluşturur. Logo dosyası varsa Supabase'e yükler.
    """
    brand_data = BrandCreate(name=name, description=description, logo_url=None)
    return brand_controller.create_brand_with_logo(
        db=db, 
        brand_data=brand_data, 
        current_user=current_user,
        file=file
    )

@router.get("/{brand_id}", response_model=BrandResponse)
def get_brand(
    brand_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Belirli bir markanın detaylarını getirir.
    """
    return brand_controller.get_brand_by_id(db=db, brand_id=brand_id, current_user=current_user)

@router.put("/{brand_id}", response_model=BrandResponse)
def update_brand(
    brand_id: uuid.UUID,
    brand_data: BrandUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Belirli bir markayı günceller.
    """
    return brand_controller.update_brand(db=db, brand_id=brand_id, brand_data=brand_data, current_user=current_user)

@router.delete("/{brand_id}")
def delete_brand(
    brand_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Belirli bir markayı siler.
    """
    return brand_controller.delete_brand(db=db, brand_id=brand_id, current_user=current_user)
