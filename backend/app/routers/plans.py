from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database.connection import get_db
from app.schemas.plan_schema import PlanResponse
from app.controllers import plan_controller

router = APIRouter(
    prefix="/api/plans",
    tags=["Plans"]
)

@router.get("/", response_model=List[PlanResponse])
def get_plans(db: Session = Depends(get_db)):
    return plan_controller.get_all_plans(db)


