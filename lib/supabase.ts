// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

// Supabase 项目的 URL 和公共 API 密钥
const SUPABASE_URL = 'https://uhqmcsokbrqdhzgcxdrz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVocW1jc29rYnJxZGh6Z2N4ZHJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzczODgxNjMsImV4cCI6MjA1Mjk2NDE2M30.JjaOgRDSWZ_gmvyjRwQPNqjD8Qrt9wYob9FmuLRR0S4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
