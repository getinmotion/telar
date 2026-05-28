// This file was generated initially. Modified to tolerate missing env vars:
// the marketplace mostly uses the NestJS API (telarApi) — Supabase is only
// used in a handful of legacy spots (ProductReviews, NotifyWhenAvailable,
// ShopWishlist, OrderNotifications, etc). If VITE_SUPABASE_* are missing the
// app should still boot; only the components that actually call Supabase will
// surface an error at use-site.

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as
  | string
  | undefined;

let _supabase: SupabaseClient<Database> | null = null;
let _warned = false;

function warnMissing(prop: string) {
  if (_warned) return;
  _warned = true;
  console.warn(
    `[supabase] VITE_SUPABASE_URL/VITE_SUPABASE_PUBLISHABLE_KEY not configured. ` +
      `Calls to supabase.${prop}(...) will fail. Add them to apps/marketplace-web/.env to enable.`,
  );
}

function makeClient(): SupabaseClient<Database> {
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    // Return a Proxy that warns on first property access instead of crashing
    // the whole bundle at module load.
    return new Proxy({} as SupabaseClient<Database>, {
      get(_target, prop) {
        warnMissing(String(prop));
        // Return a no-op function so chained calls don't blow up immediately.
        if (typeof prop === 'string' && prop === 'then') return undefined;
        return () => ({
          select: () => ({ data: null, error: new Error('Supabase not configured') }),
          insert: () => ({ data: null, error: new Error('Supabase not configured') }),
          update: () => ({ data: null, error: new Error('Supabase not configured') }),
          delete: () => ({ data: null, error: new Error('Supabase not configured') }),
          eq: () => ({ data: null, error: new Error('Supabase not configured') }),
          single: () => ({ data: null, error: new Error('Supabase not configured') }),
          on: () => ({ subscribe: () => ({}) }),
          subscribe: () => ({}),
          unsubscribe: () => ({}),
        });
      },
    });
  }
  return createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

export const supabase: SupabaseClient<Database> = (_supabase ??= makeClient());
