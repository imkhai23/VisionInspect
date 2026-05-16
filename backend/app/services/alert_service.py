"""
VisionInspect Backend — Alert Service
Handles real-time notifications to Dashboard and Telegram.
"""

import os
import httpx
import asyncio
from typing import Dict, Any, Optional

class AlertService:
    """
    Service to send alerts when defects are detected.
    """
    
    def __init__(self):
        self.telegram_token = os.getenv("TELEGRAM_BOT_TOKEN")
        self.telegram_chat_id = os.getenv("TELEGRAM_CHAT_ID")
        self.enabled = bool(self.telegram_token and self.telegram_chat_id)
        print(f"[AlertService] Telegram alerts {'enabled' if self.enabled else 'disabled'}")

    async def send_defect_alert(self, product_id: int, confidence: float, snapshot_path: Optional[str] = None):
        """
        Send a defect alert to all configured channels.
        """
        message = (
            f"🚨 *DEFECT DETECTED*\n"
            f"------------------\n"
            f"Product ID: #{product_id}\n"
            f"Confidence: {confidence:.2f}%\n"
            f"Time: {asyncio.get_event_loop().time()}\n"
            f"Status: Flagged for Review"
        )
        
        # 1. Dashboard Alert (Usually handled via WebSocket in stream.py, 
        # but we could trigger a specific event here if needed)
        
        # 2. Telegram Alert
        if self.enabled:
            try:
                async with httpx.AsyncClient() as client:
                    if snapshot_path and os.path.exists(snapshot_path):
                        # Send with photo
                        with open(snapshot_path, 'rb') as f:
                            await client.post(
                                f"https://api.telegram.org/bot{self.telegram_token}/sendPhoto",
                                data={"chat_id": self.telegram_chat_id, "caption": message, "parse_mode": "Markdown"},
                                files={"photo": f}
                            )
                    else:
                        # Send text only
                        await client.post(
                            f"https://api.telegram.org/bot{self.telegram_token}/sendMessage",
                            json={"chat_id": self.telegram_chat_id, "text": message, "parse_mode": "Markdown"}
                        )
                print(f"[AlertService] Telegram alert sent for Product #{product_id}")
            except Exception as e:
                print(f"[AlertService] Telegram error: {e}")

# Singleton instance
_alert_service = AlertService()

def get_alert_service() -> AlertService:
    return _alert_service
