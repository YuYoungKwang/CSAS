import torch
import timm
from torchvision import transforms
from utils import CLASS_NAMES

def load_classification_model(weight_path, device):
    model = timm.create_model('efficientnet_b0', pretrained=False, num_classes=11)
    model.load_state_dict(torch.load(weight_path, map_location=device, weights_only=True))
    model.to(device)
    model.eval()
    return model

def get_defect_hints(model, img_rgb, device, threshold=0.3):
    transform = transforms.Compose([
        transforms.ToPILImage(),
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    
    img_tensor = transform(img_rgb).unsqueeze(0).to(device)
    
    with torch.no_grad():
        outputs = model(img_tensor)
        hints_tensor = torch.sigmoid(outputs) 
        
    hints_np = hints_tensor.squeeze().cpu().numpy()
    
    detected_defects = []
    valid_indices = {0}
    
    for i, prob in enumerate(hints_np):
        if prob >= threshold and i != 0:
            detected_defects.append(CLASS_NAMES[i]) 
            valid_indices.add(i)
            
    if len(detected_defects) == 0:
        detected_defects.append("Normal (No Defect)")
        
    return hints_tensor, detected_defects, valid_indices
