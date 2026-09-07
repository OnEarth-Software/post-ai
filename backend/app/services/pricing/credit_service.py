import uuid
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User

class CreditService:
    COST_PRODUCT_UPLOAD = 10
    COST_CAMPAIGN_GENERATION = 200
    COST_MARKET_ANALYSIS = 100
    COST_POST_TEXT_GENERATION = 10

    @staticmethod
    def deduct_credits(
        db: Session,
        user_id: uuid.UUID,
        amount: int
    ):
        user = db.query(User).filter(
            User.id == user_id
        ).first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Kullanıcı bulunamadı"
            )

        if user.credits < amount:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail=f"Yetersiz kredi! Bu işlem için {amount} krediye ihtiyacınız var, mevcut krediniz: {user.credits}"
            )
        
        user.credits -= amount
        db.commit()
        db.refresh(user)
        return user