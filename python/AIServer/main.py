import cv2
import torch
import numpy as np
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse

from classifier import load_classification_model, get_defect_hints
from segmenter import load_segmentation_model, predict_fusion_mask
from utils import process_results

app = FastAPI(title="AI Server")

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

cls_model = load_classification_model("best_efficientnet_b0_multi_label.pth", device)
seg_model = load_segmentation_model("fusion_segformer_epoch_3.pth", device)

THRESHOLD = 0.001

@app.post("/api/analyze")
async def analyze_image(file: UploadFile = File(...)):
    
    image_bytes = await file.read()
    img_np = np.frombuffer(image_bytes, np.uint8)
    
    orig_img = cv2.imdecode(img_np, cv2.IMREAD_COLOR)
    if orig_img is None:
        return JSONResponse(content={"status": "error", "message": "can't read image."}, status_code=400)
        
    orig_img_rgb = cv2.cvtColor(orig_img, cv2.COLOR_BGR2RGB)

    hints_tensor, detected_defects, valid_indices = get_defect_hints(cls_model, orig_img_rgb, device, threshold=THRESHOLD)

    if valid_indices == {0}:
        return JSONResponse(content={
            "status": "success", 
            "defect_found": False, 
            "detected_defects": detected_defects
        })

    pred_mask_orig = predict_fusion_mask(seg_model, orig_img_rgb, hints_tensor, valid_indices, device)
    
    annotations, encoded_img = process_results(orig_img, pred_mask_orig)
    if len(annotations) == 0:
        return JSONResponse(content={
            "status": "success",
            "defect_found": False, 
            "message": "Classified as defect by 1st model, but no defects found in segmentation.",
            "detected_defects": ["Normal (No Defect) (Revised)"]
        })
    
    return JSONResponse(content={
        "status": "success",
        "defect_found": True,
        "detected_defects": detected_defects, 
        "annotations": annotations,           
        "encoded_img": encoded_img            
    })

    
@app.get("/health")
def health():
    return {"status": "UP"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
