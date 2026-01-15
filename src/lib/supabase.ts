import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xbukbhgkmjsyoymqyaix.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_nLrhSn9HAOfkukjlJ2tgcQ_1Znq00di';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface DatabaseBusiness {
  id: string;
  name: string;
  logo: string;
  description: string;
  created_at: string;
}

export interface DatabaseProduct {
  id: string;
  business_id: string;
  name: string;
  price: number;
  category: string;
  status: 'available' | 'sold' | 'reserved';
  description: string;
  image: string;
  posted_to_marketplace?: boolean | null; // Opcional para compatibilidad con tablas existentes
  created_at: string;
}

export interface DatabaseNotification {
  id: string;
  type: 'product_added' | 'product_updated' | 'product_sold' | 'business_added';
  title: string;
  message: string;
  link: string | null;
  business_id: string | null;
  product_id: string | null;
  read: boolean;
  created_at: string;
}
