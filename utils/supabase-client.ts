import { projectId, publicAnonKey } from "./supabase/info";

const supabaseUrl = `https://${projectId}.supabase.co`;
// (supabaseUrl and publicAnonKey are currently unused in this manual client,
// but keeping them is fine if you’ll switch to the real SDK later.)

type BroadcastType = "broadcast";

type BroadcastConfig<E extends string> = {
  event: E;
};

type SupabaseSendPayload<E extends string, P> = {
  type: BroadcastType;
  event: E;
  payload: P;
};

type BroadcastCallback<P> = (payload: { payload: P }) => void;

type ListenerKey<E extends string> = `${BroadcastType}-${E}`;

type Channel<E extends string, RoomPayload, ChatPayload> = {
  on(
    type: BroadcastType,
    config: BroadcastConfig<E>,
    callback: BroadcastCallback<RoomPayload | ChatPayload>
  ): Channel<E, RoomPayload, ChatPayload>;

  send(payload: SupabaseSendPayload<E, RoomPayload | ChatPayload>): Promise<Channel<E, RoomPayload, ChatPayload>>;

  subscribe(): Channel<E, RoomPayload, ChatPayload>;
  unsubscribe(): Channel<E, RoomPayload, ChatPayload>;
};

type SupabaseLike<E extends string, RoomPayload, ChatPayload> = {
  channel(name: string): Channel<E, RoomPayload, ChatPayload>;
  removeChannel(channel: { unsubscribe?: () => unknown } | null | undefined): void;
};

// ---- Define the payloads you actually broadcast in your app ----
export type RoomUpdatePayload = { videoUrl?: string; users?: string[] };
export type ChatMessagePayload = { userId: string; username: string; text: string; timestamp: number };

// Your app uses these two events
export type AppEvent = "room-update" | "chat-message";

export const supabase: SupabaseLike<AppEvent, RoomUpdatePayload, ChatMessagePayload> = {
  channel(name: string) {
    const listeners: Partial<Record<ListenerKey<AppEvent>, BroadcastCallback<RoomUpdatePayload | ChatMessagePayload>>> =
      {};

    const channelObj: Channel<AppEvent, RoomUpdatePayload, ChatMessagePayload> = {
      on(type, config, callback) {
        const key = `${type}-${config.event}` as ListenerKey<AppEvent>;
        listeners[key] = callback;
        return channelObj;
      },

      async send(payload) {
        const key = `${payload.type}-${payload.event}` as ListenerKey<AppEvent>;
        const cb = listeners[key];
        if (cb) cb({ payload: payload.payload });
        return channelObj;
      },

      subscribe() {
        console.log(`Subscribed to channel: ${name}`);
        return channelObj;
      },

      unsubscribe() {
        console.log(`Unsubscribed from channel: ${name}`);
        return channelObj;
      },
    };

    return channelObj;
  },

  removeChannel(channel) {
    channel?.unsubscribe?.();
  },
};
