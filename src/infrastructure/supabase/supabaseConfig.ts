
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()

export const supabaseMediaBucket =
  import.meta.env.VITE_SUPABASE_MEDIA_BUCKET?.trim() || 'portfolio-media'

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabasePublishableKey,
)

let client: SupabaseClient | undefined

if (isSupabaseConfigured) {
  client = createClient(
    supabaseUrl!,
    supabasePublishableKey!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  )
}

export const supabase = client
