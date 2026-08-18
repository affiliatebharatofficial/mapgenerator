import { createClient } from '@supabase/supabase-js';

const SUPABASE_PROJECT_URL = 'https://dfbsrpywboxxigpmhqlx.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmYnNycHl3Ym94eGlncG1ocWx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0MjM5MTAsImV4cCI6MjEwMTk5OTkxMH0.jcQVnPRwLEKySTufJse7cqB2kp_MxJq-78lIrlcgw08';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || SUPABASE_PROJECT_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'implicit'
  }
});
