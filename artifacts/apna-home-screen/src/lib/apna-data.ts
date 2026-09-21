import { getSupabaseClient } from './supabase';

export type ApnaBackendConnection = {
  connected: true;
};

/**
 * Verifies that the configured public Supabase client can reach the existing
 * APNA project without assuming any table names or changing any data.
 */
export async function verifyApnaBackendConnection(): Promise<ApnaBackendConnection> {
  const { error } = await getSupabaseClient().auth.getSession();

  if (error) {
    throw new Error(`Unable to connect to the APNA Supabase project: ${error.message}`);
  }

  return { connected: true };
}