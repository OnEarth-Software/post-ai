from fastapi import FastAPI

app = FastAPI(title="Post Generate AI API")

@app.get("/")
def read_root():
    return {"message": "Welcome to Post Generate AI API"}