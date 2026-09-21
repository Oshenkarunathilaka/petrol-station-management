import { createClient } from './server'

export async function testSupabaseConnection() {
  try {
    const supabase = await createClient()
    
    // We do a simple auth query to check if connection works.
    // 'supabase.auth.getSession()' verifies the client is successfully
    // reaching Supabase using the configured URL and Anon Key.
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      return { success: false, error: error.message }
    }
    
    return { success: true, message: 'Successfully connected to Supabase.', data }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' }
  }
}
