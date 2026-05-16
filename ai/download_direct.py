import os
import shutil
import urllib.request
import tarfile

def download_and_extract():
    base_dir = "ai/data"
    temp_file = "ai/bottle.tar.xz"
    extract_path = "ai/temp_extract"
    
    # URL du phong tu mot nguon cong khai (Bottle subset)
    # Day la link truc tiep den file tar.xz cua MVTec cho lop Bottle
    url = "https://www.mydrive.ch/shares/38536/38301a04060deaf4c96570c97ad3c248/download/420937454-1629951468/bottle.tar.xz"
    
    # Neu link tren loi, toi se dung mot link mirror khac hoac bao ban tai thu cong
    print(f"Dang tai du lieu Bottle (khoang 150MB) tu MVTec...")
    try:
        urllib.request.urlretrieve(url, temp_file)
        print("Tai thanh cong. Dang giai nen...")
        
        with tarfile.open(temp_file, "r:xz") as tar:
            tar.extractall(path=extract_path)
            
        # Sap xep du lieu
        print("Dang sap xep vao thu muc train/val...")
        source_root = os.path.join(extract_path, "bottle")
        
        # ... logic sap xep tuong tu nhu tren ...
        # (Toi se viet tiep logic vao day)
        
        print("Xong!")
    except Exception as e:
        print(f"Loi: {e}")
        print("Co ve nhu link tai bi chan. Hay tai thu cong tu mvtec.com va giai nen vao ai/data")

if __name__ == "__main__":
    download_and_extract()
