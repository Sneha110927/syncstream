import { Play } from 'lucide-react';

interface VideoPlayerProps {
  videoLoaded: boolean;
  youtubeUrl: string;
  isConnected: boolean;
}

function getYouTubeVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export function VideoPlayer({ videoLoaded, youtubeUrl, isConnected }: VideoPlayerProps) {
  const videoId = getYouTubeVideoId(youtubeUrl);

  return (
    <div className="bg-gradient-to-br from-slate-900/90 to-purple-900/50 backdrop-blur-xl rounded-2xl border border-purple-500/30 shadow-2xl shadow-purple-500/20 overflow-hidden">
      {videoLoaded && videoId ? (
        <div className="relative" style={{ paddingBottom: '56.25%' }}>
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-slate-950/80 to-purple-950/40">
          <div className="text-center px-4">
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 blur-2xl opacity-30"></div>
              <Play className="w-20 h-20 text-purple-400 relative" />
            </div>
            <p className="text-gray-300 text-lg">
              {isConnected
                ? 'Enter a YouTube URL and click Load Video to start watching together'
                : 'Connect to a room first, then load a video'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}