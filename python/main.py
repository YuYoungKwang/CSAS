from fastapi import FastAPI
from pydantic import BaseModel, HttpUrl


app = FastAPI(title="crackSensingAiService AI Server")


class ClassifierRequest(BaseModel):
    imageId: str
    objectUrl: HttpUrl


@app.get("/health")
def health():
    return {"status": "UP"}


@app.post("/api/classify")
def classify(payload: ClassifierRequest):
    return {
        "imageId": payload.imageId,
        "status": "received",
        "message": "Classification request received.",
    }
