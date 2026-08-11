from sqlalchemy.orm import Session
from app.models.asset import Asset
from app.models.user import User
import uuid
from fastapi import HTTPException
from app.services.storage.supabase_client import get_supabase_client

def get_assets_by_user(db: Session, current_user: User):
    assets = db.query(Asset).filter(Asset.user_id == current_user.id).order_by(Asset.created_at.desc()).all()
    return assets

def delete_asset(db: Session, asset_id: uuid.UUID, current_user: User):
    asset = db.query(Asset).filter(Asset.id == asset_id, Asset.user_id == current_user.id).first()
    
    if not asset:
        raise HTTPException(status_code=404, detail="Asset bulunamadı veya yetkiniz yok.")
    
    supabase = get_supabase_client()
    
    if asset.image_url:
        filename = asset.image_url.split("/")[-1].split("?")[0]
        try:
            res = supabase.storage.from_("campaign-images").remove([filename])
            print("Asset storage silme sonucu:", res)
        except Exception as e:
            print(f"Supabase asset storage silme hatası: {e}")
            
    db.delete(asset)
    db.commit()
    return {"message": "Asset başarıyla silindi"}
