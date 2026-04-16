import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mgmrhcoifdplepobunyu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nbXJoY29pZmRwbGVwb2J1bnl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxNzg3MzQsImV4cCI6MjA5MTc1NDczNH0.Rot_K5w2cPC7_PsWiAHs8gQH5ph8TNLtZNT0o9qQ4bg'

export const supabase = createClient(supabaseUrl, supabaseKey)
