import uuid
from sqlalchemy import Column, String, Boolean, DateTime, JSON, ForeignKey, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.database.connection import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    surname = Column(String, nullable=False)
    password_hash = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    role = Column(String, default="user", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    design_limit = Column(Integer, default=5, nullable=False)
    product_limit = Column(Integer, default=5, nullable=False)
    is_2fa_enabled = Column(Boolean, default=False)
    two_factor_secret = Column(String, nullable=True)

    plan_id = Column(UUID(as_uuid=True), ForeignKey("plans.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    plan = relationship("Plan")
    likes = relationship("Like", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", foreign_keys="[Notification.user_id]", back_populates="user", cascade="all, delete-orphan")