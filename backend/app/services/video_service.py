"""
VisionInspect Backend — Video Processing Service
Handles camera capture, AI inference loop, and frame distribution.
"""

import cv2
import time
import threading
import queue
import asyncio
import os
from collections import deque
from typing import Dict, List, Any, Optional
from ai.vision_engine import VisionEngine
from app.services.alert_service import get_alert_service


class VideoProcessor:
    """
    Manages the camera stream and AI processing in a background thread.
    Includes smart recording logic.
    """

    def __init__(self, source: str = "0", model_path: str = "yolov8n.pt"):
        self.source = source
        self.engine = VisionEngine(model_path=model_path)
        self.cap = None
        self.is_running = False
        self.thread = None
        
        # Queues for distributing results
        self.frame_queue = queue.Queue(maxsize=10)
        self.metadata_queue = queue.Queue(maxsize=10)
        
        # Smart Recording Buffer (3 seconds @ 30fps = 90 frames)
        self.frame_buffer = deque(maxlen=90)
        self.record_dir = "storage/defects"
        os.makedirs(self.record_dir, exist_ok=True)
        
        # Latest stats
        self.stats = {"total": 0, "good": 0, "defect": 0, "fps": 0}
        
        # Lock for thread safety
        self.lock = threading.Lock()

    def start(self):
        """Start the video processing thread."""
        if self.is_running:
            return
        
        self.is_running = True
        self.thread = threading.Thread(target=self._run, daemon=True)
        self.thread.start()
        print(f"[VideoProcessor] Started with source {self.source}")

    def stop(self):
        """Stop the video processing thread."""
        self.is_running = False
        if self.thread:
            self.thread.join()
        if self.cap:
            self.cap.release()
            self.cap = None
        print("[VideoProcessor] Stopped")

    def set_source(self, new_source: str):
        """Switch to a new camera source and restart the thread."""
        was_running = self.is_running
        if was_running:
            self.stop()
        
        self.source = new_source
        print(f"[VideoProcessor] Source changed to {self.source}")
        
        if was_running:
            self.start()

    def _save_defect_data(self, frame, obj_id, conf, tracked_objs):
        """Save snapshot and trigger recording for a defect."""
        timestamp = int(time.time())
        filename = f"defect_{obj_id}_{timestamp}"
        
        # Save snapshot
        snapshot_path = os.path.join(self.record_dir, f"{filename}.jpg")
        cv2.imwrite(snapshot_path, frame)
        
        # Trigger Telegram alert (async)
        alert_service = get_alert_service()
        asyncio.run(alert_service.send_defect_alert(obj_id, conf, snapshot_path))
        
        # Save Video Clip (from buffer)
        video_path = os.path.join(self.record_dir, f"{filename}.mp4")
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        height, width, _ = frame.shape
        out = cv2.VideoWriter(video_path, fourcc, 20.0, (width, height))
        
        # Write buffered frames
        with self.lock:
            for f in list(self.frame_buffer):
                out.write(f)
        out.release()
        print(f"[VideoProcessor] Saved defect record: {filename}")

    def _run(self):
        """Main loop for capturing and processing frames."""
        if self.source.isdigit():
            self.cap = cv2.VideoCapture(int(self.source))
        else:
            self.cap = cv2.VideoCapture(self.source)

        if not self.cap.isOpened():
            print(f"[VideoProcessor] Error: Could not open source {self.source}")
            self.is_running = False
            return

        while self.is_running:
            ret, frame = self.cap.read()
            if not ret:
                time.sleep(1)
                continue

            # Store original frame in buffer for recording
            with self.lock:
                self.frame_buffer.append(frame.copy())

            # Process frame with AI
            annotated_frame, tracked_objs, stats = self.engine.process_frame(frame)
            
            # Check for NEW defects to trigger recording
            for obj in tracked_objs:
                if obj.status == "DEFECT" and obj.counted:
                    # New defect detected!
                    threading.Thread(
                        target=self._save_defect_data, 
                        args=(frame.copy(), obj.track_id, obj.confidence * 100, tracked_objs),
                        daemon=True
                    ).start()

            with self.lock:
                self.stats = stats

            # Convert to JPEG for streaming
            _, buffer = cv2.imencode('.jpg', annotated_frame)
            frame_bytes = buffer.tobytes()

            try:
                if self.frame_queue.full():
                    self.frame_queue.get_nowait()
                self.frame_queue.put_nowait(frame_bytes)
                
                if self.metadata_queue.full():
                    self.metadata_queue.get_nowait()
                
                metadata = {
                    "objects": [obj.__dict__ for obj in tracked_objs],
                    "stats": stats,
                    "timestamp": time.time()
                }
                self.metadata_queue.put_nowait(metadata)
            except queue.Full:
                pass

    def get_frame(self) -> Optional[bytes]:
        """Get the latest processed frame."""
        try:
            return self.frame_queue.get(timeout=1.0)
        except queue.Empty:
            return None

    def get_metadata(self) -> Optional[Dict[str, Any]]:
        """Get the latest metadata."""
        try:
            return self.metadata_queue.get(timeout=1.0)
        except queue.Empty:
            return None


# Global instance for the app
_video_processor: Optional[VideoProcessor] = None

def get_video_processor() -> VideoProcessor:
    global _video_processor
    if _video_processor is None:
        settings = get_settings()
        # Default to settings source (can be "0" for USB or "rtsp://..." for WiFi)
        _video_processor = VideoProcessor(source=settings.video_source)
    return _video_processor
