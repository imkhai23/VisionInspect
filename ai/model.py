"""
VisionInspect AI — ResNet-50 Fine-tuned Defect Classifier
"""

import torch
import torch.nn as nn
from torchvision import models, transforms
from pathlib import Path

# Defect classes must match torchvision.datasets.ImageFolder's alphabetical
# folder order used during training.
CLASSES = [
    "contamination",
    "crack",
    "dent",
    "good",
    "missing_part",
    "scratch",
]

NUM_CLASSES = len(CLASSES)
MODEL_PATH = Path(__file__).parent / "weights" / "defect_classifier.pth"

# ── Image preprocessing pipeline ──────────────────────────────────────────────
TRANSFORM = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],  # ImageNet stats
        std=[0.229, 0.224, 0.225],
    ),
])


def build_model(num_classes: int = NUM_CLASSES, pretrained: bool = True) -> nn.Module:
    """
    Build a fine-tuned ResNet-50 for defect classification.
    The final fully-connected layer is replaced with a new head.
    """
    weights = models.ResNet50_Weights.DEFAULT if pretrained else None
    model = models.resnet50(weights=weights)

    # Freeze all backbone layers (transfer learning)
    for param in model.parameters():
        param.requires_grad = False

    # Replace classifier head
    in_features = model.fc.in_features
    model.fc = nn.Sequential(
        nn.Dropout(p=0.3),
        nn.Linear(in_features, 256),
        nn.ReLU(),
        nn.Dropout(p=0.2),
        nn.Linear(256, num_classes),
    )

    return model


def load_model(device: torch.device | None = None) -> nn.Module:
    """
    Load the trained model from disk.
    Falls back to a randomly-initialized model if weights don't exist
    (useful for cold-start / testing).
    """
    if device is None:
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    model = build_model(pretrained=False)

    if MODEL_PATH.exists():
        state_dict = torch.load(MODEL_PATH, map_location=device, weights_only=True)
        model.load_state_dict(state_dict)
        print(f"[AI] Loaded weights from {MODEL_PATH}")
    else:
        print("[AI] WARNING: No weights found — using random initialization")

    model.to(device)
    model.eval()
    return model
