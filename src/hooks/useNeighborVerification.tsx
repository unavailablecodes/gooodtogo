'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { NeighborVerification } from '@/types/database';

interface CreateVerificationForm {
  pet_id: string;
  interaction_type: NeighborVerification['interaction_type'];
  interaction_count: number;
  friendly_rating?: number;
  quiet_rating?: number;
  well_behaved: boolean;
}

interface UseNeighborVerificationReturn {
  verifications: NeighborVerification[];
  loading: boolean;
  error: string | null;
  fetchVerifications: (petId: string) => Promise<void>;
  createVerification: (data: CreateVerificationForm) => Promise<{ verification?: NeighborVerification; error?: string }>;
}

export function useNeighborVerification(): UseNeighborVerificationReturn {
  const [verifications, setVerifications] = useState<NeighborVerification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchVerifications = useCallback(async (petId: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('neighbor_verifications')
        .select('*')
        .eq('pet_id', petId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setVerifications(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch verifications');
    } finally {
      setLoading(false);
    }
  }, []);

  const createVerification = useCallback(async (data: CreateVerificationForm): Promise<{ verification?: NeighborVerification; error?: string }> => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { error: 'Please login to verify' };

      // Get user profile for name
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      const { data: verification, error: createError } = await supabase
        .from('neighbor_verifications')
        .insert({
          pet_id: data.pet_id,
          verifier_id: user.id,
          verifier_name: profile?.full_name || null,
          interaction_type: data.interaction_type,
          interaction_count: data.interaction_count,
          friendly_rating: data.friendly_rating || null,
          quiet_rating: data.quiet_rating || null,
          well_behaved: data.well_behaved,
        })
        .select()
        .single();

      if (createError) throw createError;

      // Add to local state
      setVerifications(prev => [verification, ...prev]);

      return { verification };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create verification';
      setError(message);
      return { error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    verifications,
    loading,
    error,
    fetchVerifications,
    createVerification,
  };
}
