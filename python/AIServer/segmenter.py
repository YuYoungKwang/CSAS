
import torch
import torch.nn as nn
import torch.nn.functional as F
import cv2
import numpy as np
from transformers import SegformerForSemanticSegmentation
from torchvision import transforms

class FusionSegFormer(nn.Module):
    def __init__(self, num_classes=11):
        super().__init__()
        self.segformer = SegformerForSemanticSegmentation.from_pretrained(
            "nvidia/mit-b0", 
            num_labels=num_classes,
            ignore_mismatched_sizes=True,
            use_safetensors=True
        )
        self.fusion_conv = nn.Conv2d(in_channels=22, out_channels=11, kernel_size=1)
        
    def forward(self, pixel_values, hints):
        outputs = self.segformer(pixel_values=pixel_values)
        seg_logits = outputs.logits 
        
        batch_size, _, h, w = seg_logits.shape
        hints_spatial = hints.view(batch_size, 11, 1, 1).expand(-1, -1, h, w)
        
        fused_features = torch.cat([seg_logits, hints_spatial], dim=1)
        
        final_logits = self.fusion_conv(fused_features)
        
        final_logits_resized = F.interpolate(
            final_logits, 
            size=pixel_values.shape[-2:], 
            mode="bilinear", 
            align_corners=False
        )
        
        return final_logits_resized



def load_segmentation_model(weight_path, device):
    model = FusionSegFormer(num_classes=11)
    model.load_state_dict(torch.load(weight_path, map_location=device, weights_only=True))
    model.to(device)
    model.eval()
    return model
    
def predict_fusion_mask(model, img_rgb, hints_tensor, valid_indices, device):
    orig_h, orig_w = img_rgb.shape[:2]  

    img_512 = cv2.resize(img_rgb, (512, 512), interpolation=cv2.INTER_LINEAR)
    img_tensor = transforms.ToTensor()(img_512)
    img_tensor = transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])(img_tensor)
    img_tensor = img_tensor.unsqueeze(0).to(device)

    with torch.no_grad():
        logits = model(img_tensor, hints_tensor)
        probs = torch.sigmoid(logits)
        max_probs, max_indices = torch.max(probs, dim=1)
        
        pred_mask_512 = torch.where(max_probs > 0.4, max_indices, torch.zeros_like(max_indices))
        pred_mask_512 = pred_mask_512.squeeze().cpu().numpy().astype(np.uint8)

    for cls_idx in range(1, 11): 
        if cls_idx not in valid_indices:
            pred_mask_512[pred_mask_512 == cls_idx] = 0
            
    MIN_AREA = 20 
    for cls_idx in range(1, 11):
        if cls_idx in valid_indices:
            binary_mask = (pred_mask_512 == cls_idx).astype(np.uint8)
            num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(binary_mask)
            for i in range(1, num_labels):
                if stats[i, cv2.CC_STAT_AREA] < MIN_AREA:
                    pred_mask_512[labels == i] = 0

    hints_np = hints_tensor.squeeze().detach().cpu().numpy()
    valid_hints = hints_np.copy()
    valid_hints[list(set(range(11)) - valid_indices)] = 0
    top_indices = np.argsort(valid_hints[1:])[::-1] + 1 
    top_3_indices = top_indices[:3]
    
    for cls_idx in range(1, 11):
        if cls_idx not in top_3_indices:
            pred_mask_512[pred_mask_512 == cls_idx] = 0

    return cv2.resize(pred_mask_512, (orig_w, orig_h), interpolation=cv2.INTER_NEAREST)
