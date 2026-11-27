
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()

export const supabaseMediaBucket =
  import.meta.env.VITE_SUPABASE_MEDIA_BUCKET?.trim() || 'portfolio-media'

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabasePublishableKey,
)

export const supabase: SupabaseClient | undefined = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabasePublishableKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })
  : undefined

export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      'Supabase não está configurado. Verifique VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY.',
    )
  }
  return supabase
}
