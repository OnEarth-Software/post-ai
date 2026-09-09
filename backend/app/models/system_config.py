from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from app.database.connection import Base


class SystemConfig(Base):
    __tablename__ = "system_configs"


    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, index=True, nullable=False)
    value = Column(Text, nullable=False)
    description = Column(String, nullable=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())