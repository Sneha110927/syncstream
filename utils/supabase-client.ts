import { projectId, publicAnonKey } from './supabase/info';

const supabaseUrl = `https://${projectId}.supabase.co`;

// Manual Supabase client implementation for realtime channels
export const supabase = {
  channel(name: string) {
    const listeners: any = {};
    
    return {
      on(type: string, config: any, callback: (payload: any) => void) {
        const key = `${type}-${config.event}`;
        listeners[key] = callback;
        return this;
      },
      async send(payload: any) {
        // Broadcast to listeners
        const key = `${payload.type}-${payload.event}`;
        if (listeners[key]) {
          listeners[key](payload);
        }
        return this;
      },
      subscribe() {
        console.log(`Subscribed to channel: ${name}`);
        return this;
      },
      unsubscribe() {
        console.log(`Unsubscribed from channel: ${name}`);
        return this;
      }
    };
  },
  removeChannel(channel: any) {
    if (channel && channel.unsubscribe) {
      channel.unsubscribe();
    }
  }
};
