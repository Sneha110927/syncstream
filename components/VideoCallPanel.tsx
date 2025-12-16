"use client";

import { Video, VideoOff } from 'lucide-react';
import { useState } from 'react';

interface VideoCallPanelProps {
  isConnected: boolean;
}

export function VideoCallPanel({ isConnected }: VideoCallPanelProps) {
  const [callActive, setCallActive] = useState(false);

  const handleToggleCall = () => {
    if (isConnected) {
      setCallActive(!callActive);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900/90 to-purple-900/50 backdrop-blur-xl rounded-2xl border border-purple-500/30 shadow-2xl shadow-purple-500/20">
      {/* Header */}
      <div className="p-4 border-b border-purple-500/30">
        <div className="flex items-center gap-2 mb-1">
          <Video className="w-5 h-5 text-cyan-400" />
          <h3 className="text-white">Video Call</h3>
        </div>
        <p className="text-gray-400 text-sm">
          Start a video call with room members
        </p>
      </div>

      {/* Status / Video Area */}
      <div className="p-4">
        {!isConnected ? (
          <div className="bg-gradient-to-br from-slate-950/80 to-purple-950/40 rounded-xl p-8 text-center border border-purple-500/20">
            <p className="text-rose-400">Not connected to room</p>
          </div>
        ) : callActive ? (
          <div className="space-y-3">
            {/* Remote Video */}
            <div className="bg-gradient-to-br from-slate-950/80 to-purple-950/40 rounded-xl aspect-video flex items-center justify-center relative overflow-hidden border border-purple-500/20">
              <div className="text-center">
                <VideoOff className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Waiting for other user…</p>
              </div>
            </div>

            {/* Local Video Preview */}
            <div className="relative">
              <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/30 rounded-xl aspect-video w-32 border-2 border-cyan-400 shadow-lg shadow-cyan-400/30 flex items-center justify-center">
                <div className="text-center">
                  <Video className="w-6 h-6 text-cyan-400 mx-auto mb-1" />
                  <p className="text-gray-400 text-xs">Your video</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-slate-950/80 to-purple-950/40 rounded-xl p-8 text-center border border-purple-500/20">
            <VideoOff className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Video call not started</p>
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="p-4 border-t border-purple-500/30">
        <button
          onClick={handleToggleCall}
          disabled={!isConnected}
          className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 disabled:shadow-none"
        >
          {callActive ? (
            <>
              <VideoOff className="w-5 h-5" />
              End Video Call
            </>
          ) : (
            <>
              <Video className="w-5 h-5" />
              Start Video Call
            </>
          )}
        </button>
      </div>
    </div>
  );
}