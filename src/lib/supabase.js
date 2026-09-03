import { createClient } from '@supabase/supabase-js'

// Get Supabase credentials from environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Test connection
const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('announcements_portal123')
      .select('count', { count: 'exact', head: true })

    if (error) {
      console.error('Supabase connection error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Supabase connection failed:', error)
    return false
  }
}

// Test connection on module load
testConnection()

export default supabase