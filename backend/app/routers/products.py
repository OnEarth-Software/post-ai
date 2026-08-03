from fastapi import APIRouter, UploadFile, File, Depends, Form
from sqlalchemy.orm import Session
from typing import List

from app.database.connection import get_db 
from app.controllers import product_controller
from app.schemas.product_schema import ProductResponse, ProductCreate
from app.models.user import User
from app.core.deps import get_current_user

router = APIRouter()

@router.get("/", response_model=List[ProductResponse])
def get_user_products(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Kullanıcının yüklediği tüm ürünleri getirir.
    """
    return product_controller.get_products_by_user(db=db, current_user=current_user)

@router.post("/upload", response_model=ProductResponse)
def upload_product_image(
    name: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Form üzerinden gelen resim ve name bilgisini Pydantic şemasına çevirip Controller'a iletir.
    """
    product_in = ProductCreate(name=name)
    new_product = product_controller.create_product_with_image(
        db=db, 
        product_in=product_in, 
        file=file, 
        current_user=current_user
    )
    return new_product
