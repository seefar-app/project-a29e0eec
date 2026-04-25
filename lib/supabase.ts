import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = 'https://ijxtavhnvzsviqtnqipe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqeHRhdmhudnpzdmlxdG5xaXBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwOTE4MTQsImV4cCI6MjA5MjY2NzgxNH0.L2Dn6ijFwN531Gx8FpyQmNM5zPV1tUUAL6-UR5FHXpc';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
