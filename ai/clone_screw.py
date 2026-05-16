import os
from huggingface_hub import snapshot_download
import shutil

def clone_screw_dataset():
    base_data_dir = "ai/data"
    
    print("--- Dang bat dau clone danh muc 'screw' tu MVTec AD (Hugging Face) ---")
    
    try:
        download_path = snapshot_download(
            repo_id="m-m-m/mvtec-ad",
            repo_type="dataset",
            allow_patterns="screw/*",
            local_dir="ai/mvtec_screw_raw"
        )
        
        print(f"Da tai xong du lieu ve: {download_path}")
        
        source_root = os.path.join("ai/mvtec_screw_raw", "screw")
        
        label_map = {
            "scratch_head": "scratch",
            "scratch_neck": "scratch",
            "manipulated_front": "missing_part",
            "thread_side": "crack",
            "thread_top": "dent"
        }

        for cls in ['good', 'scratch', 'crack', 'dent', 'missing_part', 'contamination']:
            for split in ['train', 'val']:
                p = os.path.join(base_data_dir, split, cls)
                if os.path.exists(p): shutil.rmtree(p)
                os.makedirs(p, exist_ok=True)

        print("Dang sap xep oc vit...")

        # 1. GOOD
        train_good = os.path.join(source_root, "train", "good")
        test_good = os.path.join(source_root, "test", "good")
        all_good = []
        if os.path.exists(train_good): all_good += [os.path.join(train_good, f) for f in os.listdir(train_good)]
        if os.path.exists(test_good): all_good += [os.path.join(test_good, f) for f in os.listdir(test_good)]
        
        split_idx = int(len(all_good) * 0.8)
        for i, src in enumerate(all_good[:split_idx]):
            shutil.copy(src, os.path.join(base_data_dir, "train", "good", f"screw_good_{i}.png"))
        for i, src in enumerate(all_good[split_idx:]):
            shutil.copy(src, os.path.join(base_data_dir, "val", "good", f"screw_good_{i}.png"))

        # 2. DEFECTS
        test_root = os.path.join(source_root, "test")
        for src_name, target_name in label_map.items():
            src_path = os.path.join(test_root, src_name)
            if os.path.exists(src_path):
                imgs = [os.path.join(src_path, f) for f in os.listdir(src_path) if f.endswith('.png')]
                split_idx = int(len(imgs) * 0.8)
                for i, src in enumerate(imgs[:split_idx]):
                    shutil.copy(src, os.path.join(base_data_dir, "train", target_name, f"screw_{src_name}_{i}.png"))
                for i, src in enumerate(imgs[split_idx:]):
                    shutil.copy(src, os.path.join(base_data_dir, "val", target_name, f"screw_{src_name}_{i}.png"))

        print("Thanh cong! Oc vit that da san sang.")
        
    except Exception as e:
        print(f"Loi: {e}")

if __name__ == "__main__":
    clone_screw_dataset()
