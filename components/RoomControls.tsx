import { Radio, Hash, Youtube, Users } from 'lucide-react';

interface RoomControlsProps {
  roomId: string;
  setRoomId: (id: string) => void;
  youtubeUrl: string;
  setYoutubeUrl: (url: string) => void;
  isConnected: boolean;
  onConnect: () => void;
  onGenerateRoom: () => void;
  onLoadVideo: () => void;
  roomUsers: string[];
}

export function RoomControls({
  roomId,
  setRoomId,
  youtubeUrl,
  setYoutubeUrl,
  isConnected,
  onConnect,
  onGenerateRoom,
  onLoadVideo,
  roomUsers,
}: RoomControlsProps) {
  return (
    <div className="bg-gradient-to-br from-slate-900/90 to-purple-900/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30 shadow-2xl shadow-purple-500/20">
      <div className="space-y-4">
        {/* Room ID */}
        <div>
          <label className="flex items-center gap-2 mb-2 text-purple-300">
            <Hash className="w-4 h-4" />
            Room ID
          </label>
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Enter or generate room ID"
            className="w-full bg-slate-950/70 border border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/50 transition-all"
            disabled={isConnected}
          />
        </div>

        {/* YouTube URL */}
        <div>
          <label className="flex items-center gap-2 mb-2 text-purple-300">
            <Youtube className="w-4 h-4" />
            YouTube URL
          </label>
          <input
            type="text"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="Paste YouTube URL here"
            className="w-full bg-slate-950/70 border border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/50 transition-all"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={onConnect}
            disabled={isConnected || !roomId.trim()}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 disabled:shadow-none"
          >
            <Radio className="w-4 h-4" />
            {isConnected ? 'Connected' : 'Connect to Room'}
          </button>
          
          <button
            onClick={onGenerateRoom}
            disabled={isConnected}
            className="bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 disabled:from-gray-800 disabled:to-gray-800 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl transition-all"
          >
            Generate Room
          </button>
          
          <button
            onClick={onLoadVideo}
            disabled={!isConnected || !youtubeUrl.trim()}
            className="bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 disabled:from-gray-800 disabled:to-gray-800 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl transition-all"
          >
            Load Video
          </button>
        </div>

        {/* Status */}
        <div className="pt-2 space-y-2">
          {isConnected ? (
            <>
              <p className="text-emerald-400 flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></span>
                Connected to room: <span className="font-mono text-purple-300">{roomId}</span>
              </p>
              <p className="text-gray-300 flex items-center gap-2 text-sm">
                <Users className="w-4 h-4" />
                {roomUsers.length} / 2 users in room
              </p>
            </>
          ) : (
            <p className="text-rose-400">
              Disconnected – Enter a room ID and click Connect
            </p>
          )}
        </div>
      </div>
    </div>
  );
}