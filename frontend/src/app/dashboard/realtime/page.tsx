"use client";

import React, { useState, useEffect } from 'react';
import { LiveView } from '@/components/LiveView';
import { 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Camera, 
  History,
  TrendingUp,
  Settings
} from 'lucide-react';

export default function RealtimeDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col space-y-6 p-6 min-h-screen bg-slate-950 text-slate-50">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            AI Inspection Control Center
          </h1>
          <p className="text-slate-400 mt-1 flex items-center gap-2">
            <Activity className="w-4 h-4 text-green-500" />
            Live System Monitoring — Production Line #1
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-slate-900/50 p-3 rounded-lg border border-slate-800">
          <div className="text-right">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Local Time</p>
            <p className="text-lg font-mono font-bold text-blue-400">
              {currentTime.toLocaleTimeString()}
            </p>
          </div>
          <div className="w-px h-10 bg-slate-800 mx-2" />
          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-2 text-xs font-medium text-green-400">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              AI ENGINE: ACTIVE
            </span>
            <span className="flex items-center gap-2 text-xs font-medium text-blue-400">
              <Camera className="w-3 h-3" />
              CAM: WEBCAM_01
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
            <LiveView />
          </div>

          {/* Quick Actions / Controls */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-blue-900/20">
              <Activity className="w-5 h-5" /> Start Inspection
            </button>
            <button className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-3 rounded-xl border border-slate-700 transition-all">
              <Clock className="w-5 h-5" /> Pause Tracking
            </button>
            <button className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-3 rounded-xl border border-slate-700 transition-all">
              <Settings className="w-5 h-5" /> Camera Settings
            </button>
            <button className="flex items-center justify-center gap-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 font-semibold py-3 rounded-xl border border-red-500/30 transition-all">
              Reset Counters
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
                Live Inspection Log
              </h3>
              <span className="text-[10px] font-bold bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 uppercase">
                Real-time
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-sm">
              {/* Dummy data for layout - will be replaced by live updates */}
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg animate-in fade-in slide-in-from-right-2">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-red-400 font-bold uppercase text-xs flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Defect Detected
                  </span>
                  <span className="text-slate-500 text-[10px]">14:22:11</span>
                </div>
                <p className="text-slate-300">Product #26 flagged as <span className="text-red-400 font-bold">DEFECT</span> (94% conf)</p>
              </div>

              <div className="p-3 bg-green-500/5 border border-green-500/10 rounded-lg">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-green-400 font-bold uppercase text-xs flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Good Product
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
                <p className="text-xs text-slate-500 italic">Waiting for new detections...</p>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800">
               <button className="w-full text-center py-2 text-xs font-semibold text-slate-400 hover:text-blue-400 transition-colors">
                  View Full History
               </button>
            </div>
          </div>

          {/* Efficiency Metric Card */}
          <div className="bg-gradient-to-br from-indigo-900/20 to-blue-900/20 rounded-2xl border border-blue-500/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-400" />
                Line Efficiency
              </h3>
            </div>
            <div className="space-y-4">
               <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Target Achievement</span>
                    <span className="text-slate-200 font-bold">84%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div className="bg-indigo-500 h-2 rounded-full w-[84%]" />
                  </div>
               </div>
               <p className="text-xs text-slate-500 leading-relaxed">
                  Line speed is currently optimal. Defect rate is within acceptable 2% threshold.
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
