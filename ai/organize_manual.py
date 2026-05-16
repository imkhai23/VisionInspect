import os
import shutil

def organize_data():
    base_dir = "ai/data"
    source_root = "ai/temp_extract/bottle"
    
    if not os.path.exists(source_root):
        print(f"Khong tim thay du lieu tai {source_root}. Hay dam bao ban da giai nen thanh cong.")
        return

    # Map ten thu muc MVTec sang VisionInspect
    label_map = {
        "broken": "missing_part",
        "contamination": "contamination",
        "scratch": "scratch"
    }

    # Xoa du lieu cu de nap du lieu that
    for cls in ['good', 'scratch', 'contamination', 'missing_part']:
        for split in ['train', 'val']:
            p = os.path.join(base_dir, split, cls)
            if os.path.exists(p): shutil.rmtree(p)
            os.makedirs(p, exist_ok=True)

    print("Dang phan loai anh...")

    # 1. GOOD (Tu train va test)
    good_files = []
    p_train = os.path.join(source_root, "train", "good")
    p_test = os.path.join(source_root, "test", "good")
    
    if os.path.exists(p_train):
        good_files += [os.path.join(p_train, f) for f in os.listdir(p_train)]
    if os.path.exists(p_test):
        good_files += [os.path.join(p_test, f) for f in os.listdir(p_test)]
        
    split_idx = int(len(good_files) * 0.8)
    for i, src in enumerate(good_files[:split_idx]):
        shutil.copy(src, os.path.join(base_dir, "train", "good", f"good_{i}.png"))
    for i, src in enumerate(good_files[split_idx:]):
        shutil.copy(src, os.path.join(base_dir, "val", "good", f"good_{i}.png"))

    # 2. DEFECTS (Tu test)
    test_root = os.path.join(source_root, "test")
    for src_name, target_name in label_map.items():
        src_path = os.path.join(test_root, src_name)
        if os.path.exists(src_path):
            imgs = [os.path.join(src_path, f) for f in os.listdir(src_path) if f.endswith('.png')]
            split_idx = int(len(imgs) * 0.8)
            for i, src in enumerate(imgs[:split_idx]):
                shutil.copy(src, os.path.join(base_dir, "train", target_name, f"{target_name}_{i}.png"))
            for i, src in enumerate(imgs[split_idx:]):
                shutil.copy(src, os.path.join(base_dir, "val", target_name, f"{target_name}_{i}.png"))

    print("Thanh cong! Du lieu da duoc sap xep vao ai/data.")
    # shutil.rmtree("ai/temp_extract") # Ban co the xoa file tam neu muon

if __name__ == "__main__":
    organize_data()
