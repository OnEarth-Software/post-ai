import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.connection import Base



class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False)
    product_analyze_id = Column(UUID(as_uuid=True), ForeignKey("product_analyzes.id"), nullable=False)
    goal = Column(String, nullable=False)
    platform = Column(String, nullable=False)
    type = Column(String, nullable=False)
    user_prompt = Column(String, nullable=True)
    system_prompt = Column(String, nullable=True)
    
    slogan = Column(String, nullable=True)
    subtext = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    product = relationship("Product")
    product_analyze = relationship("ProductAnalyze")
    results = relationship("CampaignResult", back_populates="campaign", cascade="all, delete-orphan")