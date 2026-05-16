"""
VisionInspect AI — Inference Engine
Handles image loading, preprocessing, and prediction.
"""

import io
import torch
import torch.nn.functional as F
from PIL import Image
from dataclasses import dataclass

from .model import CLASSES, TRANSFORM, load_model


@dataclass
class PredictionResult:
    label: str
    confidence: float
    all_scores: dict[str, float]


class DefectClassifier:
    """
    Singleton inference engine — loads the model once and keeps it in memory.
    Thread-safe for async FastAPI usage (GIL covers torch.no_grad calls).
    """

    _instance: "DefectClassifier | None" = None

    def __new__(cls) -> "DefectClassifier":
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self) -> None:
        if self._initialized:
            return
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = load_model(self.device)
        self._initialized = True
        print(f"[AI] DefectClassifier ready on {self.device}")

    def predict(self, image_bytes: bytes) -> PredictionResult:
        """
        Run inference on raw image bytes.

        Args:
            image_bytes: Raw image file content (JPEG / PNG / WEBP)

        Returns:
            PredictionResult with label, confidence, and per-class scores
        """
        # Load & preprocess
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        tensor = TRANSFORM(image).unsqueeze(0).to(self.device)  # [1, 3, 224, 224]

        # Inference
        with torch.no_grad():
            logits = self.model(tensor)                          # [1, num_classes]
            probs = F.softmax(logits, dim=1).squeeze(0)         # [num_classes]

        # Parse results
        confidence, class_idx = probs.max(dim=0)
        label = CLASSES[class_idx.item()]
        confidence_val = round(confidence.item() * 100, 2)      # percentage

        all_scores = {
            cls: round(probs[i].item() * 100, 2)
            for i, cls in enumerate(CLASSES)
        }

        return PredictionResult(
            label=label,
            confidence=confidence_val,
            all_scores=all_scores,
        )


# Module-level singleton access
_classifier: DefectClassifier | None = None


def get_classifier() -> DefectClassifier:
    """FastAPI dependency — returns the singleton classifier."""
    global _classifier
    if _classifier is None:
        _classifier = DefectClassifier()
    return _classifier
