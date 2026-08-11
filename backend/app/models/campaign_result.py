import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey,Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.connection import Base

class CampaignResult(Base):
    __tablename__ = "campaign_results"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    campaign_id = Column(UUID(as_uuid=True), ForeignKey("campaigns.id"), nullable=False)
    image_url = Column(String, nullable=False)
    is_public = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # İlişki
    campaign = relationship("Campaign", back_populates="results")
    likes = relationship("Like", back_populates="campaign_result", cascade="all, delete-orphan")
