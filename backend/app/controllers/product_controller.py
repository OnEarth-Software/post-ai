import uuid
from fastapi import UploadFile, HTTPException, Depends
from sqlalchemy.orm import Session
from app.models.product import Product
from app.schemas.product_schema import ProductCreate, ProductAnalysisUpdate
from app.services.storage.supabase_client import get_supabase_client
from app.models.user import User
from app.core.deps import get_current_user
from app.models.product_analyze import ProductAnalyze
from app.services.ai.product_detail_ai import analyze_product_image_with_ai
from app.models.campaign import Campaign
from app.models.campaign_result import CampaignResult
from app.models.api_expense import ApiExpense


INPUT_PRICE_PER_1M = 0.15
OUTPUT_PRICE_PER_1M = 0.60




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
            file_options={"content-type": file.content_type}
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

        try:
            ai_result = analyze_product_image_with_ai(public_url)
            
            new_analysis = ProductAnalyze(
                product_id=new_product.id,
                category=ai_result.get("category", "Bilinmiyor"),
                style=ai_result.get("style", "Bilinmiyor"),
                colors=ai_result.get("colors", []),
                audience=ai_result.get("audience", "Bilinmiyor"),
                marketing_style=ai_result.get("marketing_style", "Bilinmiyor")
            )
            db.add(new_analysis)

            p_tokens = ai_result.get("prompt_tokens", 0)
            c_tokens = ai_result.get("completion_tokens", 0)
            t_tokens = ai_result.get("total_tokens", 0)

            input_cost = (
                p_tokens / 1_000_000
            ) * INPUT_PRICE_PER_1M

            output_cost = (
                c_tokens / 1_000_000
            ) * OUTPUT_PRICE_PER_1M

            total_cost = input_cost + output_cost


            new_spending = ApiExpense(
                user_id = current_user.id,
                service_type="VISION_DETAIL",
                tokens_used=t_tokens,         
                prompt_tokens=p_tokens,       
                completion_tokens=c_tokens,   
                cost=total_cost,          
                related_entity_id=new_product.id
            )
            db.add(new_spending)
            


            db.commit()
            

            new_product.analysis = new_analysis
        except Exception as ai_err:
            print(f"Yapay zeka analiz hatası: {ai_err}")

        return new_product

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Resim yüklenirken hata oluştu: {str(e)}")


def get_products_by_user(db: Session, current_user: User):
    products = db.query(Product).filter(Product.user_id == current_user.id).order_by(Product.id.desc()).all()

    for p in products:
        analysis = db.query(ProductAnalyze).filter(ProductAnalyze.product_id == p.id).first()
        p.analysis = analysis # Pydantic şeması (ProductResponse) için bu alana atıyoruz
        
    return products


def get_product_by_id(db: Session, product_id: uuid.UUID, current_user: User):
    product = db.query(Product).filter(
        Product.id == product_id, 
        Product.user_id == current_user.id
    ).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı veya yetkiniz yok.")
        
    analysis = db.query(ProductAnalyze).filter(ProductAnalyze.product_id == product.id).first()
    
    # Detayları ana ürüne bağla
    product.analysis = analysis
        
    return product

def update_product_analysis(db: Session, product_id: uuid.UUID, update_data: ProductAnalysisUpdate, current_user: User):
    product = db.query(Product).filter(
        Product.id == product_id, 
        Product.user_id == current_user.id
    ).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı veya yetkiniz yok.")
        
    analysis = db.query(ProductAnalyze).filter(ProductAnalyze.product_id == product.id).first()
    
    if not analysis:
        # If there's no analysis record, create a new one
        analysis = ProductAnalyze(
            product_id=product.id,
            category=update_data.category or "Bilinmiyor",
            style=update_data.style or "Bilinmiyor",
            colors=update_data.colors or [],
            audience=update_data.audience or "Bilinmiyor",
            marketing_style=update_data.marketing_style or "Bilinmiyor"
        )
        db.add(analysis)
    else:
        if update_data.category is not None:
            analysis.category = update_data.category
        if update_data.style is not None:
            analysis.style = update_data.style
        if update_data.colors is not None:
            analysis.colors = update_data.colors
        if update_data.audience is not None:
            analysis.audience = update_data.audience
        if update_data.marketing_style is not None:
            analysis.marketing_style = update_data.marketing_style
            
    db.commit()
    db.refresh(analysis)
    
    product.analysis = analysis
    return product

def delete_product(db: Session, product_id: uuid.UUID, current_user: User):
    product = db.query(Product).filter(
        Product.id == product_id, 
        Product.user_id == current_user.id
    ).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı veya yetkiniz yok.")
    
    supabase = get_supabase_client()
    
    files_to_remove = []

    # 1. İlişkili Kampanyaları ve Kampanya Sonuçlarını sil (Resimler Storage'da kalacak)
    campaigns = db.query(Campaign).filter(Campaign.product_id == product.id).all()
    for campaign in campaigns:
        results = db.query(CampaignResult).filter(CampaignResult.campaign_id == campaign.id).all()
        for res in results:
            db.delete(res)
        db.delete(campaign)
        
    # 2. İlişkili Ürün Analizini sil
    product_analyze = db.query(ProductAnalyze).filter(ProductAnalyze.product_id == product.id).first()
    if product_analyze:
        db.delete(product_analyze)

    # 3. Ürünün Kendi Resmini sil
    if product.image_url:
        filename = product.image_url.split("/")[-1].split("?")[0]
        files_to_remove.append(filename)

    # Toplu olarak storage'dan dosyaları sil
    if files_to_remove:
        try:
            res = supabase.storage.from_("product-images").remove(files_to_remove)
            print("Storage silme sonucu:", res)
        except Exception as e:
            print(f"Supabase storage silme hatası: {e}")

    # 4. Ürünü DB'den sil
    db.delete(product)
    db.commit()
    
    return {"message": "Ürün başarıyla silindi"}