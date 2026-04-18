import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dztspskgctvtnargrsxj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6dHNwc2tnY3R2dG5hcmdyc3hqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNTc3NjQsImV4cCI6MjA5MTkzMzc2NH0.f-sgEJ24DUGQEhpPfAUi-pp6USSNRPdVLK8wmhqLUyA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
