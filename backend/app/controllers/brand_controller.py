from sqlalchemy.orm import Session
from app.models.brand import Brand
from app.models.user import User
from app.schemas.brand_schema import BrandCreate, BrandUpdate
import uuid
from fastapi import HTTPException

def get_brands_by_user(db: Session, current_user: User):
    return db.query(Brand).filter(Brand.user_id == current_user.id).order_by(Brand.created_at.desc()).all()

def get_brand_by_id(db: Session, brand_id: uuid.UUID, current_user: User):
    brand = db.query(Brand).filter(Brand.id == brand_id, Brand.user_id == current_user.id).first()
    if not brand:
        raise HTTPException(status_code=404, detail="Marka bulunamadı veya yetkiniz yok.")
    return brand

from typing import Optional
from fastapi import UploadFile

def create_brand(db: Session, brand_data: BrandCreate, current_user: User):
    db_brand = Brand(
        user_id=current_user.id,
        name=brand_data.name,
        description=brand_data.description,
        logo_url=brand_data.logo_url
    )
    db.add(db_brand)
    db.commit()
    db.refresh(db_brand)
    return db_brand

def create_brand_with_logo(
    db: Session,
    brand_data: BrandCreate,
    current_user: User,
    file: Optional[UploadFile] = None
) -> Brand:
    from app.services.storage.supabase_client import get_supabase_client
    
    logo_url = brand_data.logo_url

    if file:
        supabase = get_supabase_client()
        filename = file.filename if getattr(file, "filename", None) else "logo.png"
        file_extension = filename.split(".")[-1]
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_bytes = file.file.read()

        try:
            supabase.storage.from_("logo-images").upload(
                path=unique_filename,
                file=file_bytes,
                file_options={"content-type": file.content_type}
            )
            logo_url = supabase.storage.from_("logo-images").get_public_url(unique_filename)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Logo yüklenirken Supabase hatası oluştu: {str(e)}. Lütfen 'logo-image' adında bir bucket oluşturduğunuzdan emin olun.")


    db_brand = Brand(
        user_id=current_user.id,
        name=brand_data.name,
        description=brand_data.description,
        logo_url=logo_url
    )
    db.add(db_brand)
    db.commit()
    db.refresh(db_brand)
    return db_brand

def update_brand(db: Session, brand_id: uuid.UUID, brand_data: BrandUpdate, current_user: User):
    db_brand = get_brand_by_id(db, brand_id, current_user)
    
    update_data = brand_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_brand, key, value)
        
    db.commit()
    db.refresh(db_brand)
    return db_brand

def delete_brand(db: Session, brand_id: uuid.UUID, current_user: User):
    db_brand = get_brand_by_id(db, brand_id, current_user)
    
    db.delete(db_brand)
    db.commit()
    return {"message": "Marka başarıyla silindi"}
