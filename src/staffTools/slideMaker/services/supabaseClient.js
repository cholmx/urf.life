// Re-exports the church site's single Supabase client instead of creating a
// second one, which would fight the first over the same auth session storage.
import supabase from '../../../lib/supabase';

export { supabase };
