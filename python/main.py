from typing import List, Optional

from fastapi import FastAPI, File, UploadFile
from pydantic import BaseModel, Field


app = FastAPI(title="crackSensingAiService AI Server")


class AiAnalysisRequest(BaseModel):
    objectKey: str = Field(..., min_length=1)


class AiAnnotation(BaseModel):
    class_id: int
    class_name: str
    points: List[List[int]]


class AiAnalysisResponse(BaseModel):
    status: str
    message: Optional[str] = None
    defect_found: bool
    annotations: List[AiAnnotation]


@app.get("/health")
def health():
    return {"status": "UP"}


@app.post("/api/analyze", response_model=AiAnalysisResponse)
def analyze(file: UploadFile = File(...)):
    return {
        "status": "success",
        "message": None,
        "defect_found": False,
        "annotations": [],
    }
