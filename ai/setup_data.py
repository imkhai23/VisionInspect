import os
from PIL import Image, ImageDraw
import random

def create_mock_image(path, label):
    colors = {
        'good': (34, 197, 94),
        'scratch': (239, 68, 68),
        'dent': (59, 130, 246),
        'crack': (245, 158, 11),
        'contamination': (107, 114, 128),
        'missing_part': (168, 85, 247)
    }
    
    color = colors.get(label, (255, 255, 255))
    img = Image.new('RGB', (224, 224), color=color)
    draw = ImageDraw.Draw(img)
    
    for _ in range(20):
        x1, y1 = random.randint(0, 200), random.randint(0, 200)
        x2, y2 = x1 + random.randint(5, 20), y1 + random.randint(5, 20)
        draw.rectangle([x1, y1, x2, y2], fill=(random.randint(0, 255), random.randint(0, 255), random.randint(0, 255)))

    img.save(path)

def setup():
    base_dir = "ai/data"
    classes = ['good', 'scratch', 'dent', 'crack', 'contamination', 'missing_part']
    splits = ['train', 'val']
    
    print("Dang khoi tao cau truc du lieu...")
    
    for split in splits:
        for cls in classes:
            path = os.path.join(base_dir, split, cls)
            os.makedirs(path, exist_ok=True)
            
            num_images = 20 if split == 'train' else 5
            for i in range(num_images):
                img_path = os.path.join(path, f"{cls}_{i}.jpg")
                create_mock_image(img_path, cls)
    
    print(f"Da tao xong thu muc du lieu tai: {base_dir}")
    print(f"Da tao 120 anh huan luyen va 30 anh kiem tra gia lap.")

if __name__ == "__main__":
    setup()
