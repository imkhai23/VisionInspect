"use client";

import React, { useState, useEffect } from 'react';
import { LiveView } from '@/components/LiveView';
import { predictApi } from '@/lib/api';
import { 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Camera, 
  History,
  TrendingUp,
  Settings,
  Wifi,
  Bluetooth,
  Usb,
  X,
  Save,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useLanguage } from '@/contexts/LanguageContext';

export default function RealtimeDashboard() {
  const { t, lang } = useLanguage();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showSettings, setShowSettings] = useState(false);
  const [cameraSource, setCameraSource] = useState('USB: Webcam 0');
  const [sourceType, setSourceType] = useState<'usb' | 'wifi' | 'bluetooth'>('usb');
  const [ipAddress, setIpAddress] = useState('');
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [snapshotLoading, setSnapshotLoading] = useState(false);
  const [snapshotPreview, setSnapshotPreview] = useState<string | null>(null);
  const [snapshotFile, setSnapshotFile] = useState<File | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [snapshotError, setSnapshotError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const translateLabel = (label: string) => {
    if (!label) return '';
    const l = label.toLowerCase().trim();
    if (lang === 'en') {
      const map: Record<string, string> = {
        good: 'Good',
        dent: 'Dent',
        crack: 'Crack',
        scratch: 'Scratch',
        missing_part: 'Missing Part',
        contamination: 'Contamination',
        normal: 'Normal',
      };
      return map[l] || label;
    }
    const map: Record<string, string> = {
      good: 'Đạt chất lượng',
      dent: 'Vết móp',
      crack: 'Vết nứt',
      scratch: 'Vết trầy xước',
      missing_part: 'Thiếu linh kiện',
      contamination: 'Bị nhiễm bẩn',
      normal: 'Bình thường',
    };
    return map[l] || label;
  };

  const handleCaptureSnapshot = async () => {
    if (!cameraEnabled) {
      toast.error(lang === 'vi' ? 'Hãy bật camera trước khi chụp.' : 'Please turn on the camera before capturing.');
      return;
    }

    setSnapshotLoading(true);
    setSnapshotError(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/stream/snapshot`);
      if (!response.ok) {
        throw new Error('Snapshot failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const file = new File([blob], `realtime_${Date.now()}.jpg`, { type: 'image/jpeg' });

      setSnapshotPreview((current) => {
        if (current) URL.revokeObjectURL(current);
        return url;
      });
      setSnapshotFile(file);
      setAnalysisResult(null);
      toast.success(lang === 'vi' ? 'Đã lấy khung hình từ luồng live.' : 'Captured frame from live stream.');
    } catch (error) {
      setSnapshotError(lang === 'vi' ? 'Không thể chụp khung hình từ luồng live.' : 'Unable to capture a frame from the live stream.');
      toast.error(lang === 'vi' ? 'Không thể chụp khung hình từ luồng live.' : 'Unable to capture a frame from the live stream.');
    } finally {
      setSnapshotLoading(false);
    }
  };

  const handleAnalyzeSnapshot = async () => {
    if (!snapshotFile) return;
    setAnalysisLoading(true);
    try {
      const response = await predictApi.predict(snapshotFile);
      setAnalysisResult(response.data);
      toast.success(t.analysisComplete);
    } catch (error) {
      toast.error(t.analysisFailed);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleResetSnapshot = () => {
    if (snapshotPreview) URL.revokeObjectURL(snapshotPreview);
    setSnapshotPreview(null);
    setSnapshotFile(null);
    setAnalysisResult(null);
    setSnapshotError(null);
  };

  const handleToggleCamera = () => {
    setCameraEnabled((prev) => {
      const next = !prev;
      if (!next) {
        setSnapshotError(null);
      }
      return next;
    });
  };

  const handleSaveSettings = async () => {
    if (sourceType === 'wifi' && !ipAddress) {
      toast.error(t.enterIpRtsp);
      return;
    }
    
    let finalSource = '0';
    let sourceLabel = 'USB: Webcam 0';

    if (sourceType === 'wifi') {
      finalSource = ipAddress;
      sourceLabel = `WiFi: ${ipAddress}`;
    } else if (sourceType === 'bluetooth') {
      finalSource = '1'; 
      sourceLabel = 'Bluetooth Camera';
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/stream/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: finalSource }),
      });

      if (response.ok) {
        setCameraSource(sourceLabel);
        setShowSettings(false);
        toast.success(t.connectNewSourceSuccess);
      } else {
        toast.error(t.connectSourceError);
      }
    } catch (error) {
      toast.error(t.serverError);
    }
  };

  return (
    <div className="flex flex-col space-y-6 p-6 min-h-screen bg-slate-950 text-slate-50 relative">
      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-400" />
                {t.cameraConfig}
              </h2>
              <button onClick={() => setShowSettings(false)} className="text-slate-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">{t.connectionType}</label>
                <div className="grid grid-cols-3 gap-3">
                  <button 
                    onClick={() => setSourceType('usb')}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${sourceType === 'usb' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-slate-800/50 border-slate-700 text-slate-400'}`}
                  >
                    <Usb size={20} />
                    <span className="text-[10px] font-bold">USB</span>
                  </button>
                  <button 
                    onClick={() => setSourceType('wifi')}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${sourceType === 'wifi' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-slate-800/50 border-slate-700 text-slate-400'}`}
                  >
                    <Wifi size={20} />
                    <span className="text-[10px] font-bold">WiFi (IP)</span>
                  </button>
                  <button 
                    onClick={() => setSourceType('bluetooth')}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${sourceType === 'bluetooth' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-slate-800/50 border-slate-700 text-slate-400'}`}
                  >
                    <Bluetooth size={20} />
                    <span className="text-[10px] font-bold">Bluetooth</span>
                  </button>
                </div>
              </div>

              {sourceType === 'wifi' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500">{t.ipRtspAddress}</label>
                  <input 
                    type="text" 
                    placeholder="rtsp://192.168.1.100:554/stream"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    value={ipAddress}
                    onChange={(e) => setIpAddress(e.target.value)}
                  />
                </div>
              )}

              {sourceType === 'bluetooth' && (
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl animate-in fade-in slide-in-from-top-2">
                  <p className="text-xs text-blue-300 leading-relaxed italic">
                    {t.bluetoothNote}
                  </p>
                </div>
              )}

              <button 
                onClick={handleSaveSettings}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 transition-all"
              >
                <Save size={18} /> {t.saveConfig}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            {t.realtimeTitle}
          </h1>
          <p className="text-slate-400 mt-1 flex items-center gap-2">
            <Activity className="w-4 h-4 text-green-500" />
            {t.realtimeSubtitle}
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-slate-900/50 p-3 rounded-lg border border-slate-800">
          <div className="text-right">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{t.localTime}</p>
            <p className="text-lg font-mono font-bold text-blue-400">
              {currentTime.toLocaleTimeString()}
            </p>
          </div>
          <div className="w-px h-10 bg-slate-800 mx-2" />
          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-2 text-xs font-medium text-green-400">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              {t.aiEngineActive}
            </span>
            <span className="flex items-center gap-2 text-xs font-medium text-blue-400">
              <Camera className="w-3 h-3" />
              {t.cameraActiveLabel}: {cameraSource}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Live Stream & Primary Stats */}
        <div className="lg:col-span-8 space-y-6">
          {/* Live Video Section */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-1 shadow-inner overflow-hidden">
            {cameraEnabled ? (
              <LiveView />
            ) : (
              <div className="aspect-video flex flex-col items-center justify-center bg-slate-950 text-slate-400 gap-3">
                <Camera className="w-10 h-10 text-slate-600" />
                <p className="text-sm font-medium">
                  {lang === 'vi' ? 'Camera đang tắt' : 'Camera is off'}
                </p>
                <button
                  onClick={handleToggleCamera}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold"
                >
                  {lang === 'vi' ? 'Bật camera' : 'Turn on camera'}
                </button>
              </div>
            )}
          </div>

          {/* Live camera inspection panel */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-bold flex items-center gap-2 text-white">
                  <Camera className="w-5 h-5 text-blue-400" />
                  {lang === 'vi' ? 'Kiểm tra từ camera trực tiếp' : 'Inspect from live camera'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {lang === 'vi' ? 'Chụp khung hình từ luồng live rồi kiểm tra ảnh ngay tại màn giám sát.' : 'Capture a frame from the live stream and inspect it here.'}
                </p>
              </div>
              <span className="text-[10px] font-bold bg-blue-500/10 text-blue-400 px-2 py-1 rounded border border-blue-500/20 uppercase">
                {lang === 'vi' ? 'Camera' : 'Camera'}
              </span>
            </div>

            {snapshotError && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
                {snapshotError}
              </div>
            )}

            <div className="grid md:grid-cols-[1.2fr_0.8fr] gap-4 items-start">
              <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden min-h-[260px] flex items-center justify-center relative">
                {snapshotPreview ? (
                  <img src={snapshotPreview} alt="Captured frame" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-6">
                    <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-3">
                      <Camera className="w-7 h-7 text-blue-400" />
                    </div>
                    <p className="text-sm text-slate-400">
                      {lang === 'vi' ? 'Nhấn chụp khung hình để bắt đầu.' : 'Press capture to begin.'}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleCaptureSnapshot}
                  disabled={snapshotLoading || !cameraEnabled}
                  className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-all"
                >
                  {snapshotLoading ? <Activity className="w-4 h-4 animate-pulse" /> : <Camera className="w-4 h-4" />}
                  {lang === 'vi' ? 'Chụp từ luồng live' : 'Capture from live stream'}
                </button>

                <button
                  onClick={handleAnalyzeSnapshot}
                  disabled={!snapshotFile || analysisLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 disabled:opacity-50 transition-all"
                >
                  {analysisLoading ? <Activity className="w-4 h-4 animate-pulse" /> : <Sparkles className="w-4 h-4" />}
                  {analysisLoading ? t.analyzingBtn : t.startInspectionBtn}
                </button>

                <button
                  onClick={handleResetSnapshot}
                  className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  {lang === 'vi' ? 'Xóa ảnh chụp' : 'Clear snapshot'}
                </button>
              </div>
            </div>

            {analysisResult && (
              <div className={`rounded-2xl border p-4 ${analysisResult?.label === 'good' || analysisResult?.label === 'normal' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    {analysisResult?.label === 'good' || analysisResult?.label === 'normal' ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                    )}
                    <h4 className="font-bold text-white">
                      {translateLabel(analysisResult?.label || '')}
                    </h4>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    {analysisResult?.confidence ? `${(analysisResult.confidence * 100).toFixed(1)}%` : '--'}
                  </span>
                </div>
                <p className="text-sm text-slate-400">
                  {lang === 'vi' ? 'Kết quả phân tích khung hình từ camera trực tiếp.' : 'Analysis result from the live camera frame.'}
                </p>
              </div>
            )}
          </div>

          {/* Quick Actions / Controls */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <button
              onClick={handleToggleCamera}
              className={`flex items-center justify-center gap-2 text-white font-semibold py-3 rounded-xl transition-all shadow-lg ${
                cameraEnabled
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20'
                  : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20'
              }`}
            >
              <Camera className="w-5 h-5" /> {cameraEnabled ? (lang === 'vi' ? 'Tắt camera' : 'Turn off camera') : (lang === 'vi' ? 'Bật camera' : 'Turn on camera')}
            </button>
            <button className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-3 rounded-xl border border-slate-700 transition-all">
              <Clock className="w-5 h-5" /> {t.pauseTracking}
            </button>
            <button 
              onClick={() => setShowSettings(true)}
              className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-3 rounded-xl border border-slate-700 transition-all"
            >
              <Settings className="w-5 h-5" /> {t.cameraSettings}
            </button>
            <button className="flex items-center justify-center gap-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 font-semibold py-3 rounded-xl border border-red-500/30 transition-all">
              {t.resetCounters}
            </button>
          </div>
        </div>

        {/* Right Column: Analytics & Event Log */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Real-time Event Log */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 flex flex-col h-full min-h-[500px]">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2">
                <History className="w-5 h-5 text-blue-400" />
                {t.liveInspectionLog}
              </h3>
              <span className="text-[10px] font-bold bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 uppercase">
                {t.realtime}
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-sm">
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg animate-in fade-in slide-in-from-right-2">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-red-400 font-bold uppercase text-xs flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> {t.anomalyDetected}
                  </span>
                  <span className="text-slate-500 text-[10px]">14:22:11</span>
                </div>
                <p className="text-slate-300">Product #26 flagged as <span className="text-red-400 font-bold">DEFECT</span> (94% conf)</p>
              </div>

              <div className="p-3 bg-green-500/5 border border-green-500/10 rounded-lg">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-green-400 font-bold uppercase text-xs flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> {t.perfectSurface}
                  </span>
                  <span className="text-slate-500 text-[10px]">14:22:08</span>
                </div>
                <p className="text-slate-300">Product #25 passed inspection (98% conf)</p>
              </div>

              <div className="p-3 bg-slate-800/50 border border-slate-700/50 rounded-lg">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-slate-400 font-bold uppercase text-xs">System Info</span>
                  <span className="text-slate-500 text-[10px]">14:21:45</span>
                </div>
                <p className="text-slate-400">AI Engine restarted with ByteTrack</p>
              </div>
              
              <div className="text-center py-4">
                <p className="text-xs text-slate-500 italic">{t.waitingDetections}</p>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800">
               <button className="w-full text-center py-2 text-xs font-semibold text-slate-400 hover:text-blue-400 transition-colors">
                  {t.viewFullHistory}
               </button>
            </div>
          </div>

          {/* Efficiency Metric Card */}
          <div className="bg-gradient-to-br from-indigo-900/20 to-blue-900/20 rounded-2xl border border-blue-500/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-400" />
                {t.lineEfficiency}
              </h3>
            </div>
            <div className="space-y-4">
               <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">{t.targetAchievement}</span>
                    <span className="text-slate-200 font-bold">84%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div className="bg-indigo-500 h-2 rounded-full w-[84%]" />
                  </div>
               </div>
               <p className="text-xs text-slate-500 leading-relaxed">
                  {t.lineSpeedOptimal}
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
