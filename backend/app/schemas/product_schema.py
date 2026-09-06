from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid

class ProductBase(BaseModel):
    name: str
    image_url: str
    brand_id: Optional[uuid.UUID] = None

class ProductCreate(BaseModel):
    name: str
    brand_id: Optional[uuid.UUID] = None

class ProductAnalyzeResponse(BaseModel):
    category: str
    style: str
    colors: List[str]
    audience: str
    marketing_style: str
    search_query: Optional[str] = None
    
    class Config:
        from_attributes = True

class ProductAnalysisUpdate(BaseModel):
    category: Optional[str] = None
    style: Optional[str] = None
    colors: Optional[List[str]] = None
    audience: Optional[str] = None
    marketing_style: Optional[str] = None
    search_query: Optional[str] = None

class ProductResponse(ProductBase):
    id: uuid.UUID
    user_id: Optional[uuid.UUID] = None
    created_at: datetime
    analysis: Optional[ProductAnalyzeResponse] = None 

    class Config:
        from_attributes = True
