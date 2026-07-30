from fastapi import FastAPI
from app.routers import auth

app = FastAPI(title="Post Generate AI API")

app.include_router(auth.router, prefix="/auth", tags=["auth"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Post Generate AI API"}