"""
VisionInspect AI — Training Script
Fine-tunes ResNet-50 on a custom defect dataset.

Dataset folder structure expected:
    data/
    ├── train/
    │   ├── good/
    │   ├── scratch/
    │   ├── dent/
    │   └── ...
    └── val/
        ├── good/
        ├── scratch/
        └── ...

Usage:
    python train.py --data_dir ./data --epochs 30 --lr 1e-3
"""

import argparse
import json
from pathlib import Path

import torch
import torch.nn as nn
from torch.optim import AdamW
from torch.optim.lr_scheduler import CosineAnnealingLR
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
from tqdm import tqdm

from model import build_model, MODEL_PATH, NUM_CLASSES


# ── Augmentation pipelines (Nâng cấp với RandAugment) ──────────────────────────
TRAIN_TRANSFORM = transforms.Compose([
    transforms.Resize((256, 256)),
    transforms.RandomResizedCrop(224, scale=(0.8, 1.0)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomVerticalFlip(),
    transforms.RandAugment(num_ops=2, magnitude=9), # Tự động tăng cường ảnh nâng cao
    transforms.ColorJitter(brightness=0.1, contrast=0.1),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])

VAL_TRANSFORM = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])


def train_one_epoch(model, loader, criterion, optimizer, device, epoch):
    model.train()
    # Unfreeze backbone after epoch 5 for fine-tuning
    if epoch == 5:
        for param in model.parameters():
            param.requires_grad = True
        print("[Train] Backbone unfrozen for fine-tuning")

    total_loss, correct, total = 0.0, 0, 0
    for images, labels in tqdm(loader, desc=f"Epoch {epoch} [Train]"):
        images, labels = images.to(device), labels.to(device)
        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        total_loss += loss.item() * images.size(0)
        correct += (outputs.argmax(1) == labels).sum().item()
        total += images.size(0)

    return total_loss / total, correct / total


@torch.no_grad()
def evaluate(model, loader, criterion, device):
    model.eval()
    total_loss, correct, total = 0.0, 0, 0
    for images, labels in tqdm(loader, desc="Validating"):
        images, labels = images.to(device), labels.to(device)
        outputs = model(images)
        loss = criterion(outputs, labels)
        total_loss += loss.item() * images.size(0)
        correct += (outputs.argmax(1) == labels).sum().item()
        total += images.size(0)
    return total_loss / total, correct / total


def main():
    parser = argparse.ArgumentParser(description="Train VisionInspect defect classifier")
    parser.add_argument("--data_dir", type=str, default="./data")
    parser.add_argument("--epochs", type=int, default=30)
    parser.add_argument("--batch_size", type=int, default=32)
    parser.add_argument("--lr", type=float, default=1e-3)
    parser.add_argument("--workers", type=int, default=4)
    args = parser.parse_args()

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"[Train] Using device: {device}")

    # Datasets
    data_dir = Path(args.data_dir)
    train_ds = datasets.ImageFolder(data_dir / "train", transform=TRAIN_TRANSFORM)
    val_ds = datasets.ImageFolder(data_dir / "val", transform=VAL_TRANSFORM)

    train_loader = DataLoader(train_ds, batch_size=args.batch_size, shuffle=True,
                              num_workers=args.workers, pin_memory=True)
    val_loader = DataLoader(val_ds, batch_size=args.batch_size, shuffle=False,
                            num_workers=args.workers, pin_memory=True)

    print(f"[Train] Classes: {train_ds.classes}")
    print(f"[Train] Train samples: {len(train_ds)}, Val samples: {len(val_ds)}")

    # Tính toán Class Weights để xử lý dữ liệu không cân bằng
    class_counts = [len([1 for _, label in train_ds.samples if label == i]) for i in range(len(train_ds.classes))]
    class_weights = 1.0 / torch.tensor(class_counts, dtype=torch.float)
    class_weights = (class_weights / class_weights.sum()) * len(train_ds.classes)
    class_weights = class_weights.to(device)

    # Model
    model = build_model(num_classes=NUM_CLASSES, pretrained=True).to(device)
    
    # Criterion với Class Weights và Label Smoothing
    criterion = nn.CrossEntropyLoss(weight=class_weights, label_smoothing=0.1)
    
    # Optimizer AdamW với Weight Decay để tránh Overfitting
    optimizer = AdamW(filter(lambda p: p.requires_grad, model.parameters()), 
                      lr=args.lr, weight_decay=0.01)
    
    scheduler = CosineAnnealingLR(optimizer, T_max=args.epochs)

    # Training loop
    best_val_acc = 0.0
    history = []
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)

    for epoch in range(1, args.epochs + 1):
        train_loss, train_acc = train_one_epoch(model, train_loader, criterion, optimizer, device, epoch)
        val_loss, val_acc = evaluate(model, val_loader, criterion, device)
        scheduler.step()

        history.append({
            "epoch": epoch,
            "train_loss": round(train_loss, 4),
            "train_acc": round(train_acc, 4),
            "val_loss": round(val_loss, 4),
            "val_acc": round(val_acc, 4),
        })

        print(f"Epoch {epoch:3d} | Train Loss: {train_loss:.4f} Acc: {train_acc:.4f} "
              f"| Val Loss: {val_loss:.4f} Acc: {val_acc:.4f}")

        if val_acc > best_val_acc:
            best_val_acc = val_acc
            torch.save(model.state_dict(), MODEL_PATH)
            print(f"  ✅ New best model saved (val_acc={val_acc:.4f})")

    # Save training history
    with open(MODEL_PATH.parent / "history.json", "w") as f:
        json.dump(history, f, indent=2)

    print(f"\n[Train] Done! Best val accuracy: {best_val_acc:.4f}")
    print(f"[Train] Model saved to: {MODEL_PATH}")


if __name__ == "__main__":
    main()
