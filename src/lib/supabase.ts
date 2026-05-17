import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hgtwkditzdtpblswaeum.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_76zRWGhHg6YbBjoO1R-AXw_W5CfDy9e';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export type AuthUser = {
  id: string;
  email: string | undefined;
  name: string;
  avatar: string | undefined;
  isGuest: boolean;
};
