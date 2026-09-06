from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship
import uuid
from sqlalchemy import Column, String, Boolean, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.sql import func
from app.database.connection import Base

class ProductAnalyze(Base):
    __tablename__ = "product_analyzes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False)
    category = Column(String, nullable=False)
    style = Column(String, nullable=False)
    colors = Column(ARRAY(String), nullable=False)
    audience = Column(String, nullable=False)
    marketing_style = Column(String, nullable=False)
    search_query = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    product = relationship("Product")