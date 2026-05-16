"""
VisionInspect AI — Real-time Vision Engine
Uses YOLOv8 for detection, tracking, and product counting.
"""

import os
import cv2
import numpy as np
from ultralytics import YOLO
from dataclasses import dataclass
from typing import List, Dict, Any, Tuple


@dataclass
class TrackedObject:
    track_id: int
    label: str
    confidence: float
    bbox: List[float]  # [x1, y1, x2, y2]
    status: str  # "GOOD" or "DEFECT"
    counted: bool = False


class VisionEngine:
    """
    Real-time vision processing engine using YOLOv8 and ByteTrack.
    """

    def __init__(self, model_path: str = "yolov8n.pt", conf_threshold: float = 0.5):
        """
        Initialize the vision engine.
        
        Args:
            model_path: Path to YOLOv8 model weights (.pt)
            conf_threshold: Minimum confidence for detections
        """
        # In a real app, this would be a custom model like 'weights/best.pt'
        # If 'yolov8n.pt' doesn't exist, ultralytics will download it automatically.
        self.model = YOLO(model_path)
        self.conf_threshold = conf_threshold
        
        # Counting stats
        self.total_count = 0
        self.good_count = 0
        self.defect_count = 0
        
        # Set of IDs already counted to prevent double counting
        self.counted_ids = set()
        
        # Detection zone (optional - can be full frame or specific ROI)
        # For now, we'll use a simple "line crossing" logic or just "in-frame" logic.
        print(f"[VisionEngine] Initialized with {model_path}")

    def process_frame(self, frame: np.ndarray) -> Tuple[np.ndarray, List[TrackedObject], Dict[str, Any]]:
        """
        Process a single video frame for detection and tracking.
        
        Args:
            frame: Input image (OpenCV BGR format)
            
        Returns:
            Tuple of (Annotated Frame, List of Tracked Objects, Stats Dictionary)
        ```
        """
        # Run YOLOv8 tracking (ByteTrack is default)
        results = self.model.track(
            source=frame, 
            persist=True, 
            conf=self.conf_threshold,
            iou=0.5,
            show=False,
            verbose=False
        )
        
        tracked_objects = []
        
        if results[0].boxes.id is not None:
            boxes = results[0].boxes.xyxy.cpu().numpy()
            track_ids = results[0].boxes.id.int().cpu().numpy()
            confidences = results[0].boxes.conf.cpu().numpy()
            class_ids = results[0].boxes.cls.int().cpu().numpy()
            names = self.model.names

            for box, track_id, conf, cls_id in zip(boxes, track_ids, confidences, class_ids):
                label = names[cls_id]
                
                # Logic for GOOD vs DEFECT
                # In this demo, we'll simulate logic or use class names if the model is trained for it.
                # Let's assume class '0' is product and we do some heuristic, 
                # or the model has classes 'good' and 'defect'.
                status = "GOOD"
                if "defect" in label.lower() or "error" in label.lower():
                    status = "DEFECT"
                
                obj = TrackedObject(
                    track_id=int(track_id),
                    label=label,
                    confidence=float(conf),
                    bbox=box.tolist(),
                    status=status
                )
                
                # Counting logic: If a new ID appears and it's within a certain area (e.g., center 60% of frame)
                # or simply if it's the first time we see this ID.
                if track_id not in self.counted_ids:
                    self.total_count += 1
                    if status == "GOOD":
                        self.good_count += 1
                    else:
                        self.defect_count += 1
                    self.counted_ids.add(track_id)
                    obj.counted = True
                
                tracked_objects.append(obj)
                
                # Drawing on frame
                color = (0, 255, 0) if status == "GOOD" else (0, 0, 255)
                x1, y1, x2, y2 = map(int, box)
                cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                cv2.putText(frame, f"ID:{track_id} {label} {conf:.2f}", (x1, y1 - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

        stats = {
            "total": self.total_count,
            "good": self.good_count,
            "defect": self.defect_count,
            "fps": results[0].speed['inference'] # approx
        }
        
        return frame, tracked_objects, stats

    def reset_stats(self):
        """Reset the counters."""
        self.total_count = 0
        self.good_count = 0
        self.defect_count = 0
        self.counted_ids.clear()
