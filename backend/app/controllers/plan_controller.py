from sqlalchemy.orm import Session
from app.models.plan import Plan



def get_all_plans(
    db: Session
):
    return db.query(Plan).order_by(Plan.price.asc()).all()

