import uuid
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.connection import Base


class ApiExpense(Base):
    __tablename__ = "api_expense"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    service_type = Column(String, nullable=False)
    tokens_used = Column(Integer, default=0)
    prompt_tokens = Column(Integer, default=0)    
    completion_tokens = Column(Integer, default=0)
    cost = Column(Float, default=0.0)
    related_entity_id = Column(UUID(as_uuid=True), nullable=True) 
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")