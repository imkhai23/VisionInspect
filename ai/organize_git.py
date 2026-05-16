import os
import shutil

def organize_from_git():
    base_dir = "ai/data"
    # Thu muc nguon sau khi clone tu ndb796/MVTec-AD-Dataset-Sample
    source_root = "ai/temp_git/bottle"
    
    if not os.path.exists(source_root):
        print(f"Loi: Khong tim thay thu muc {source_root}. Hay chac chan ban da chay 'git clone' thanh cong.")
        return

    # Map ten thu muc
    label_map = {
        "broken": "missing_part",
        "contamination": "contamination",
        "scratch": "scratch"
    }

    # Don dep thu muc data
    for cls in ['good', 'scratch', 'contamination', 'missing_part']:
        for split in ['train', 'val']:
            p = os.path.join(base_dir, split, cls)
            if os.path.exists(p): shutil.rmtree(p)
            os.makedirs(p, exist_ok=True)

    print("Dang phan loai anh tu nguon Git...")

    # 1. GOOD
    # Trong repo nay thuong co cau truc bottle/train/good va bottle/test/good
    good_files = []
    for root_dir in [os.path.join(source_root, "train", "good"), os.path.join(source_root, "test", "good")]:
        if os.path.exists(root_dir):
            good_files += [os.path.join(root_dir, f) for f in os.listdir(root_dir) if f.endswith(('.png', '.jpg'))]
    
    split_idx = int(len(good_files) * 0.8)
    for i, src in enumerate(good_files[:split_idx]):
        shutil.copy(src, os.path.join(base_dir, "train", "good", f"good_{i}.png"))
    for i, src in enumerate(good_files[split_idx:]):
        shutil.copy(src, os.path.join(base_dir, "val", "good", f"good_{i}.png"))

    # 2. DEFECTS
    test_root = os.path.join(source_root, "test")
    for src_name, target_name in label_map.items():
        src_path = os.path.join(test_root, src_name)
        if os.path.exists(src_path):
            imgs = [os.path.join(src_path, f) for f in os.listdir(src_path) if f.endswith(('.png', '.jpg'))]
            split_idx = int(len(imgs) * 0.8)
            for i, src in enumerate(imgs[:split_idx]):
                shutil.copy(src, os.path.join(base_dir, "train", target_name, f"{target_name}_{i}.png"))
            for i, src in enumerate(imgs[split_idx:]):
                shutil.copy(src, os.path.join(base_dir, "val", target_name, f"{target_name}_{i}.png"))

    print("✅ Thanh cong! Anh that tu MVTec Bottle da duoc nap vao he thong.")
    print("Bay gio ban co the bat dau huan luyen bang cach chay: python ai/train.py")

if __name__ == "__main__":
    organize_from_git()
