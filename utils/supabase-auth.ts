import { createClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "@/utils/supabase/info";

export const supabaseAuth = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);
