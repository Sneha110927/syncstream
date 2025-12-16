import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-0aa83cda/health", (c) => {
  return c.json({ status: "ok" });
});

// Create a new room
app.post("/make-server-0aa83cda/room/create", async (c) => {
  try {
    const { roomId, userId } = await c.req.json();
    
    if (!roomId || !userId) {
      return c.json({ error: "roomId and userId required" }, 400);
    }

    // Check if room already exists
    const existingRoom = await kv.get(`room:${roomId}`);
    if (existingRoom) {
      return c.json({ error: "Room already exists" }, 409);
    }

    const room = {
      roomId,
      createdAt: Date.now(),
      users: [userId],
      videoUrl: null,
      videoState: { playing: false, currentTime: 0 }
    };

    await kv.set(`room:${roomId}`, room);
    return c.json({ success: true, room });
  } catch (error) {
    console.log(`Error creating room: ${error}`);
    return c.json({ error: "Failed to create room" }, 500);
  }
});

// Join an existing room
app.post("/make-server-0aa83cda/room/join", async (c) => {
  try {
    const { roomId, userId } = await c.req.json();
    
    if (!roomId || !userId) {
      return c.json({ error: "roomId and userId required" }, 400);
    }

    const room = await kv.get(`room:${roomId}`);
    if (!room) {
      return c.json({ error: "Room not found" }, 404);
    }

    // Check if room is full (max 2 users)
    if (room.users.length >= 2 && !room.users.includes(userId)) {
      return c.json({ error: "Room is full" }, 403);
    }

    // Add user if not already in room
    if (!room.users.includes(userId)) {
      room.users.push(userId);
      await kv.set(`room:${roomId}`, room);
    }

    return c.json({ success: true, room });
  } catch (error) {
    console.log(`Error joining room: ${error}`);
    return c.json({ error: "Failed to join room" }, 500);
  }
});

// Leave a room
app.post("/make-server-0aa83cda/room/leave", async (c) => {
  try {
    const { roomId, userId } = await c.req.json();
    
    if (!roomId || !userId) {
      return c.json({ error: "roomId and userId required" }, 400);
    }

    const room = await kv.get(`room:${roomId}`);
    if (!room) {
      return c.json({ error: "Room not found" }, 404);
    }

    room.users = room.users.filter((id: string) => id !== userId);
    
    // Delete room if empty
    if (room.users.length === 0) {
      await kv.del(`room:${roomId}`);
    } else {
      await kv.set(`room:${roomId}`, room);
    }

    return c.json({ success: true });
  } catch (error) {
    console.log(`Error leaving room: ${error}`);
    return c.json({ error: "Failed to leave room" }, 500);
  }
});

// Get room state
app.get("/make-server-0aa83cda/room/:roomId", async (c) => {
  try {
    const roomId = c.req.param("roomId");
    const room = await kv.get(`room:${roomId}`);
    
    if (!room) {
      return c.json({ error: "Room not found" }, 404);
    }

    return c.json({ room });
  } catch (error) {
    console.log(`Error getting room: ${error}`);
    return c.json({ error: "Failed to get room" }, 500);
  }
});

// Send chat message
app.post("/make-server-0aa83cda/chat/send", async (c) => {
  try {
    const { roomId, userId, username, text } = await c.req.json();
    
    if (!roomId || !userId || !username || !text) {
      return c.json({ error: "roomId, userId, username, and text required" }, 400);
    }

    const timestamp = Date.now();
    const message = { userId, username, text, timestamp };
    
    await kv.set(`chat:${roomId}:${timestamp}`, message);
    return c.json({ success: true, message });
  } catch (error) {
    console.log(`Error sending chat message: ${error}`);
    return c.json({ error: "Failed to send message" }, 500);
  }
});

// Get chat messages
app.get("/make-server-0aa83cda/chat/:roomId", async (c) => {
  try {
    const roomId = c.req.param("roomId");
    const messages = await kv.getByPrefix(`chat:${roomId}:`);
    
    // Sort by timestamp
    const sortedMessages = messages.sort((a: any, b: any) => a.timestamp - b.timestamp);
    
    return c.json({ messages: sortedMessages });
  } catch (error) {
    console.log(`Error getting chat messages: ${error}`);
    return c.json({ error: "Failed to get messages" }, 500);
  }
});

// Sync video state
app.post("/make-server-0aa83cda/video/sync", async (c) => {
  try {
    const { roomId, videoUrl, videoState } = await c.req.json();
    
    if (!roomId) {
      return c.json({ error: "roomId required" }, 400);
    }

    const room = await kv.get(`room:${roomId}`);
    if (!room) {
      return c.json({ error: "Room not found" }, 404);
    }

    if (videoUrl !== undefined) {
      room.videoUrl = videoUrl;
    }
    
    if (videoState) {
      room.videoState = { ...room.videoState, ...videoState };
    }

    await kv.set(`room:${roomId}`, room);
    return c.json({ success: true, room });
  } catch (error) {
    console.log(`Error syncing video state: ${error}`);
    return c.json({ error: "Failed to sync video" }, 500);
  }
});

Deno.serve(app.fetch);