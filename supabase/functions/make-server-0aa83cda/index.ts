// import { Hono } from "npm:hono";
// import { cors } from "npm:hono/cors";
// import { logger } from "npm:hono/logger";
// import type { Context } from "npm:hono";

// import * as kv from "./kv_store.ts";


// type VideoState = {
//   playing: boolean;
//   currentTime: number;
// };

// type Room = {
//   roomId: string;
//   createdAt: number;
//   users: string[];
//   videoUrl: string | null;
//   videoState: VideoState;
// };

// type ChatMessage = {
//   userId: string;
//   username: string;
//   text: string;
//   timestamp: number;
// };

// const PREFIX = "/make-server-0aa83cda";

// const app = new Hono();

// // Enable logger (safe across Hono versions)
// app.use("*", logger());

// // Enable CORS for all routes and methods
// app.use(
//   `${PREFIX}/*`,
//   cors({
//     origin: "*",
//     allowHeaders: ["Content-Type", "Authorization"],
//     allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     exposeHeaders: ["Content-Length"],
//     maxAge: 600,
//   }),
// );

// async function readJson<T>(c: Context): Promise<T | null> {
//   try {
//     return (await c.req.json()) as T;
//   } catch {
//     return null;
//   }
// }

// // Health check endpoint
// app.get(`${PREFIX}/health`, (c: Context) => c.json({ status: "ok" }));

// // Create a new room
// app.post(`${PREFIX}/room/create`, async (c: Context) => {
//   const body = await readJson<{ roomId?: string; userId?: string }>(c);
//   if (!body?.roomId || !body?.userId) {
//     return c.json({ error: "roomId and userId required" }, 400);
//   }

//   const { roomId, userId } = body;

//   const existingRoom = await kv.get<Room>(`room:${roomId}`);
//   if (existingRoom) {
//     return c.json({ error: "Room already exists" }, 409);
//   }

//   const room: Room = {
//     roomId,
//     createdAt: Date.now(),
//     users: [userId],
//     videoUrl: null,
//     videoState: { playing: false, currentTime: 0 },
//   };

//   await kv.set(`room:${roomId}`, room);
//   return c.json({ success: true, room });
// });

// // Join an existing room
// app.post(`${PREFIX}/room/join`, async (c: Context) => {
//   const body = await readJson<{ roomId?: string; userId?: string }>(c);
//   if (!body?.roomId || !body?.userId) {
//     return c.json({ error: "roomId and userId required" }, 400);
//   }

//   const { roomId, userId } = body;

//   const room = await kv.get<Room>(`room:${roomId}`);
//   if (!room) {
//     return c.json({ error: "Room not found" }, 404);
//   }

//   // Check if room is full (max 2 users)
//   if (room.users.length >= 2 && !room.users.includes(userId)) {
//     return c.json({ error: "Room is full" }, 403);
//   }

//   // Add user if not already in room
//   if (!room.users.includes(userId)) {
//     room.users = [...room.users, userId];
//     await kv.set(`room:${roomId}`, room);
//   }

//   return c.json({ success: true, room });
// });

// // Leave a room
// app.post(`${PREFIX}/room/leave`, async (c: Context) => {
//   const body = await readJson<{ roomId?: string; userId?: string }>(c);
//   if (!body?.roomId || !body?.userId) {
//     return c.json({ error: "roomId and userId required" }, 400);
//   }

//   const { roomId, userId } = body;

//   const room = await kv.get<Room>(`room:${roomId}`);
//   if (!room) {
//     return c.json({ error: "Room not found" }, 404);
//   }

//   room.users = room.users.filter((id) => id !== userId);

//   // Delete room if empty
//   if (room.users.length === 0) {
//     await kv.del(`room:${roomId}`);
//   } else {
//     await kv.set(`room:${roomId}`, room);
//   }

//   return c.json({ success: true });
// });

// // Get room state
// app.get(`${PREFIX}/room/:roomId`, async (c: Context) => {
//   const roomId = c.req.param("roomId");
//   const room = await kv.get<Room>(`room:${roomId}`);

//   if (!room) {
//     return c.json({ error: "Room not found" }, 404);
//   }

//   return c.json({ room });
// });

// // Send chat message
// app.post(`${PREFIX}/chat/send`, async (c: Context) => {
//   const body = await readJson<{
//     roomId?: string;
//     userId?: string;
//     username?: string;
//     text?: string;
//   }>(c);

//   if (!body?.roomId || !body?.userId || !body?.username || !body?.text) {
//     return c.json({ error: "roomId, userId, username, and text required" }, 400);
//   }

//   const { roomId, userId, username, text } = body;

//   const timestamp = Date.now();
//   const message: ChatMessage = { userId, username, text, timestamp };

//   await kv.set(`chat:${roomId}:${timestamp}`, message);
//   return c.json({ success: true, message });
// });

// // Get chat messages
// app.get(`${PREFIX}/chat/:roomId`, async (c: Context) => {
//   const roomId = c.req.param("roomId");

//   const messages = await kv.getByPrefix<ChatMessage>(`chat:${roomId}:`);
//   messages.sort((a, b) => a.timestamp - b.timestamp);

//   return c.json({ messages });
// });

// // Sync video state
// app.post(`${PREFIX}/video/sync`, async (c: Context) => {
//   const body = await readJson<{
//     roomId?: string;
//     videoUrl?: string | null;
//     videoState?: Partial<VideoState>;
//   }>(c);

//   if (!body?.roomId) {
//     return c.json({ error: "roomId required" }, 400);
//   }

//   const { roomId, videoUrl, videoState } = body;

//   const room = await kv.get<Room>(`room:${roomId}`);
//   if (!room) {
//     return c.json({ error: "Room not found" }, 404);
//   }

//   if (videoUrl !== undefined) {
//     room.videoUrl = videoUrl;
//   }

//   if (videoState) {
//     room.videoState = { ...room.videoState, ...videoState };
//   }

//   await kv.set(`room:${roomId}`, room);
//   return c.json({ success: true, room });
// });

// Deno.serve(app.fetch);
