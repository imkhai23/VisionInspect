"""
VisionInspect API — Streaming Router
Provides MJPEG and WebSocket endpoints for real-time monitoring.
"""

import asyncio
import json
from pydantic import BaseModel
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Response, HTTPException
from fastapi.responses import StreamingResponse
from app.services.video_service import get_video_processor

router = APIRouter(prefix="/api/v1/stream", tags=["Streaming"])

class StreamSettingsRequest(BaseModel):
    source: str

@router.post("/settings")
async def update_stream_settings(payload: StreamSettingsRequest):
    """Updates the camera source dynamically."""
    processor = get_video_processor()
    try:
        processor.set_source(payload.source)
        return {"ok": True, "source": payload.source}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/video_feed")
async def video_feed():
    """MJPEG video stream endpoint."""
    processor = get_video_processor()
    processor.start()
    
    def generate():
        while True:
            frame = processor.get_frame()
            if frame:
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
            else:
                # Small sleep to prevent busy waiting if no frame
                import time
                time.sleep(0.01)

    return StreamingResponse(generate(), media_type="multipart/x-mixed-replace; boundary=frame")


@router.get("/snapshot")
async def get_snapshot():
    """Returns the current frame as a static JPEG image."""
    processor = get_video_processor()
    processor.start()
    frame = processor.get_frame()
    if frame:
        return Response(content=frame, media_type="image/jpeg")
    return Response(status_code=404, content="No frame available")


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket for real-time metadata and stats."""
    await websocket.accept()
    processor = get_video_processor()
    processor.start()
    
    try:
        while True:
            # Check for incoming messages (e.g., to change settings)
            # but mainly we just push data
            metadata = processor.get_metadata()
            if metadata:
                await websocket.send_json(metadata)
            
            # Small delay to match frame rate or reduce CPU usage
            await asyncio.sleep(0.03) # ~30 FPS
            
    except WebSocketDisconnect:
        print("[WebSocket] Client disconnected")
    except Exception as e:
        print(f"[WebSocket] Error: {e}")
