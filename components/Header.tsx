import { Video } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b border-purple-500/20 bg-gradient-to-r from-purple-900/30 via-fuchsia-900/30 to-purple-900/30 backdrop-blur-xl py-10">
      <div className="container mx-auto px-4 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 blur-xl opacity-50"></div>
            <Video className="w-10 h-10 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 relative" strokeWidth={2} />
          </div>
          <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400">
            Watch Together
          </h1>
        </div>
        <p className="text-gray-300 text-lg">
          Sync YouTube videos and chat in real-time with WebRTC
        </p>
      </div>
    </header>
  );
}