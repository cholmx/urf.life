// Re-exports the church site's single Supabase client instead of creating a
// second one. Two separate createClient() instances against the same project
// would both try to manage the same localStorage auth token and trigger
// "Multiple GoTrueClient instances" warnings/conflicts.
import supabase from '../../lib/supabase';

export { supabase };
