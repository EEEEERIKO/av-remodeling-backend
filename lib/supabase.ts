import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

function isSupabaseServiceRoleKey(value: string | undefined) {
  return typeof value === 'string' && value.startsWith('eyJ') && value.includes('.') && value.length > 100;
}

const resolvedKey =
  isSupabaseServiceRoleKey(serviceRoleKey) ? serviceRoleKey : publishableKey;

const noProxy = [process.env.NO_PROXY, process.env.no_proxy, '.supabase.co']
  .filter(Boolean)
  .join(',');
process.env.NO_PROXY = noProxy;
process.env.no_proxy = noProxy;

const hasSupabaseConfig = Boolean(supabaseUrl && resolvedKey);

export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl!, resolvedKey!, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;
