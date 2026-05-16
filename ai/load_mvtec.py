import os
import shutil
from datasets import load_dataset
from PIL import Image
import numpy as np

def save_image(img_data, path):
    try:
        if isinstance(img_data, Image.Image):
            img_data.save(path)
        else:
            Image.fromarray(np.array(img_data)).save(path)
    except Exception as e:
        print(f"Error saving {path}: {e}")

def setup_mvtec_bottle():
    base_dir = "ai/data"
    target_classes = ['good', 'scratch', 'contamination', 'missing_part']
    
    print("Dang tai dataset MVTec AD (phan bottle) tu mirror Bingsu...")
    try:
        # Su dung ban mirror on dinh hon
        ds = load_dataset("Bingsu/MVTec-AD", "bottle")
    except Exception as e:
        print(f"Loi khi tai dataset: {e}")
        return
    
    for cls in target_classes:
        for split in ['train', 'val']:
            path = os.path.join(base_dir, split, cls)
            if os.path.exists(path):
                shutil.rmtree(path)
            os.makedirs(path, exist_ok=True)

    print("Dang phan loai va luu anh...")

    train_all = ds['train']
    test_all = ds['test']

    # Trong dataset Bingsu, label: 0:good, 1:broken, 2:contamination, 3:scratch
    
    # 1. GOOD
    good_imgs = [img for img in train_all if img['label'] == 0] + [img for img in test_all if img['label'] == 0]
    split_idx = int(len(good_imgs) * 0.8)
    for i, item in enumerate(good_imgs[:split_idx]):
        save_image(item['image'], f"{base_dir}/train/good/good_{i}.jpg")
    for i, item in enumerate(good_imgs[split_idx:]):
        save_image(item['image'], f"{base_dir}/val/good/good_{i}.jpg")

    # 2. DEFECTS
    label_map = {
        1: 'missing_part',
        2: 'contamination',
        3: 'scratch'
    }

    for label_num, class_name in label_map.items():
        defect_imgs = [img for img in test_all if img['label'] == label_num]
        split_idx = int(len(defect_imgs) * 0.8)
        for i, item in enumerate(defect_imgs[:split_idx]):
            save_image(item['image'], f"{base_dir}/train/{class_name}/{class_name}_{i}.jpg")
        for i, item in enumerate(defect_imgs[split_idx:]):
            save_image(item['image'], f"{base_dir}/val/{class_name}/{class_name}_{i}.jpg")

    print(f"Hoantat! Da nap du lieu that vao: {base_dir}")

if __name__ == "__main__":
    setup_mvtec_bottle()
