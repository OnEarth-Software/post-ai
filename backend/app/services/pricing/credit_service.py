from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.user import User
from app.models.system_config import SystemConfig

class CreditService:
    @staticmethod
    def get_config_value(
      db: Session,
      key: str,
      default_value: int
    ) -> int:
        config = db.query(SystemConfig).filter(
            SystemConfig.key == key
        ).first()

        if config:
            return int(config.value)

        return default_value

    @staticmethod
    def deduct_credits(
        db: Session, 
        user: User, 
        amount: int = None, 
        operation: str = None
    ) -> bool:
        
        if operation and amount is None:
            if operation == "product_upload":
                amount = CreditService.get_config_value(
                    db, "COST_PRODUCT_UPLOAD",10
                )
            elif operation == "post_text":
                amount = CreditService.get_config_value(
                    db, "COST_POST_TEXT", 10
                )
            elif operation == "market_analysis":
                amount = CreditService.get_config_value(
                    db, "COST_MARKET_ANALYSIS", 100
                )
            elif operation == "campaign_generation":
                amount = CreditService.get_config_value(
                    db, "COST_CAMPAIGN_GENERATION", 200
                )
            else:
                amount = 0

        if user.credits < amount:
            raise HTTPException(
                status_code=402, 
                detail=f"Yetersiz kredi. Bu işlem {amount} kredi gerektiriyor."
            )

        user.credits -= amount
        db.commit()
        db.refresh(user)
        return True


      