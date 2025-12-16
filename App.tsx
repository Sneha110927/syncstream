import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { RoomControls } from '@/components/RoomControls';
import { VideoPlayer } from '@/components/VideoPlayer';
import { LiveChat } from '@/components/LiveChat';
import { VideoCallPanel } from '@/components/VideoCallPanel';
import { api } from '@/utils/api';
import { supabase } from '@/utils/supabase-client';

interface Message {
  userId: string;
  username: string;
  text: string;
  timestamp: number;
}

export default function App() {
  const [roomId, setRoomId] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [userId] = useState('user_' + Math.random().toString(36).substring(2, 10));
  const [username, setUsername] = useState('User' + Math.floor(Math.random() * 1000));
  const [messages, setMessages] = useState<Message[]>([]);
  const [roomUsers, setRoomUsers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to room changes
  useEffect(() => {
    if (!isConnected || !roomId) return;

    const channel = supabase.channel(`room:${roomId}`)
      .on('broadcast', { event: 'room-update' }, (payload) => {
        console.log('Room update received:', payload);
        const room = payload.payload;
        if (room.videoUrl && room.videoUrl !== youtubeUrl) {
          setYoutubeUrl(room.videoUrl);
          setVideoLoaded(true);
        }
        if (room.users) {
          setRoomUsers(room.users);
        }
      })
      .on('broadcast', { event: 'chat-message' }, (payload) => {
        console.log('Chat message received:', payload);
        const message = payload.payload as Message;
        setMessages(prev => {
          // Avoid duplicates
          if (prev.some(m => m.timestamp === message.timestamp && m.userId === message.userId)) {
            return prev;
          }
          return [...prev, message];
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isConnected, roomId]);

  // Load existing messages when joining
  useEffect(() => {
    if (isConnected && roomId) {
      loadMessages();
    }
  }, [isConnected, roomId]);

  const loadMessages = async () => {
    try {
      const { messages: loadedMessages } = await api.getMessages(roomId);
      setMessages(loadedMessages || []);
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  };

  const handleConnect = async () => {
    if (!roomId.trim()) return;
    
    setError(null);
    try {
      // Try to join existing room or create new one
      let result;
      try {
        result = await api.joinRoom(roomId, userId);
      } catch (err: any) {
        if (err.message?.includes('not found')) {
          // Room doesn't exist, create it
          result = await api.createRoom(roomId, userId);
        } else {
          throw err;
        }
      }
      
      setIsConnected(true);
      setRoomUsers(result.room.users || []);
      
      // Load existing video if any
      if (result.room.videoUrl) {
        setYoutubeUrl(result.room.videoUrl);
        setVideoLoaded(true);
      }
    } catch (err: any) {
      console.error('Error connecting to room:', err);
      setError(err.message || 'Failed to connect to room');
    }
  };

  const handleGenerateRoom = () => {
    const newRoomId = Math.random().toString(36).substring(2, 10).toUpperCase();
    setRoomId(newRoomId);
  };

  const handleLoadVideo = async () => {
    if (!youtubeUrl.trim() || !isConnected) return;
    
    try {
      await api.syncVideo(roomId, youtubeUrl);
      setVideoLoaded(true);
      
      // Broadcast to other users
      const channel = supabase.channel(`room:${roomId}`);
      await channel.send({
        type: 'broadcast',
        event: 'room-update',
        payload: { videoUrl: youtubeUrl, users: roomUsers }
      });
    } catch (err) {
      console.error('Error loading video:', err);
      setError('Failed to load video');
    }
  };

  const handleDisconnect = async () => {
    if (roomId && userId) {
      try {
        await api.leaveRoom(roomId, userId);
      } catch (err) {
        console.error('Error leaving room:', err);
      }
    }
    
    setIsConnected(false);
    setVideoLoaded(false);
    setMessages([]);
    setRoomUsers([]);
    setError(null);
  };

  const handleSendMessage = async (text: string) => {
    if (!isConnected || !text.trim()) return;
    
    try {
      const { message } = await api.sendMessage(roomId, userId, username, text);
      
      // Add to local state immediately
      setMessages(prev => [...prev, message]);
      
      // Broadcast to other users
      const channel = supabase.channel(`room:${roomId}`);
      await channel.send({
        type: 'broadcast',
        event: 'chat-message',
        payload: message
      });
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 text-white">
      <Header />
      
      {error && (
        <div className="container mx-auto px-4 py-2 max-w-7xl">
          <div className="bg-rose-500/20 border border-rose-500/50 text-rose-200 px-4 py-2 rounded-lg backdrop-blur-sm">
            {error}
          </div>
        </div>
      )}
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Primary Content */}
          <div className="lg:col-span-2 space-y-6">
            <RoomControls
              roomId={roomId}
              setRoomId={setRoomId}
              youtubeUrl={youtubeUrl}
              setYoutubeUrl={setYoutubeUrl}
              isConnected={isConnected}
              onConnect={handleConnect}
              onGenerateRoom={handleGenerateRoom}
              onLoadVideo={handleLoadVideo}
              roomUsers={roomUsers}
            />
            
            <VideoPlayer
              videoLoaded={videoLoaded}
              youtubeUrl={youtubeUrl}
              isConnected={isConnected}
            />
          </div>

          {/* Right Column - Chat & Video Call */}
          <div className="space-y-6">
            <LiveChat
              isConnected={isConnected}
              username={username}
              messages={messages}
              onSendMessage={handleSendMessage}
              onLogout={handleDisconnect}
            />
            
            <VideoCallPanel
              isConnected={isConnected}
            />
          </div>
        </div>
      </main>
    </div>
  );
}