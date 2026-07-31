from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, plans

app = FastAPI(title="Post Generate AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(plans.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Post Generate AI API"}