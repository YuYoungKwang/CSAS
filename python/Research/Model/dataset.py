import os
import json
import random
from pathlib import Path
from PIL import Image
import torch
from torch.utils.data import Dataset
from torchvision import transforms
from tqdm.auto import tqdm

def prepare_sampled_data(base_dir):
    print(f"[{base_dir}]")
    
    normal_data = []      
    simple_crack = []     
    other_defects = []    

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
                normal_data.append((str(img_path), 0))
            elif is_defect == "Y":
                annotations = img_info.get("annotations", [])
                labels = {ann.get("label", "").lower() for ann in annotations}
                
                if labels == {"crack"}:
                    simple_crack.append((str(img_path), 1))
                else:
                    other_defects.append((str(img_path), 1))

    random.seed(42)
    if len(simple_crack) > 40000:
        sampled_simple_crack = random.sample(simple_crack, 40000)
    else:
        sampled_simple_crack = simple_crack

    final_data_list = normal_data + sampled_simple_crack + other_defects
    random.shuffle(final_data_list)
    
    print("\n")
    print(f" 전체 데이터 수 : {len(final_data_list):,}장")
    print(f" 정상(0)     : {len(normal_data):,}장")
    print(f" 단순 균열(1): {len(sampled_simple_crack):,}장 ")
    print(f" 기타 결함(1): {len(other_defects):,}장")
    
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
