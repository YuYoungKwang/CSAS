# utils.py
import cv2
import numpy as np
import base64

CLASS_NAMES = {
    1: "Crack", 2: "Leak", 3: "Efflorescence", 4: "Detachment", 5: "Reticular crack", 
    6: "Spalling", 7: "Material separation", 8: "Rebar", 9: "Damage", 10: "Exhilaration"
}

COLOR_MAP = {
    1: (0, 0, 255),    2: (255, 0, 0),    3: (200, 200, 200),
    4: (0, 255, 255),  5: (255, 0, 255),  6: (0, 165, 255),
    7: (255, 255, 0),  8: (19, 69, 139),  9: (128, 0, 128),  10: (0, 255, 0)
}

def process_results(orig_img, pred_mask_orig):
    annotations = []
    overlay_img = orig_img.copy()
    
    for class_id, class_name in CLASS_NAMES.items():
        binary_mask = (pred_mask_orig == class_id).astype(np.uint8) 
        if np.sum(binary_mask) == 0: continue
            
        contours, _ = cv2.findContours(binary_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        color = COLOR_MAP.get(class_id, (0, 0, 255))
        
        for contour in contours:
            if cv2.contourArea(contour) < 10: continue
                
            points = contour.reshape(-1, 2).tolist()
            annotations.append({
                "class_id": class_id,
                "class_name": class_name,
                "points": points
            })
            
            cv2.polylines(overlay_img, [contour], isClosed=True, color=color, thickness=3)

    _, buffer = cv2.imencode('.jpg', overlay_img)
    encoded_img = base64.b64encode(buffer).decode('utf-8')

    return annotations, encoded_img
