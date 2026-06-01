from fastapi import FastAPI
from pydantic import BaseModel, HttpUrl


app = FastAPI(title="crackSensingAiService AI Server")


class ClassifierRequest(BaseModel):
    imageId: str
    objectUrl: HttpUrl


class ClassifierResponse(BaseModel):
    imageId: str
    cracked: int
    crackType: int
    crackPos: list[list[int]]


@app.get("/health")
def health():
    return {"status": "UP"}


@app.post("/api/classify")
def classify(payload: ClassifierRequest):
    return ClassifierResponse(
        imageId=payload.imageId,
        cracked=1,
        crackType=7,
        crackPos=[[14, 10], [31, 85]],
    )
