import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dztspskgctvtnargrsxj.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6dHNwc2tnY3R2dG5hcmdyc3hqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNTc3NjQsImV4cCI6MjA5MTkzMzc2NH0.f-sgEJ24DUGQEhpPfAUi-pp6USSNRPdVLK8wmhqLUyA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
