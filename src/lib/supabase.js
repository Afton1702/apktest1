import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nqbnnzmxpvddcfiamjgr.supabase.co';
const supabaseKey = 'sb_publishable_JW1u1LYuU0z1Bj0czFpJ0w_QtJvL5V_';

export const supabase = createClient(supabaseUrl, supabaseKey);