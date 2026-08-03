import uuid
from fastapi import UploadFile, HTTPException, Depends
from sqlalchemy.orm import Session
from app.models.product import Product
from app.schemas.product_schema import ProductCreate
from app.services.storage.supabase_client import get_supabase_client
from app.models.user import User
from app.core.deps import get_current_user

def create_product_with_image(
    db: Session,
    product_in: ProductCreate,
    file: UploadFile,
    current_user: User
) -> Product:
    supabase = get_supabase_client()

    file_extension = file.filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4()}.{file_extension}"

    file_bytes = file.file.read()

    try:
        supabase.storage.from_("product-images").upload(
            path=unique_filename,
            file=file_bytes,
            file_options={
                "content-type": file.content_type
            }
        )

        public_url = supabase.storage.from_("product-images").get_public_url(unique_filename)

        new_product = Product(
            user_id=current_user.id,
            name=product_in.name,
            image_url=public_url
        )
        db.add(new_product)
        db.commit()
        db.refresh(new_product)

        return new_product
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Resim yüklenirken hata oluştu: {str(e)}")

def get_products_by_user(db: Session, current_user: User):
    return db.query(Product).filter(Product.user_id == current_user.id).order_by(Product.id.desc()).all()
