"use client";

import React, { useEffect, useRef, useState } from 'react';

interface TrackedObject {
  track_id: number;
  label: string;
  confidence: number;
  bbox: [number, number, number, number];
  status: string;
}

interface Metadata {
  objects: TrackedObject[];
  stats: {
    total: number;
    good: number;
    defect: number;
    fps: number;
  };
  timestamp: number;
}

export const LiveView: React.FC = () => {
  const videoRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stats, setStats] = useState({ total: 0, good: 0, defect: 0, fps: 0 });
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const wsUrl = backendUrl.replace('http', 'ws') + '/api/v1/stream/ws';
    
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('[WS] Connected');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const data: Metadata = JSON.parse(event.data);
      setStats(data.stats);
      drawOverlay(data.objects);
    };

    ws.onclose = () => {
      console.log('[WS] Disconnected');
      setIsConnected(false);
    };

    return () => ws.close();
  }, []);

  const drawOverlay = (objects: TrackedObject[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    objects.forEach((obj) => {
      const [x1, y1, x2, y2] = obj.bbox;
      const width = x2 - x1;
      const height = y2 - y1;

      // Set style based on status
      const color = obj.status === 'GOOD' ? '#10b981' : '#ef4444';
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      
      // Draw box
      ctx.strokeRect(x1, y1, width, height);

      // Draw label background
      ctx.fillStyle = color;
      const label = `ID:${obj.track_id} ${obj.label}`;
      const textWidth = ctx.measureText(label).width;
      ctx.fillRect(x1, y1 - 25, textWidth + 10, 25);

      // Draw label text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.fillText(label, x1 + 5, y1 - 7);
    });
  };

  return (
    <div className="relative w-full max-w-4xl bg-black rounded-xl overflow-hidden shadow-2xl border border-slate-800">
      {/* MJPEG Stream */}
      <img
        ref={videoRef}
        src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/stream/video_feed`}
        alt="Live Stream"
        className="w-full h-auto"
        onLoad={() => {
            // Match canvas size to image size
            if (videoRef.current && canvasRef.current) {
                canvasRef.current.width = videoRef.current.clientWidth;
                canvasRef.current.height = videoRef.current.clientHeight;
            }
        }}
      />

      {/* Canvas Overlay for Bounding Boxes */}
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
      />

      {/* Connection Status Badge */}
      <div className="absolute top-4 right-4 flex items-center space-x-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
        <span className="text-xs font-medium text-white uppercase tracking-wider">
          {isConnected ? 'Live' : 'Offline'}
        </span>
      </div>

      {/* Real-time Stats Overlay (Small) */}
      <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md p-3 rounded-lg border border-white/10 text-white">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <span className="text-slate-400">Total:</span>
          <span className="font-bold">{stats.total}</span>
          <span className="text-slate-400">Good:</span>
          <span className="text-green-400 font-bold">{stats.good}</span>
          <span className="text-slate-400">Defect:</span>
          <span className="text-red-400 font-bold">{stats.defect}</span>
        </div>
      </div>
    </div>
  );
};
