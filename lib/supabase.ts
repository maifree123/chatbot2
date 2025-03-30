// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

// Supabase 项目的 URL 和公共 API 密钥
const SUPABASE_URL = '';
const SUPABASE_ANON_KEY = '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
