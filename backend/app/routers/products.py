from fastapi import APIRouter, UploadFile, File, Depends, Form
from sqlalchemy.orm import Session
from typing import List

from app.database.connection import get_db 
from app.controllers import product_controller
from app.schemas.product_schema import ProductResponse, ProductCreate, ProductAnalysisUpdate
from app.models.user import User
from app.core.deps import get_current_user



import uuid


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
    brand_id: uuid.UUID = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Form üzerinden gelen resim ve name bilgisini Pydantic şemasına çevirip Controller'a iletir.
    """
    product_in = ProductCreate(name=name, brand_id=brand_id)
    new_product = product_controller.create_product_with_image(
        db=db, 
        product_in=product_in, 
        file=file, 
        current_user=current_user
    )
    return new_product


@router.get("/{product_id}", response_model=ProductResponse)
def get_single_product(
    product_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Belirli bir ürünün detaylarını ve analiz sonuçlarını product_id'ye göre getirir.
    """
    return product_controller.get_product_by_id(db=db, product_id=product_id, current_user=current_user)

@router.patch("/{product_id}/analysis", response_model=ProductResponse)
def update_product_analysis(
    product_id: uuid.UUID,
    update_data: ProductAnalysisUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Belirli bir ürünün yapay zeka analiz verilerini (kategori, stil, renkler vb.) günceller.
    """
    return product_controller.update_product_analysis(
        db=db, 
        product_id=product_id, 
        update_data=update_data, 
        current_user=current_user
    )

@router.delete("/{product_id}")
def delete_product(
    product_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Belirli bir ürünü (ve bağlı yapay zeka analizlerini, supabase storage resmini) siler.
    """
    return product_controller.delete_product(
        db=db, 
        product_id=product_id, 
        current_user=current_user
    )
    