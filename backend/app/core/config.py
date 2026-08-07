from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120

    SUPABASE_URL:str
    SUPABASE_KEY: str
    SYSTEM_PROMPT: str = "json içindeki goal kısmındaki amaca göre içerik yazıları olucak. Logo, Sosyal medya vb. gibi içerikleri kullanma"
    
    class Config:
        env_file = ".env"
        extra="ignore"

settings = Settings()
