import os
import json
import random
from pathlib import Path
from PIL import Image
import torch
from torch.utils.data import Dataset
from torchvision import transforms
from tqdm import tqdm

LABEL_MAP = {
    "normal": 0,
    "crack": 1,
    "leak": 2,
    "efflorescence": 3,
    "detachment": 4,
    "reticular crack": 5,
    "spalling": 6,
    "material separation": 7,
    "rebar": 8,
    "damage": 9,
    "exhilaration": 10
}

def prepare_sampled_data(base_dir):
    print(f"[{base_dir}]")
    
    data_by_class = {i: [] for i in range(11)}

    json_paths = list(Path(base_dir).rglob("*.json"))
    
    for json_path in tqdm(json_paths):
        img_path_str = str(json_path).replace('02.라벨링데이터', '01.원천데이터')
        img_path_str = img_path_str.replace('02.라벨링데이터', '01.원천데이터')
        img_path_str = img_path_str.replace('TL_', 'TS_')
        img_path_str = img_path_str.replace('.json', '.jpg')        
        img_path = Path(img_path_str)
        
        if not img_path.exists():
            continue

        with open(json_path, 'r', encoding='utf-8') as f:
            try:
                data = json.load(f)
            except json.JSONDecodeError:
                continue
                
            img_info = data.get("image", {})
            is_defect = img_info.get("object_included", "N")
            
            if is_defect == "N":
                data_by_class[0].append((str(img_path), 0))
                
            elif is_defect == "Y":
                annotations = img_info.get("annotations", [])
                
                for ann in annotations:
                    label_str = ann.get("label", "").lower().strip()
                    label_str = label_str.replace("_", " ") 
                    
                    if label_str in LABEL_MAP:
                        class_id = LABEL_MAP[label_str]
                        data_by_class[class_id].append((str(img_path), class_id))
                        break 

    random.seed(42)
    CRACK_CLASS_ID = 1
    if len(data_by_class[CRACK_CLASS_ID]) > 40000:
        data_by_class[CRACK_CLASS_ID] = random.sample(data_by_class[CRACK_CLASS_ID], 40000)

    final_data_list = []
    for class_id, data_list in data_by_class.items():
        final_data_list.extend(data_list)
        
    random.shuffle(final_data_list)
    
    print("\n")
    print(f" 전체 데이터 수 : {len(final_data_list):,}장")
    print("-" * 30)
    for label_name, class_id in LABEL_MAP.items():
        print(f" {label_name:<20} ({class_id:2d}) : {len(data_by_class[class_id]):,}장")
    print("-" * 30)
        
    return final_data_list

class CrackDataset(Dataset):
    def __init__(self, data_list, transform=None):
        self.data_list = data_list
        self.transform = transform

    def __len__(self):
        return len(self.data_list)

    def __getitem__(self, idx):
        img_path, label = self.data_list[idx]
        image = Image.open(img_path).convert("RGB")
        
        if self.transform:
            image = self.transform(image)
            
        return image, torch.tensor(label, dtype=torch.long)
