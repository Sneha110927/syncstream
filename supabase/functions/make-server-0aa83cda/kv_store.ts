// import { createClient } from "npm:@supabase/supabase-js@2";

// const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
// const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
//   throw new Error("Missing Supabase env vars");
// }

// const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// export const set = async (key: string, value: unknown) => {
//   const { error } = await supabase.from("kv_store_0aa83cda").upsert({ key, value });
//   if (error) throw error;
// };

// export const get = async <T = unknown>(key: string): Promise<T | null> => {
//   const { data, error } = await supabase
//     .from("kv_store_0aa83cda")
//     .select("value")
//     .eq("key", key)
//     .maybeSingle();

//   if (error) throw error;
//   return (data?.value ?? null) as T | null;
// };

// export const del = async (key: string) => {
//   const { error } = await supabase.from("kv_store_0aa83cda").delete().eq("key", key);
//   if (error) throw error;
// };

// export const getByPrefix = async <T = unknown>(prefix: string): Promise<T[]> => {
//   const { data, error } = await supabase
//     .from("kv_store_0aa83cda")
//     .select("value")
//     .like("key", `${prefix}%`);

//   if (error) throw error;
//   return (data ?? []).map((d) => d.value as T);
// };
