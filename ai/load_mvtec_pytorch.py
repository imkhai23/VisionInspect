import os
import shutil
from torchvision.datasets import MVTecAD

def setup_mvtec_with_pytorch():
    base_dir = "ai/data"
    temp_dir = "ai/temp_mvtec"
    category = "bottle"
    
    print(f"Dang tai du lieu {category} tu MVTec AD bang Torchvision...")
    try:
        # Tai du lieu ve thu muc tam
        # Luu y: MVTecAD se tai file .tar va giai nen
        train_ds = MVTecAD(root=temp_dir, category=category, split='train', download=True)
        test_ds = MVTecAD(root=temp_dir, category=category, split='test', download=True)
    except Exception as e:
        print(f"Loi khi tai du lieu: {e}")
        return

    print("Dang sap xep lai du lieu...")
    
    # Xoa du lieu cu
    target_classes = ['good', 'scratch', 'contamination', 'missing_part']
    for cls in target_classes:
        for split in ['train', 'val']:
            path = os.path.join(base_dir, split, cls)
            if os.path.exists(path):
                shutil.rmtree(path)
            os.makedirs(path, exist_ok=True)

    # Thu muc goc sau khi Torchvision giai nen thinh thoang co cau truc:
    # ai/temp_mvtec/bottle/train/good/...
    source_root = os.path.join(temp_dir, category)
    
    # 1. Xu ly GOOD (Tu train va test)
    train_good_path = os.path.join(source_root, "train", "good")
    test_good_path = os.path.join(source_root, "test", "good")
    
    all_good = []
    if os.path.exists(train_good_path):
        all_good += [os.path.join(train_good_path, f) for f in os.listdir(train_good_path)]
    if os.path.exists(test_good_path):
        all_good += [os.path.join(test_good_path, f) for f in os.listdir(test_good_path)]
        
    split_idx = int(len(all_good) * 0.8)
    for i, src in enumerate(all_good[:split_idx]):
        shutil.copy(src, os.path.join(base_dir, "train", "good", f"good_{i}.png"))
    for i, src in enumerate(all_good[split_idx:]):
        shutil.copy(src, os.path.join(base_dir, "val", "good", f"good_{i}.png"))

    # 2. Xu ly Lloi (Tu test)
    # Map ten thu muc goc sang ten cua minh
    label_map = {
        "broken": "missing_part",
        "contamination": "contamination",
        "scratch": "scratch"
    }

    test_root = os.path.join(source_root, "test")
    for src_name, target_name in label_map.items():
        src_path = os.path.join(test_root, src_name)
        if os.path.exists(src_path):
            imgs = [os.path.join(src_path, f) for f in os.listdir(src_path)]
            split_idx = int(len(imgs) * 0.8)
            for i, src in enumerate(imgs[:split_idx]):
                shutil.copy(src, os.path.join(base_dir, "train", target_name, f"{target_name}_{i}.png"))
            for i, src in enumerate(imgs[split_idx:]):
                shutil.copy(src, os.path.join(base_dir, "val", target_name, f"{target_name}_{i}.png"))

    # Don dep thu muc tam
    # shutil.rmtree(temp_dir)
    print(f"Hoan tat! Du lieu da san sang tai {base_dir}")

if __name__ == "__main__":
    setup_mvtec_with_pytorch()
