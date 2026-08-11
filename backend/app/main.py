from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, plans, products, campaign, campaign_result, social_action, assets
import os

app = FastAPI(title="Post Generate AI API")

cors_urls = os.getenv("CORS_URL", "http://localhost:3000")
origins = [url.strip() for url in cors_urls.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(plans.router)
app.include_router(products.router, prefix="/products", tags=["products"])
app.include_router(campaign.router, prefix="/campaigns", tags=["campaigns"])
app.include_router(campaign_result.router, prefix="/campaign-results", tags=["campaign-results"])
app.include_router(social_action.router, tags=["social-action"])
app.include_router(assets.router, prefix="/assets", tags=["assets"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Post Generate AI API"}