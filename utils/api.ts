import { projectId, publicAnonKey } from './supabase/info';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-0aa83cda`;

async function apiCall(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    console.error(`API Error on ${endpoint}:`, error);
    throw new Error(error.error || 'API request failed');
  }

  return response.json();
}

export const api = {
  createRoom: async (roomId: string, userId: string) => {
    return apiCall('/room/create', {
      method: 'POST',
      body: JSON.stringify({ roomId, userId }),
    });
  },

  joinRoom: async (roomId: string, userId: string) => {
    return apiCall('/room/join', {
      method: 'POST',
      body: JSON.stringify({ roomId, userId }),
    });
  },

  leaveRoom: async (roomId: string, userId: string) => {
    return apiCall('/room/leave', {
      method: 'POST',
      body: JSON.stringify({ roomId, userId }),
    });
  },

  getRoom: async (roomId: string) => {
    return apiCall(`/room/${roomId}`);
  },

  sendMessage: async (roomId: string, userId: string, username: string, text: string) => {
    return apiCall('/chat/send', {
      method: 'POST',
      body: JSON.stringify({ roomId, userId, username, text }),
    });
  },

  getMessages: async (roomId: string) => {
    return apiCall(`/chat/${roomId}`);
  },

  syncVideo: async (roomId: string, videoUrl?: string, videoState?: { playing?: boolean; currentTime?: number }) => {
    return apiCall('/video/sync', {
      method: 'POST',
      body: JSON.stringify({ roomId, videoUrl, videoState }),
    });
  },
};
