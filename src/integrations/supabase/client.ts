// DEPRECATED: Supabase client replaced with local storage for MVP
// This file is kept as a stub to avoid import errors from legacy components

console.warn('⚠️ Supabase client is deprecated. Use localStorage utilities instead.');

import type { Database } from './types';

// Stub client that throws errors if actually used
export const supabase = {
  from: () => {
    throw new Error('Supabase is no longer used. Use localStorage utilities instead.');
  },
  auth: {
    getUser: () => {
      throw new Error('Supabase auth is no longer used. Use useFarcasterAuth instead.');
    },
    onAuthStateChange: () => {
      throw new Error('Supabase auth is no longer used. Use useFarcasterAuth instead.');
    }
  }
} as any;