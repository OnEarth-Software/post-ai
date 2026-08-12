import uuid
from sqlalchemy import Column, String, Float, DateTime, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.database.connection import Base

class Plan(Base):
    __tablename__ = "plans"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    price = Column(Float, nullable=False, default=0.0)
    design_limit = Column(Integer, nullable=False, default=5)
    product_limit = Column(Integer, nullable=False, default=5)
    created_at = Column(DateTime(timezone=True), server_default=func.now())