"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { Header } from "@/components/Header";
import { RoomControls } from "@/components/RoomControls";
import { VideoPlayer } from "@/components/VideoPlayer";
import { LiveChat } from "@/components/LiveChat";
import { VideoCallPanel } from "@/components/VideoCallPanel";

import { api } from "@/utils/api";
import { supabase } from "@/utils/supabase-client"; // ✅ mock realtime
import { supabaseAuth } from "@/utils/supabase-auth"; // ✅ real auth

interface Message {
  userId: string;
  username: string;
  text: string;
  timestamp: number;
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;

  if (err && typeof err === "object" && "message" in err) {
    const maybeMessage = (err as { message?: unknown }).message;
    if (typeof maybeMessage === "string") return maybeMessage;
  }
  return "Unknown error";
}

function errorMessageIncludes(err: unknown, needle: string): boolean {
  return getErrorMessage(err).toLowerCase().includes(needle.toLowerCase());
}

export default function App() {
  const router = useRouter();

  const [ready, setReady] = useState(false);

  const [roomId, setRoomId] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");

  const [messages, setMessages] = useState<Message[]>([]);
  const [roomUsers, setRoomUsers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // ✅ AUTH GUARD
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { data } = await supabaseAuth.auth.getSession();
      if (!data.session) {
        router.replace("/signin");
        return;
      }

      const { data: userData } = await supabaseAuth.auth.getUser();
      const u = userData.user;

      const name =
        (u?.user_metadata?.full_name as string | undefined) ||
        (u?.email ? u.email.split("@")[0] : undefined) ||
        "User";

      if (!mounted) return;

      setUserId(u?.id ?? "");
      setUsername(name);
      setReady(true);
    };

    void init();

    const { data: sub } = supabaseAuth.auth.onAuthStateChange((_evt, session) => {
      if (!session) router.replace("/signin");
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [router]);

  // ✅ Realtime subscribe (only when ready + connected)
  useEffect(() => {
    if (!ready || !isConnected || !roomId) return;

    const channel = supabase
      .channel(`room:${roomId}`)
      .on("broadcast", { event: "room-update" }, (payload) => {
        const room = payload.payload as { videoUrl?: string; users?: string[] };

        if (room.videoUrl && room.videoUrl !== youtubeUrl) {
          setYoutubeUrl(room.videoUrl);
          setVideoLoaded(true);
        }
        if (room.users) setRoomUsers(room.users);
      })
      .on("broadcast", { event: "chat-message" }, (payload) => {
        const message = payload.payload as Message;

        setMessages((prev) => {
          if (prev.some((m) => m.timestamp === message.timestamp && m.userId === message.userId)) {
            return prev;
          }
          return [...prev, message];
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, isConnected, roomId, youtubeUrl]);

  useEffect(() => {
    if (!ready) return;
    if (isConnected && roomId) void loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, isConnected, roomId]);

  const loadMessages = async () => {
    try {
      const { messages: loadedMessages } = await api.getMessages(roomId);
      setMessages(loadedMessages || []);
    } catch (err: unknown) {
      console.error("Error loading messages:", err);
    }
  };

  const handleConnect = async () => {
    if (!roomId.trim() || !userId) return;

    setError(null);
    try {
      let result: { room: { users?: string[]; videoUrl?: string } };

      try {
        result = await api.joinRoom(roomId, userId);
      } catch (err: unknown) {
        if (errorMessageIncludes(err, "not found")) {
          result = await api.createRoom(roomId, userId);
        } else {
          throw err;
        }
      }

      setIsConnected(true);
      setRoomUsers(result.room.users || []);

      if (result.room.videoUrl) {
        setYoutubeUrl(result.room.videoUrl);
        setVideoLoaded(true);
      }
    } catch (err: unknown) {
      console.error("Error connecting to room:", err);
      setError(getErrorMessage(err) || "Failed to connect to room");
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

      const channel = supabase.channel(`room:${roomId}`);
      await channel.send({
        type: "broadcast",
        event: "room-update",
        payload: { videoUrl: youtubeUrl, users: roomUsers },
      });
    } catch (err: unknown) {
      console.error("Error loading video:", err);
      setError("Failed to load video");
    }
  };

  const handleDisconnect = async () => {
    if (roomId && userId) {
      try {
        await api.leaveRoom(roomId, userId);
      } catch (err: unknown) {
        console.error("Error leaving room:", err);
      }
    }

    setIsConnected(false);
    setVideoLoaded(false);
    setMessages([]);
    setRoomUsers([]);
    setError(null);
  };

  const handleLogout = async () => {
    await handleDisconnect();
    await supabaseAuth.auth.signOut();
    router.replace("/signin");
  };

  const handleSendMessage = async (text: string) => {
    if (!isConnected || !text.trim()) return;

    try {
      const { message } = await api.sendMessage(roomId, userId, username, text);
      setMessages((prev) => [...prev, message]);

      const channel = supabase.channel(`room:${roomId}`);
      await channel.send({
        type: "broadcast",
        event: "chat-message",
        payload: message,
      });
    } catch (err: unknown) {
      console.error("Error sending message:", err);
      setError("Failed to send message");
    }
  };

  // ✅ Render guard INSIDE return (no early return before hooks)
  if (!ready) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 text-white grid place-items-center">
        <div className="text-white/70">Loading...</div>
      </div>
    );
  }

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

            <VideoPlayer videoLoaded={videoLoaded} youtubeUrl={youtubeUrl} isConnected={isConnected} />
          </div>

          <div className="space-y-6">
            <LiveChat
              isConnected={isConnected}
              username={username}
              messages={messages}
              onSendMessage={handleSendMessage}
              onLogout={handleLogout}
            />

            <VideoCallPanel isConnected={isConnected} />
          </div>
        </div>
      </main>
    </div>
  );
}
