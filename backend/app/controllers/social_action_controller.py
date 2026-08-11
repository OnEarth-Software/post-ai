import uuid
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.user import User
from app.models.campaign_result import CampaignResult
from app.models.product import Product
from app.models.campaign import Campaign
from app.models.like import Like
from app.models.notification import Notification

def toggle_like(db: Session, result_id: str, current_user: User):
    # Görsel var mı kontrol et
    result = db.query(CampaignResult).filter(CampaignResult.id == result_id).first()
    if not result:
        raise HTTPException(status_code=404, detail="Gönderi bulunamadı.")
    
    if not result.is_public:
        raise HTTPException(status_code=403, detail="Bu gönderi herkese açık değil.")

    # Beğeni var mı?
    existing_like = db.query(Like).filter(
        Like.user_id == current_user.id,
        Like.campaign_result_id == result_id
    ).first()

    if existing_like:
        # Beğeniyi kaldır
        db.delete(existing_like)
        db.commit()
        is_liked = False
    else:
        # Beğen
        new_like = Like(
            user_id=current_user.id,
            campaign_result_id=result_id
        )
        db.add(new_like)
        
        # Bildirim gönder (Eğer kendi gönderisini beğenmediyse)
        owner = result.campaign.product.user_id
        if owner != current_user.id:
            message = f"{current_user.name} {current_user.surname} bir tasarımınızı beğendi."
            notification = Notification(
                user_id=owner,
                actor_id=current_user.id,
                campaign_result_id=result_id,
                type="like",
                message=message
            )
            db.add(notification)
            
        db.commit()
        is_liked = True

    likes_count = db.query(Like).filter(Like.campaign_result_id == result_id).count()
    return {"is_liked": is_liked, "likes_count": likes_count}

def get_user_notifications(db: Session, current_user: User):
    notifications = db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc()).all()
    
    return notifications

def mark_notification_as_read(db: Session, notification_id: str, current_user: User):
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Bildirim bulunamadı.")
        
    notification.is_read = True
    db.commit()
    return {"message": "Okundu işaretlendi"}
