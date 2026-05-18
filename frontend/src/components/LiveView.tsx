import React, { useEffect, useRef, useState } from 'react';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';

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
  const [zoom, setZoom] = useState(1);

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

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 4));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 1));
  const handleResetZoom = () => setZoom(1);

  return (
    <div className="relative w-full max-w-4xl bg-black rounded-xl overflow-hidden shadow-2xl border border-slate-800 group">
      {/* MJPEG Stream & Canvas Container */}
      <div 
        className="relative w-full h-full transition-transform duration-300 ease-out origin-center"
        style={{ transform: `scale(${zoom})` }}
      >
        <img
            ref={videoRef}
            src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/stream/video_feed`}
            alt="Live Stream"
            className="w-full h-auto block"
            onLoad={() => {
                if (videoRef.current && canvasRef.current) {
                    canvasRef.current.width = videoRef.current.clientWidth;
                    canvasRef.current.height = videoRef.current.clientHeight;
                }
            }}
        />

        <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
        />
      </div>

      {/* Zoom Controls Overlay */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={handleZoomIn}
          className="p-2 bg-black/60 hover:bg-blue-600 text-white rounded-lg backdrop-blur-md border border-white/10 transition-colors"
          title="Zoom In"
        >
          <ZoomIn size={20} />
        </button>
        <button 
          onClick={handleZoomOut}
          className="p-2 bg-black/60 hover:bg-blue-600 text-white rounded-lg backdrop-blur-md border border-white/10 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut size={20} />
        </button>
        <button 
          onClick={handleResetZoom}
          className="p-2 bg-black/60 hover:bg-blue-600 text-white rounded-lg backdrop-blur-md border border-white/10 transition-colors"
          title="Reset Zoom"
        >
          <Maximize size={20} />
        </button>
      </div>

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

      {/* Zoom Indicator */}
      {zoom > 1 && (
        <div className="absolute bottom-4 right-4 bg-blue-600/80 text-white px-2 py-1 rounded text-[10px] font-bold">
          {zoom.toFixed(2)}x Zoom
        </div>
      )}
    </div>
  );
};
