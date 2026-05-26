import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Thiếu VITE_SUPABASE_URL hoặc VITE_SUPABASE_ANON_KEY. Hãy cấu hình .env trước khi chạy Supabase.");
}

export const supabase = createClient(supabaseUrl || "https://example.supabase.co", supabaseAnonKey || "missing-anon-key", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export type AppRole = "student" | "teacher" | "admin";

export interface CurrentUserProfile {
  uid: string;
  name: string;
  email: string;
  isPro: boolean;
  role: AppRole;
  classCode?: string | null;
}

export async function authHeader() {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    "Content-Type": "application/json",
    ...(await authHeader()),
    ...(options.headers || {}),
  } as Record<string, string>;

  const res = await fetch(path, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.success === false) {
    throw new Error(data?.error || `API error ${res.status}`);
  }
  return data as T;
}
